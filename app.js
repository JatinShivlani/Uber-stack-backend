const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectToDb= require('./db/db')
app.use(cors());
// connecting to db
connectToDb();
const userRoutes = require('./routes/user.routes');


// for parsing application/json(body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("Hello World");
});

// routes

app.use('/users', userRoutes);

module.exports = app;
