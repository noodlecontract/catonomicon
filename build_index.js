const fs = require("fs");
const lunr = require("lunr");

const cats = JSON.parse(fs.readFileSync("_data/cats.json"));

const lunrCatIndex = lunr(function() {
  this.ref("id");
  this.field("name");
  this.field("description");
  this.field("sun");
  this.field("moon");
  this.field("rising");
  cats.forEach(c => this.add(c));
});
fs.writeFileSync("assets/cat_index.json", JSON.stringify(lunrCatIndex.toJSON()));
