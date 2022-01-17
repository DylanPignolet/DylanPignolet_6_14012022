const mongoose = require('mongoose');

// https://mongoosejs.com/docs/schematypes.html

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    dislikes: [String],
    usersLiked: [String] 
});

module.exports = mongoose.model('Sauce', sauceSchema);