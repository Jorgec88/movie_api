const express = require('express');
const app = express();
const uuid = require('uuid');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1/jcDB', {
  useNewUrlParser: true, useUnifiedTopology: true, family: 4 }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
const allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const message =
          'The CORS policy for this application does not allow access from origin ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

const auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(morgan('common'));
app.use(express.static('public'));

app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ title: req.params.title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get(
  '/movies/genres/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then((result) => {
        res.json(result ? result.Genre : null);
      })

      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get(
  '/movies/directors/:directorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((result) => {
        res.json(result ? result.Director : null);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.username })
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.put(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.username },
      {
        $set:
              {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
              }
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.post(
  '/users/:id/:movieTitle',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id, movieTitle } = req.params;
    const user = Users.find((user) => user.id === id);

    if (user) {
      user.favoriteMovies.push(movieTitle);
      res
        .status(200)
        .send(`${movieTitle} has been added to users ${id}'s array`);
    } else {
      res.status(400).send('users not found');
    }
  }
);

app.delete(
  '/users/:id/:movieTitle',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id, movieTitle } = req.params;

    const user = Users.find((user) => user.id === id);

    if (user) {
      user.favoriteMovies = user.favoriteMovies.filter(
        (title) => title !== movieTitle
      );
      res
        .status(200)
        .send(`${movieTitle} has been removed to users ${id}'s array`);
    } else {
      res.status(400).send('users not found');
    }
  }
);

app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + ' was not found');
        } else {
          res.status(200).send(req.params.username + ' was deleted');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get('/', (req, res) => {
  res.send('Welcome to my movie app');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// const { check, validationResult } = require('express-validator');
// app.get(
//  '/movies/genres/:genreName',
//  passport.authenticate('jwt', { session: false }),
//  (req, res) => {
//    Movies.findOne({ 'Genre.Name': req.params.genreName })
//      .then((movie) => {
//        res.status(200).json(movie.Genre);
//      })
//      .catch((err) => {
//        console.error(err);
//        res.status(500).send('Error: ' + err);
//      });
//  }
// );

// app.get(
//  '/movies/directors/:directorName',
//  passport.authenticate('jwt', { session: false }),
//  (req, res) => {
//    Movies.findOne({ 'Director.Name': req.params.directorName })
//      .then((movie) => {
//        res.json(movie.Director);
//     })
//     .catch((err) => {
//      console.error(err);
//    res.status(500).send('Error: ' + err);
//    });
// }
// );

// app.post(
// '/users',
// [
//  check('Username', 'Username is required').isLength({ min: 5 }),
// check(
//      'Username',
//    'Username contains non alphanumeric characters - not allowed.'
// ).isAlphanumeric(),
//   check('Password', 'Password is required').not().isEmpty(),
// check('Email', 'Email does not appear to be valid').isEmail()
//  ],
//  (req, res) => {
//    const errors = validationResult(req);
//  if (!errors.isEmpty()) {
//      return res.status(422).json({ errors: errors.array() });
//  }

//    Users.findOne({ Username: req.body.Username })
//    .then((user) => {
//    if (user) {
//    return res.status(400).send(req.body.Username + ' already exists');
// } else {
//       Users.create({
//      Username: req.body.Username,
//            Password: req.body.Password,
//          Email: req.body.Email,
//        Birthday: req.body.Birthday
//    })
//    .then((user) => {
//    res.status(201).json(user);
// })
//            .catch((error) => {
//            console.error(error);
//              res.status(500).send('Error: ' + error);
//          });
//    }
// })
//      .catch((error) => {
//        console.error(error);
//        res.status(500).send('Error: ' + error);
//      });
// }
// );

// app.put(
//  '/users/:Username',
/// passport.authenticate('jwt', { session: false }),
// [
// check('Username', 'Username is required').isLength({ min: 5 }),
// check(
//      'Username',
//    'Username contains non alphanumeric characters - not allowed.'
// ).isAlphanumeric(),
//    check('Password', 'Password is required').not().isEmpty(),
//    check('Email', 'Email does not appear to be valid').isEmail()
//  ],
//  (req, res) => {
//   const hashedPassword = Users.hashPassword(req.body.Password);
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//      return res.status(422).json({ errors: errors.array() });
//  }

//  Users.findOneAndUpdate(
//  { Username: req.params.Username },
//  {
//  $set: {
//  Username: req.body.Username,
// Password: hashedPassword,
//          Email: req.body.Email,
//          Birthday: req.body.Birthday
//      }
//  },
// { new: true }
//    )
//    .then((updatedUser) => {
//    res.json(updatedUser);
// })
//      .catch((err) => {
//      console.error(err);
//    res.status(500).send('Error: ' + err);
// });
//  }
// );

// app.post(
// '/users/:Username/movies/:MovieID',
// passport.authenticate('jwt', { session: false }),
//  (req, res) => {
//  Users.findOneAndUpdate(
//  { Username: req.params.Username },
// { $push: { FavoriteMovies: req.params.MovieID } },
//      { new: true }
//  )
//      .then((updatedUser) => {
//      res.json(updatedUser);
//      })
//    .catch((err) => {
//    console.error(err);
//  res.status(500).send('Error: ' + err);
//      });
//  }
// );

// app.delete(
// '/users/:Username/movies/:MovieID',
//  passport.authenticate('jwt', { session: false }),
//  (req, res) => {
//    Users.findOneAndUpdate(
//    { Username: req.params.Username },
//  { $pull: { FavoriteMovies: req.params.MovieID } },
// { new: true }
// )
//      .then((updatedUser) => {
//        res.json(updatedUser);
//      })
//      .catch((err) => {
//       console.error(err);
//        res.status(500).send('Error: ' + err);
//    });
//  }
// );

// app.delete(
//  '/users/:Username',
//  passport.authenticate('jwt', { session: false }),
//  (req, res) => {
//  Users.findOneAndRemove({ Username: req.params.Username })
//     .then((user) => {
//     if (!user) {
//     res.status(400).send(req.params.Username + ' was not found');
// } else {
//          res.status(200).send(req.params.Username + ' was deleted.');
//      }
//  })
// .catch((err) => {
//        console.error(err);
//      res.status(500).send('Error: ' + err);
//  });
//  }
// );
