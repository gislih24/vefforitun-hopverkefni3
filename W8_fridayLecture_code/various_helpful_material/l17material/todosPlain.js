const express = require("express");

const app = express();
const port = 3000;

//User endpoints
app.get("/users", (req, res) => {
  res.status(200).json({ message: "Get all users" });
});

app.get("/users/:userId", (req, res) => {
  res.status(200).json({ message: "Get user with id " + req.params.userId });
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
  res.status(200).json({ message: "Delete all users" });
});

app.delete("/users/:userId", (req, res) => {
  res.status(200).json({ message: "Delete user with id " + req.params.userId });
});

//Note endpoints
app.get("/users/:userId/notes", (req, res) => {
  res
    .status(200)
    .json({ message: "Get all notes for user with id " + req.params.userId });
});

app.get("/users/:userId/notes/:noteId", (req, res) => {
  res.status(200).json({
    message:
      "Get note with id " +
      req.params.noteId +
      " for user with id " +
      req.params.userId,
  });
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
  res.status(200).json({
    message:
      "Delete note with id " +
      req.params.noteId +
      " for user with id " +
      req.params.userId,
  });
});

app.delete("/users/:userId/notes", (req, res) => {
  res.status(200).json({
    message: "Delete all notes for user with id " + req.params.userId,
  });
});

app.get("/notes", (req, res) => {
  res.status(200).json({ message: "Get all notes" });
});

//Default: Not supported
app.use("*", (req, res) => {
  res.status(405).send("Operation not supported.");
});

app.listen(port, () => {
  console.log("Express app listening on port " + port);
});
