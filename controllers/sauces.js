const Sauce = require("../models/Sauce");
const fs = require("fs");

//----------------------------------------CRUD----------------------------------------//

//----------------------------------------CREATE----------------------------------------//

exports.createSauce = (req, res, next) => {
  //récupération des information de la sauce dans le body de la requête
  const sauceSended = JSON.parse(req.body.sauce);
  console.log(sauceSended);
  //création d'une nouvelle sauce
  delete sauceSended._id;
  const sauce = new Sauce({
    //ajout de tous les éléments de la requête
    ...sauceSended,
    //ajout de l'url de l'image en récupérant (dans l'ordre) le protocole (http/https/etc), l'host (ici localhost:3000), rajout du chemin vers le dossier(/images/) puis le nom du fichier
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    //initialisation des variables "like" à 0 + création des tableaux utilisateurs "like".
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    //ajout de la sauce crée dans la DB
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce enregistrée" });
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  //récupération de l'userId et de la variable Like pour traiter la requête
  let like = req.body.like;
  let user = req.body.userId;
  Sauce.findOne({ _id: req.params.id })
    //recherche de la sauce concernée grâce à son id
    .then((sauce) => {
      //utilisation d'un switch, prenant en compte plusieurs cas (similaire à if/else)
      switch (like) {
        //dans le cas où "like" vaut 1
        case 1:
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: +1 }, //incrementation de la clef like de la sauce trouvée dans la DB
              $push: { usersLiked: user }, // ajout de l'id de l'utilisateur dans le tableau correspondant
              _id: req.params.id, //réécriture de l'id de la sauce, par sécurité (s'assurer que la sauce ai toujours la même Id)
            }
          ).then(() => {
            res.status(200).json({ message: "Like ajouté" });
            console.log(sauce);
          });
          break;
        case -1: //like vaut -1
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: +1 },
              $push: { usersDisliked: user },
              _id: req.params.id,
            }
          ).then(() => res.status(200).json({ message: "Dislike ajouté" }));
          break;
        case 0: //like vaut 0
          if (sauce.usersLiked.includes(user)) {
            //si nous trouvons l'id de l'utilisateur dans le tableau usersLiked
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 }, //retrait d'un "point" like
                $pull: { usersLiked: user }, //retrai de l'utilisateur dans le tableau correspondant
                _id: req.params.id,
              }
            ).then(() => res.status(200).json({ message: "Like retiré !" }));
          }
          if (sauce.usersDisliked.includes(user)) {
            //si l'id de l'utilisateur est dans le tableau usersDisliked
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: user },
                _id: req.params.id,
              }
            ).then(() => res.status(200).json({ message: "Dislike retiré !" }));
          }
          break;
        default:
          console.log("on vera");
      }
    })

    .catch((error) => res.status(400).json({ error }));
};
//----------------------------------------READ----------------------------------------//
exports.getSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
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
    //si req.file (ici un fichier image potentiel) existe
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images")[1];
        fs.unlink(`images/${filename}`, () => {}); //supression de l'image précédente trouvée dans la DB
      })
      .catch((error) => res.status(400).json({ error }));
  }
  const sauceUpdated = req.file //si req.file existe
    ? {
        ...JSON.parse(req.body.sauce),
        //changement de l'url de l'image pour la sauce modifiée
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body }; //sinon changements seulement textuels
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceUpdated, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce mise à jour !" }))
    .catch((error) => res.status(400).json({ error }));
};

//----------------------------------------DELETE----------------------------------------//

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce Supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};
