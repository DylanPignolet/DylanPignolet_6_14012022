const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  console.log(sauce);
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée!" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.likeDislikeSauce = (req, res, next) => {
  let like = req.body.like;
  let userId = req.body.userId;
  let sauceId = req.params.id;

  // Like
  if (like == 1) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (!sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            // Récupération de la sauce
            { _id: sauceId },
            {
              // Ajout de like
              $inc: { likes: 1 },
              // Ajout du user au tableau
              $push: { usersLiked: userId },
            }
          )
            .then(() => res.status(200).json({ message: "Vous avez aimé cette sauce!" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }

  // Dislike
  if (like === -1) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (!sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: userId },
            }
          )
            .then(() => res.status(200).json({ message: "Vous n'avez pas aimé cette sauce!" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }

  // Annulation Like ou Dislike
  if (like === 0) {
    // On retrouve la sauce
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        // Si le user a déjà liké la sauce
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              //On incrémente les likes de -1
              $inc: { likes: -1 },
              // On retire le user du tableau des users ayant liké
              $pull: { usersLiked: userId },
            }
          )
            .then(() => res.status(200).json({ message: "Like retiré" }))
            .catch((error) => res.status(400).json({ error }));
        }

        // Si le user a déjà disliké la sauce
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: userId },
            }
          )
            .then(() => res.status(200).json({ message: "Dislike retiré" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};
