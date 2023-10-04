const express = require("express"),
morgan = require("morgan");

const app = express();

app.use(express.static("public"));
app.use(morgan("common"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Error!");
  });

app.get("/movies", (req, res) => {
    res.json(top10movies);
  });

  app.get('/', (req, res) => {
    res.send("Welcome to my movie app");
  });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });