const Sauce = require("../models/Sauce");
const fs = require("fs");

//----------------------------------------CRUD----------------------------------------//

//----------------------------------------CREATE----------------------------------------//

exports.createSauce = (req, res, next) => {
  const sauceSended = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceSended,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce enregistrée" });
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  let like = req.body.like;
  let user = req.body.userId;
  Sauce.findOne({ _id: req.params._id })
    .then((sauce) => {
      let likes = sauce.likes;
      let dislikes = sauce.dislikes;
      let usersLiked = sauce.usersLiked;
      let usersDisliked = sauce.usersDisliked;
      if (like == 1) {
        likes++;
        usersLiked.push(user);
        Sauce.updateOne(
          { _id: req.params._id },
          { likes: likes, usersLiked: usersLiked }
        ).then(() => {
          res.status(200).json({ message: "Like ajouté" });
          console.log(sauce);
        });
      } else if (like == -1) {
        dislikes++;
        usersDisliked.push(user);
        Sauce.updateOne(
          { _id: req.params._id },
          { dislikes: dislikes, usersDisliked: usersDisliked }
        ).then(() => res.status(200).json({ message: "Dislike ajouté" }));
      } else if (like == 0) {
        for (let i = 0; i < usersLiked.length; i++) {
          if (usersLiked[i] == user) {
            usersLiked.splice(i, 1);
            likes--;
            Sauce.updateOne(
              { _id: req.params._id },
              { likes: likes, usersLiked: usersLiked }
            ).then(() => res.status(200).json({ message: "Like retiré !" }));
            return false;
          }
        }
        for (let i = 0; i < usersDisliked.length; i++) {
          if (usersDisliked[i] == user) {
            usersDisliked.splice(i, 1);
            dislikes--;
            Sauce.updateOne(
              { _id: req.params._id },
              { dislikes: dislikes, usersDisliked: usersDisliked }
            ).then(() => res.status(200).json({ message: "Dislike retiré !" }));
          }
        }
      }
      console.log(sauce);
    })
    .catch((error) => res.status(400).json({ error }));
};
//----------------------------------------READ----------------------------------------//
exports.getSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params._id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//----------------------------------------UPDATE----------------------------------------//

exports.updateSauce = (req, res, next) => {
  const isFileName = req.file;
  if (isFileName) {
    Sauce.findOne({ _id: req.params._id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images")[1];
        fs.unlink(`images/${filename}`, () => {});
      })
      .catch((error) => res.status(400).json({ error }));
  }
  const sauceUpdated = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params._id },
    { ...sauceUpdated, _id: req.params._id }
  )
    .then(() => res.status(200).json({ message: "Sauce mise à jour !" }))
    .catch((error) => res.status(400).json({ error }));
};

//----------------------------------------DELETE----------------------------------------//

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params._id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params._id })
          .then(() => res.Status(200).json({ message: "Sauce Supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};
