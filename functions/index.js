const functions = require("firebase-functions");
const { db } = require("./util/admin");
const fbAuth = require("./util/fbAuth");
const app = require("express")();

const { signup, login } = require("./handlers/users");
const {addPet, updatePet, deletePet} = require("./handlers/pets")

//user posts
app.post("/register", signup);
app.post("/login", login);


//pet posts
app.post("/addpet",fbAuth,addPet)
app.put("/updatepet/:id",fbAuth,updatePet)
app.delete("/deletepet/:id",fbAuth,deletePet)

exports.api = functions.region("europe-west").https.onRequest(app);
