const firebase = require("firebase");
const config = require("../util/config");
firebase.initializeApp(config);
const { db, admin } = require("../util/admin");

exports.signup = (req, res) => {
  const newUser = {
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    surname: req.body.surname,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  let token, userId;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ username: "this username is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredientals = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId,
      };
      console.log(userCredientals);
      return db.doc(`/users/${newUser.username}`).set(userCredientals);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        console.log(err);
        return res
          .status(500)
          .json({ general: "Something went wrong , please try again" });
      }
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.log(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credientals , please try again" });
      }
      if (err.code === "auth/user-not-found") {
        return res
          .status(400)
          .json({ general: "There is no such an user with this email" });
      }
      return res.status(500).json({ error: err.code });
    });
};
