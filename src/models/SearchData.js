const dotenv = require("dotenv").config();
//accessing mongoose package
const mongoose = require("mongoose");
//database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
