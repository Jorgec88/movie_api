const express = require("express"),
//morgan = require("morgan"),
bodyParser = require('body-parser'),
uuid = require('uuid');

const app = express();

//app.use(express.static("public"));
//app.use(morgan("common"));
app.use(bodyParser.json());

//app.use((err, req, res, next) => {
  //  console.error(err.stack);
    //res.status(500).send("Error!");
  //});

  
  
  let users = [
    {
      id: 1,
      name: "Tom",
      favoriteMovies: ["fight club"]
    },
    {
      id: 2,
      name: "Lily",
      favoriteMovies: []
    }
  ]

  
  let movies = [
{
  title: "fight club",
  director: "David Fincher",
  genre: "drama, thriller"
},
{
  title: "natural born killers",
  director: "Oliver Stone",
  genre: "drama"
},
{
  title: "pulp fiction",
  director: "Quentin Tarantino",
  genre: "thriller"
},
{
  title: "leon",
  director: "Luc Besson",
  genre: "action, thriller"
},
{
  title: "2001:a space odyssey",
  director: "Stanley Kubrick",
  genre: "sci-fi"
}
 ] 

 

app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
res.status(400).send("users need a name")
  }
  })

  app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;
  
    let user = users.find(user => user.id == id);
     
    if (user) {
      user.name = updateUser.name;
      res.status(200).json(user);
    } else {
      res.status(400).send("users not found")
    }
    })

    app.post("/users/:id/:movieTitle", (req, res) => {
      const { id, moviTitle } = req.params;
      
    
      let user = users.find(user => user.id == id);
       
      if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to users ${id}'s array`);;
      } else {
        res.status(400).send("users not found")
      }
      })

      app.delete("/users/:id/:movieTitle", (req, res) => {
        const { id, movieTitle } = req.params;
        
      let user = users.find(user => user.id == id);
         
        if (user) {
          user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
          res.status(200).send(`${movieTitle} has been removed to users ${id}'s array`);;
        } else {
          res.status(400).send("users not found")
        }
        })



app.get("/movies", (req, res) => {
    res.status(200).json(movies);
  });

  app.get("/movies/:title", (req, res) => {
    const {title} = req.params;
    const movie = movies.find(movie => movie.title === title );
    if (movie) {
      res.status(200).json(movies);
    } else {
    res.status(404).send ("movie not available")
    }
     
 });

 app.get("/movies/:genre", (req, res) => {
  const {title} = req.params;
  const movie = movies.find(movie => movie.genre === genre );
  if (genre) {
    res.status(200).json(genre);
  } else {
  res.status(404).send ("no such genre")
  }
   
});

app.get("/movies/directors/:directorName", (req, res) => {
  const {directorName} = req.params;
  const director = movies.find(movie => movie.director.name === directorName).director;
  if (director) {
    res.status(200).json(director);
  } else {
  res.status(404).send ("no such director")
  }
   
});

  app.get('/', (req, res) => {
    res.send("Welcome to my movie app");
  });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

  