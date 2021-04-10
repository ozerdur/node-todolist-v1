const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require ('lodash');

// //since datejs  is a local module we use full path
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: 'Hit the + button to add a new item.'
});

const item3 = new Item({
  name: '<-- Hit this to delete an item.'
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};


const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  // const day = date.getDate();

  Item.find(function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Default items are successfully added to db.")
          }
        });
        res.redirect("/");
      } else {
        res.render('list', {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
    }

  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.listName;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + foundList.name);
      }
    });

  }
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: []
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Succesfully deleted the checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        if (foundList) {
          res.redirect("/" + listName);
        }
      }
    });
  }
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port", process.env.PORT || 3000);
});
