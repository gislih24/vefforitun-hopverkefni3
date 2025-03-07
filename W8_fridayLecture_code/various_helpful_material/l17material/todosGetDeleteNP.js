const express = require("express");

const app = express();
const port = 3000;

let users = [
  { id: 5, username: "Alice", age: 31 },
  { id: 10, username: "Bob", age: 31 },
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

//User endpoints
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

app.get("/users/:userId", (req, res) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == req.params.userId) {
      return res.status(200).json(users[i]);
    }
  }
  res.status(404).json({
    message: "User with id " + req.params.userId + " does not exist.",
  });
});

app.post("/users", (req, res) => {
  res.status(200).json({ message: "Post a new user" });
});

app.put("/users/:userId", (req, res) => {
  res.status(200).json({ message: "Update user with id " + req.params.userId });
});

app.patch("/users/:userId", (req, res) => {
  res
    .status(200)
    .json({ message: "Partially update user with id " + req.params.userId });
});

app.delete("/users", (req, res) => {
  var returnArray = users.slice();
  users = [];
  res.status(200).json(returnArray);
});

app.delete("/users/:userId", (req, res) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == req.params.userId) {
      res.status(200).json(users.splice(i, 1));
      return;
    }
  }
  res.status(404).json({
    message: "User with id " + req.params.userId + " does not exist.",
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
      res.status(404).json({
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
  res.status(200).json({
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
      res.status(404).json({
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

app.listen(port, () => {
  console.log("Express app listening on port " + port);
});
