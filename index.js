const express = require("express"),
 bodyParser = require("body-parser"),
 uuid = require("uuid");

const morgan = require("morgan");
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies= Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://127.0.0.1/jcDB", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




//app.use(express.static("public"));
app.use(morgan("common"));


//app.use((err, req, res, next) => {
  //  console.error(err.stack);
    //res.status(500).send("Error!");
  //});

  app.get('/', (req, res) => {
    res.send("Welcome to my movie app");
  });
  
  app.get('/movies', (req, res) => {
    Movies.find()
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

app.get('/movies/:title', (req, res) => {
   Movies.findOne({ title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });
  
  
    // const {title} = req.params;
    //const movie = movies.find(movie => movie.title === title );
    //if (movie) {
    //  res.status(200).json(movies);
    //} else {
    //res.status(404).send ("movie not available")
   // }
     
 //});

 app.get('/genre/:Name', (req, res) => {
  Genres.findOne({ Name: req.params.Name })
   .then((genre) => {
    res.json(genre.Description);
   })
   .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
   });
  });  
 
  // const {title} = req.params;
 // const movie = movies.find(movie => movie.genre === genre );
 // if (genre) {
   // res.status(200).json(genre);
  //} else {
  //res.status(404).send ("no such genre")
  //}
   
//});

app.get('/director/:Name', (req, res) => {
  Directors.findOne({ Name: req.params.Name })
   .then((director) => {
    res.json(director);
   })
   .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
   });
});

 app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
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

 

  app.get('/users/:Username', async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;
  
    let user = users.find(user => user.id == id);
     
    if (user) {
      user.name = updateUser.name;
      res.status(200).json(user);
    } else {
      res.status(400).send('users not found')
    }
    })

    app.post('/users/:id/:movieTitle', (req, res) => {
      const { id, moviTitle } = req.params;
      let user = users.find(user => user.id == id);
       
      if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to users ${id}'s array`);;
      } else {
        res.status(400).send('users not found')
      }
      })

      app.delete('/users/:id/:movieTitle', (req, res) => {
        const { id, movieTitle } = req.params;
        
      let user = users.find(user => user.id == id);
         
        if (user) {
          user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
          res.status(200).send(`${movieTitle} has been removed to users ${id}'s array`);;
        } else {
          res.status(400).send('users not found')
        }
        })




 

  

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

  

  //app.post("/users", (req, res) => {
  //  const newUser = req.body;
  
  //  if (newUser.name) {
  //    newUser.id = uuid.v4();
  //    users.push(newUser);
  //    res.status(201).json(newUser)
  //  } else {
  //res.status(400).send("users need a name")
  //  }
   // })