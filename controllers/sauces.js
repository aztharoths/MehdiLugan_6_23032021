const Sauce = require("../models/Sauce");

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
//----------------------------------------READ----------------------------------------//
exports.getSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json({ sauce });
      console.log(sauce);
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//----------------------------------------UPDATE----------------------------------------//

exports.updateSauce = (req, res, next) => {};

//----------------------------------------DELETE----------------------------------------//
