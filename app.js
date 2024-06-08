import express from "express";
import nunjucks from "nunjucks";
import morgan from "morgan";
import session from "express-session";
import users from "./users.json" assert { type: "json" };
import stuffedAnimalData from "./stuffed-animal-data.json" assert { type: "json" };

const app = express();
const port = "8000";

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
  session({ secret: "ssshhhhh", saveUninitialized: true, resave: false })
);

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

// Gets info for a specific animal
function getAnimalDetails(animalId) {
  return stuffedAnimalData[animalId];
}

app.get("/", (req, res) => {
  res.render("index.html");
});

// Animals homepage
app.get("/all-animals", (req, res) => {
  res.render("all-animals.html.njk", {
    animals: Object.values(stuffedAnimalData),
  });
});

// Page for individual animals
app.get("/animal-details/:animalId", (req, res) => {
  const animalDetails = getAnimalDetails(req.params.animalId);
  res.render("animal-details.html.njk", { animal: animalDetails });
});

app.get("/add-to-cart/:animalId", (req, res) => {
  const sesh = req.session;
  const animalId = req.params.animalId;

  if (!sesh.cart) {
    sesh.cart = {};
  }
  if (!sesh.cart[animalId]) {
    sesh.cart[animalId] = 0;
  }
  sesh.cart[animalId] += 1;

  console.log(sesh);
  res.redirect("/cart");
});

app.get("/cart", (req, res) => {
  const sesh = req.session;
  const cart = sesh.cart;

  const animalsInCart = [];
  let total = 0;

  for (const animal in cart) {
    const animalObj = getAnimalDetails(animal);
    animalObj["quantity"] = cart[`${animal}`];
    const subtotal = animalObj["quantity"] * animalObj["price"];
    animalObj["subtotal"] = subtotal;
    total += subtotal;
    console.log(total);
    animalsInCart.push(animalObj);
  }

  if (sesh["username"]) {
    const user = sesh.username;
    res.render("cart.html.njk", {
      animalsInCart: animalsInCart,
      total: total,
      user: user,
    });
  } else {
    res.render("cart.html.njk", {
      animalsInCart: animalsInCart,
      total: total,
    });
  }
});

app.get("/checkout", (req, res) => {
  req.session.cart = {};
  res.redirect("/all-animals");
});

app.get("/login", (req, res) => {
  res.render("login.html.njk");
});

app.post("/process-login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const isUser = (un, pw) => {
    for (const user of users) {
      if (un === user.username && pw === user.password) {
        return true;
      }
    }
  };

  if (isUser(username, password)) {
    const sesh = req.session;
    sesh["username"] = username;
    res.redirect("/all-animals");
    console.log(sesh);
  } else {
    const error = "Please enter a valid username and password.";
    res.render("login.html.njk", {
      error: error,
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/all-animals");
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}...`);
});
