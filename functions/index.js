const functions = require("firebase-functions");
const { db } = require("./util/admin");
const fbAuth = require("./util/fbAuth");
const app = require("express")();
const cors = require("cors")

const { signup, login } = require("./handlers/users");
const {
  addPet,
  updatePet,
  deletePet,
  getCats,
  getDogs,
  uploadImage,
} = require("./handlers/pets");


app.use(cors())
//user posts
app.post("/register", signup);
app.post("/login", login);

//pet posts
app.post("/addpet",  addPet);
app.put("/updatepet/:id",  updatePet);
app.delete("/deletepet/:id",  deletePet);
app.post("/:petId/uploadimg",uploadImage)

//get requsets

app.get("/dogs", getDogs);
app.get("/cats", getCats);

exports.api = functions.region("europe-west3").https.onRequest(app);
