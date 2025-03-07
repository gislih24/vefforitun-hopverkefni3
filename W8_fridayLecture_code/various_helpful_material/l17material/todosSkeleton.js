const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.use("*", (req, res) => {
  res.status(405).send("Operation not supported.");
});

app.listen(port, () => {
  console.log("Express app listening on port " + port);
});
