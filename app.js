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

function getAnimalDetails(animalId) {
  return stuffedAnimalData[animalId];
}

app.get("/", (req, res) => {
  res.render("index.html");
});

app.get("/all-animals", (req, res) => {
  res.render("all-animals.html.njk", {
    animals: Object.values(stuffedAnimalData),
  });
});

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

  console.log(sesh.cart);
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

  // Make sure your function can also handle the case where no cart has
  // been added to the session

  res.render("cart.html.njk", { animalsInCart: animalsInCart, total: total });
});

app.get("/checkout", (req, res) => {
  // Empty the cart.
  req.session.cart = {};
  res.redirect("/all-animals");
});

app.get("/login", (req, res) => {
  // TODO: Implement this
  res.send("Login has not been implemented yet!");
});

app.post("/process-login", (req, res) => {
  // TODO: Implement this
  res.send("Login has not been implemented yet!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}...`);
});
