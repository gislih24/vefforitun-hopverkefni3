const express = require("express");

//Import a body parser module to be able to access the request body as json
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;
var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
const dbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/";
var db;

// Initialize connection once
MongoClient.connect(dbUrl, function (err, database) {
  if (err) throw err;
  db = database.db("todoDB");
  app.listen(port, () => {
    console.log("Express app listening on port " + port);
  });
});

//Tell express to use the body parser module
app.use(bodyParser.json());

let nextId = 11;
let users = [
  { id: 5, username: "Alice", age: 25 },
  { id: 10, username: "Bob", age: 30 },
];
let notes = [
  {
    userId: 5,
    userNotes: [
      { id: 10, name: "todos for today", content: "Prepare Lab 6" },
      {
        id: 12,
        name: "memo for l15",
        content: "Do not forget to mention Heroku",
      },
    ],
  },
  {
    userId: 10,
    userNotes: [{ id: 1, name: "shopping list", content: "Milk, Cheese" }],
  },
];

app.use(function (req, res, next) {
  console.log(
    "Request: " + req.method + " at " + req.url + ", time: " + new Date()
  );
  res.set("X-Logged", "true");
  next();
});

//User endpoints
app.get("/users", (req, res) => {
  db.collection("users")
    .find({})
    .toArray(function (err, users) {
      if (err) {
        return res.status(500).json({ message: "Error when accessing DB." });
      }
      res.status(200).json(users);
    });
});

app.get("/users/:userId", (req, res) => {
  let id = new mongo.ObjectID(req.params.userId);
  db.collection("users").findOne({ _id: id }, function (err, user) {
    if (err || user === null) {
      return res
        .status(404)
        .json({
          message: "User with id " + req.params.userId + " does not exist.",
        });
    } else {
      res.status(200).json(user);
    }
  });
});

app.post("/users", (req, res) => {
  if (
    req.body === undefined ||
    req.body.username === undefined ||
    req.body.age === undefined
  ) {
    res
      .status(400)
      .json({
        message: "username and age fields are required in the request body",
      });
  } else {
    let newUser = { username: req.body.username, age: req.body.age };
    db.collection("users").insertOne(newUser, function (err, user) {
      if (err) {
        return res.status(500).json({ message: "Error when writing user." });
      }
      res.status(201).json(user.ops[0]);
      return;
    });
  }
});

app.put("/users/:userId", (req, res) => {
  if (
    req.body === undefined ||
    req.body.username === undefined ||
    req.body.age === undefined
  ) {
    res
      .status(400)
      .json({
        message: "username and age fields are required in the request body",
      });
  } else {
    let id = new mongo.ObjectID(req.params.userId);
    let newValues = {
      $set: { username: req.body.username, age: req.body.age },
    };
    db.collection("users").findOneAndUpdate(
      { _id: id },
      newValues,
      function (err, user) {
        if (err || user === null || user.value === null) {
          res
            .status(404)
            .json({
              message: "User with id " + req.params.userId + " does not exist.",
            });
        } else {
          res.status(200).json(user.value);
        }
      }
    );
  }
});

app.patch("/users/:userId", (req, res) => {
  if (
    req.body === undefined ||
    (req.body.username === undefined && req.body.age === undefined)
  ) {
    res
      .status(400)
      .json({
        message: "Either username or age field is required in the request body",
      });
  } else {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id == req.params.userId) {
        if (req.body.username !== undefined) {
          users[i].username = req.body.username;
        }
        if (req.body.age !== undefined) {
          users[i].age = req.body.age;
        }
        res.status(200).json(users[i]);
        return;
      }
    }
    res
      .status(404)
      .json({
        message: "User with id " + req.params.userId + " does not exist.",
      });
  }
});

app.delete("/users", (req, res) => {
  //The deleteMany operation does not return the deleted elements, so we have to do a find first.
  db.collection("users")
    .find({})
    .toArray(function (err, users) {
      db.collection("users").deleteMany({}, function (err, obj) {
        if (err || obj === null || obj.result.ok !== 1) {
          res
            .status(500)
            .json({ message: "Deletion failed with error: " + err });
        } else {
          res.status(200).json(users);
        }
      });
    });
});

app.delete("/users/:userId", (req, res) => {
  let id = new mongo.ObjectID(req.params.userId);
  db.collection("users").findOneAndDelete({ _id: id }, function (err, obj) {
    if (err || obj === null || obj.value === null) {
      res
        .status(404)
        .json({
          message: "User with id " + req.params.userId + " does not exist.",
        });
    } else {
      res.status(200).json(obj.value);
    }
  });
});

//Note endpoints
app.get("/users/:userId/notes", (req, res) => {
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].userId == req.params.userId) {
      res.status(200).json(notes[i].userNotes);
      return;
    }
  }
  res
    .status(404)
    .json({ message: "User with id " + req.params.userId + "does not exist." });
});

app.get("/users/:userId/notes/:noteId", (req, res) => {
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].userId == req.params.userId) {
      for (let j = 0; j < notes[i].userNotes.length; j++) {
        if (notes[i].userNotes[j].id == req.params.noteId) {
          res.status(200).json(notes[i].userNotes[j]);
          return;
        }
      }
      res
        .status(404)
        .json({
          message:
            "Note with id " +
            req.params.noteId +
            " does not exist for user " +
            req.params.userId,
        });
      return;
    }
  }
  res
    .status(404)
    .json({ message: "User with id " + req.params.userId + " does not exist" });
});

app.post("/users/:userId/notes", (req, res) => {
  res
    .status(200)
    .json({ message: "Post a new note for user with id " + req.params.userId });
});

app.put("/users/:userId/notes/:noteId", (req, res) => {
  res
    .status(200)
    .json({
      message:
        "Update note with id " +
        req.params.noteId +
        " for user with id " +
        req.params.userId,
    });
});

app.delete("/users/:userId/notes/:noteId", (req, res) => {
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].userId == req.params.userId) {
      for (let j = 0; j < notes[i].userNotes.length; j++) {
        if (notes[i].userNotes[j].id == req.params.noteId) {
          res.status(200).json(notes[i].userNotes.splice(j, 1));
          return;
        }
      }
      res
        .status(404)
        .json({
          message:
            "Note with id " +
            req.params.noteId +
            " does not exist for user " +
            req.params.userId,
        });
      return;
    }
  }
  res
    .status(404)
    .json({ message: "User with id " + req.params.userId + " does not exist" });
});

app.delete("/users/:userId/notes", (req, res) => {
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].userId == req.params.userId) {
      var returnArray = notes[i].userNotes.slice();
      notes[i].userNotes = [];
      res.status(200).json(returnArray);
      return;
    }
  }
  res
    .status(404)
    .json({ message: "User with id " + req.params.userId + " does not exist" });
});

app.get("/notes", (req, res) => {
  let allNotes = [];
  for (let i = 0; i < notes.length; i++) {
    allNotes = allNotes.concat(notes[i].userNotes);
  }
  res.status(200).json(allNotes);
});

//Default: Not supported
app.use("*", (req, res) => {
  res.status(405).send("Operation not supported.");
});
