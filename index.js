const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid');

const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1/jcDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

app.use(express.static('public'));
app.use(morgan('common'));

app.get('/', (req, res) => {
  res.send('Welcome to my movie app');
});

app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err); 
    });
});

app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/:title', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get('/movies/genres/:genreName', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      res.status(200).json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/directors/:directorName', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


app.post('/users',
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {

      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  let hashedPassword = Users.hashPassword(req.body.Password);
  let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true })
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});





//app.get('/genre/:Name', (req, res) => {
//  Genres.findOne({ Name: req.params.Name })
//    .then((genre) => {
//      res.json(genre.Description);
//    })
//    .catch((err) => {
//      console.error(err);
 //     res.status(500).send('Error: ' + err);
//    });
//}); 

//app.get('/director/:Name', (req, res) => {
//  Directors.findOne({ Name: req.params.Name })
//    .then((director) => {
//      res.json(director);
//    })
//    .catch((err) => {
//      console.error(err);
//      res.status(500).send('Error: ' + err);
//    });
//});

//app.post('/users', async (req, res) => {
//  await Users.findOne({ Username: req.body.Username })
//    .then((user) => {
//      if (user) {
//        return res.status(400).send(req.body.Username + 'already exists');
//      } else {
//        Users.create({
//          Username: req.body.Username,
//          Password: req.body.Password,
//          Email: req.body.Email,
//          Birthday: req.body.Birthday
//        })
//          .then((user) =>{
//            res.status(201).json(user)
//          })
//          .catch((error) => {
//            console.error(error);
//            res.status(500).send('Error: ' + error);
//          })
//      }
//    })
//    .catch((error) => {
//      console.error(error);
//      res.status(500).send('Error: ' + error);
//    });
//});

//app.get('/users/:Username', async (req, res) => {
//  await Users.findOne({ Username: req.params.Username })
//    .then((user) => {
//      res.json(user);
   // })
//    .catch((err) => {
//      console.error(err);
//      res.status(500).send('Error: ' + err);
//    });
//});

//app.put('/users/:id', (req, res) => {
//  const { id } = req.params;
//  const updateUser = req.body;

//  let user = users.find(user => user.id === id);

//  if (user) {
//    user.name = updateUser.name;
//    res.status(200).json(user);
//  } else {
//    res.status(400).send('users not found')
//  }
//})

//app.post('/users/:id/:movieTitle', (req, res) => {
//  const { id, movieTitle } = req.params;
//  let user = users.find(user => user.id === id);

//  if (user) {
//    user.favoriteMovies.push(movieTitle);
//   // res.status(200).send(`${movieTitle} has been added to users ${id}'s array`);;
//  } else {
//    res.status(400).send('users not found')
//  }
//})

//app.delete('/users/:id/:movieTitle', (req, res) => {
//  const { id, movieTitle } = req.params;

//  const user = users.find(user => user.id === id);

//  if (user) {
//    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
//    res.status(200).send(`${movieTitle} has been removed to users ${id}'s array`);
//  } else {
//    res.status(400).send('users not found')
//  }
//})
