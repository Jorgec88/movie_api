const mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
    title: {type: stringify, required: true},
    Description: {type: stringify, required: true},
    Genre: {
        Name: string,
        Description: string
    },
    Director: {
        Name: string,
        Bio: string,
        Birth: Date
    },
    Actors: [string],
    ImagePath: string,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    UserName: {type: string, required: true},
    Password: {type: string, required: true},
    Email: {type: string, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "movie" }]
});

let movie = mongoose.model("movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;