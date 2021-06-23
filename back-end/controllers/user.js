const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const sanitize = require("mongo-sanitize");

const User = require("../models/User");

exports.signup = (req, res, next) => {
  let email = sanitize(req.body.email);
  let pass = sanitize(req.body.password);
  let safeMail = Buffer.from(email).toString("base64");
  if (validator.isEmail(email)) {
    if (validator.isStrongPassword(pass)) {
      bcrypt
        .hash(pass, 10)
        .then((hash) => {
          const user = new User({ email: safeMail, password: hash });
          user
            .save()
            .then(() => res.status(201).json({ message: "Utilisateur créé!" }))
            .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
    } else {
      console.log("Mot de passe non sécurisé");
    }
  } else {
    console.log("ce n'est pas un email");
  }
};

exports.login = (req, res, next) => {
  let email = sanitize(req.body.email);
  let pass = sanitize(req.body.password);
  let safeMail = Buffer.from(email).toString("base64");
  if (validator.isEmail(email)) {
    User.findOne({ email: safeMail })
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: "Utilisateur non trouvé" });
        }
        bcrypt
          .compare(pass, user.password)
          .then((valid) => {
            if (!valid) {
              return res
                .status(401)
                .json({ error: "Mot de passe incorrect !" });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
                expiresIn: "24h",
              }),
            });
          })
          .catch((error) => res.status(500).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  }
};
