const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
//accessing mongoose package
const mongoose = require("mongoose");

//database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (err) => {
  console.log("err", err);
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});
//schema definition
const Schema = mongoose.Schema;
//constructor
const searchSchema = new Schema({
  domainName: String,
  wordCount: Number,
  favourite: Boolean,
  webLinks: Array,
});
//model creation
var Searchdata = mongoose.model("searchdata", searchSchema);
//exporting the model
module.exports = Searchdata;
