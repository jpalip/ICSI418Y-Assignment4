const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const createError = require("http-errors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./public")));

let harry = {
  name: "Harry Potter",
  bio: "I am a wizard",
  img: "https://upload.wikimedia.org/wikipedia/en/d/d7/Harry_Potter_character_poster.jpg",
};
let remus = {
  name: "Remus Lupin",
  bio: "I am a werewolf",
  img: "https://upload.wikimedia.org/wikipedia/en/2/2f/Remus_Lupin.jpeg",
};
let salazar = {
  name: "Salazar Slytherin",
  bio: "I am a snake",
  img: "https://gamepress.gg/wizardsunite/sites/wizardsunite/files/2019-08/Portrait%20of%20Salazar%20Slytherin-foundable.png",
};

let wizards = [harry, remus, salazar];

app.get("/", (req, res, next) => {
  res.render("index", { wizards: wizards });
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});

// *****************************************************************************
// db Operations
// *****************************************************************************
const { MongoClient } = require("mongodb");

//const url = "mongodb://mongo:27017/";
//mongodb://myuser:mypassword@mongo:27017/";
const url = process.env.NAME_OF_HOST + "://" + process.env.DBNAME + ":27017/";
//"mongodb://mongo:27017/"; // THIS URI WORKS !!!!!!
// process.env.NAME_OF_HOST +
// "://" +
// process.env.DBUSERNAME +
// ":" +
// process.env.DBPASSWORD +
// "@" +
// process.env.DBNAME +
// ":27017/";
console.log(url);
//  GET THE HOSTNAME, username & password & the DB name from environment vars.
// Example: console.log(process.env.NODE_ENV);
//console.log(process.env.DBNAME);

const dbName = process.env.DBNAME;
const client = new MongoClient(url);

app.get("/db", async function (req, res, next) {
  try {
    const wizardsCopy = JSON.parse(JSON.stringify(wizards));
    // Try removing this! Can you answer why a deep copy is required here?
    // What happens if same wizards array is used?

    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    const collection = db.collection("wizards");

    const insertResult = await collection.insertMany(wizardsCopy);

    console.log("Inserted documents =>", insertResult);

    const findResult = await collection.find({}).toArray();
    res.send(findResult);
  } catch (error) {
    console.log(error);
    next(error);
  } finally {
    client.close();
  }
});

// *****************************************************************************
// *****************************************************************************

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
