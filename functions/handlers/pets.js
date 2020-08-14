const firebase = require("firebase");
const config = require("../util/config");
const { db, admin } = require("../util/admin");

exports.addPet = (req, res) => {
  const newPet = {
    kind: req.body.kind,
    age: req.body.age,
    weight: req.body.weight,
    breed: req.body.breed,
    sex: req.body.sex,
  };

  db.collection("pets")
    .add(newPet)
    .then((doc) => {
      const resPet = newPet;
      resPet.petId = doc.id;
      console.log(resPet.petId);
      return res.json(resPet);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.updatePet = (req, res) => {
  const newInfos = {
    kind: req.body.kind,
    age: req.body.age,
    weight: req.body.weight,
    breed: req.body.breed,
    sex: req.body.sex,
  };
  db.collection("pets")
    .doc(req.params.id)
    .update(newInfos)
    .then(() => {
      res.status(200).json({ success: true, message: "Update Done" });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deletePet = (req, res) => {
  const petDocument = db.doc(`/pets/${req.params.id}`);
  petDocument
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Pet not found" });
      } else {
        return petDocument.delete();
      }
    })
    .then(() => {
      return res.json({ message: "Pet deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.getDogs = (req,res) => {
  db.collection("pets")
  .where("kind","==","dog")
  .get()
  .then((data) => {
    let dogs = [];
    data.forEach((doc) => {
      dogs.push({
        petId: doc.id,
        age: doc.data().age,
        weight: doc.data().weight,
        breed: doc.data().breed,
        sex: doc.data().sex,
      });
    });
    return res.json(dogs);
  })
  .catch((err) => console.log(err));

}

exports.getCats = (req,res) => {
  db.collection("pets")
  .where("kind","==","cat")
  .get()
  .then((data) => {
    let cats = [];
    data.forEach((doc) => {
      dogs.push({
        petId: doc.id,
        age: doc.data().age,
        weight: doc.data().weight,
        breed: doc.data().breed,
        sex: doc.data().sex,
      });
    });
    return res.json(cats);
  })
  .catch((err) => console.log(err));
}

exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });
  let imageFileName;
  let imageToBeUploaded;
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file Type Submitted" });
    }
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${Math.round(
      Math.random() * 1000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.google.apis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/pets/${req.params.petId}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "Image uploaded succesfully " });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });

  busboy.end(req.rawBody);
};
