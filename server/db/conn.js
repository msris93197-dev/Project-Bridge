const mongoose = require("mongoose");

const DB = process.env.DATABASE;
const options = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};

mongoose
  .connect(DB, options)
  .then(() => console.log("database connected"))
  .catch((err) => console.log("error", err));
