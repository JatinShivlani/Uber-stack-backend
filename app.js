const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectToDb= require('./db/db')
const cookieParser = require("cookie-parser");
const captainRoutes = require('./routes/captain.routes');
app.use(cors());
// connecting to db
connectToDb();
const userRoutes = require('./routes/user.routes');


// for parsing application/json(body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// for parsing cookies
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// routes

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);

module.exports = app;
