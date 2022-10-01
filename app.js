//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const items = ["1" , "2"]
const workItems = [];
      const day = date.getDate();

/* create mongoDB*/
mongoose.connect("mongodb://localhost:27017/todolistDB");




const schema = new mongoose.Schema({ name: 'string'});
const listSchema = new mongoose.Schema({ name: 'string',items:[schema]});


/*show collections*/
const Item = mongoose.model('item', schema);
const List = mongoose.model('list', listSchema);


const item1 = new Item({name : "todoList"});
const item2 = new Item({name : "sleeep"});
const item3 = new Item({name : "go home"});

const defaulttodo = [item1,item2,item3];

/*Item.insertMany(defaulttodo , function(err){
  if (err) {
    console.log(err);
  } else {
    console.log("added array to db success");
  }
});*/



app.get("/", function(req, res) {

  Item.find({},function(err,result){
    if(result.length===0){
        Item.insertMany(defaulttodo , function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("added array to db success");
        }
      });
        res.redirect("/");
    }else {
    res.render("list", {listTitle: day, newListItems: result});
  }
});

});





app.post("/", function(req, res){
  const itemName = req.body.newItem;
     const todoName = req.body.list;
    const item = new Item({
      name : itemName
    });
    if (todoName === day) {
        item.save();
      res.redirect("/");

    } else {
        List.findOne({name : todoName},function(err,found){
          found.items.push(item);
          found.save();
          res.redirect("/"+todoName);
        })    
      }
});






app.post("/delete" , function(req , res){
 const id = req.body.deleteItem;
 const listname = req.body.todolistname;

if (listname === day) {
   Item.findByIdAndRemove(id, function(err){
  if (err) {
    console.log(err);
  } else {
    res.redirect("/");
  }
 });
} else {
        List.findOneAndUpdate({name : listname},{$pull : {items : {_id :id}}},function(err,result){
          if (err) {
            console.log(err)
          } else {
            res.redirect("/"+listname);
          }

        });

}


});


app.get('/:todoTitle',function(req , res){
  const reqTitle = req.params.todoTitle;

  List.findOne({name:reqTitle},function(err ,result){
    if (!err) {
      if (!result) {
        console.log("doesn't exist");
          const list = new List({
           name : reqTitle,
           items: defaulttodo
        });
        list.save();
        res.redirect("/"+reqTitle);
      } else {
        console.log("exist");

        res.render("list", {listTitle: reqTitle, newListItems: result.items});
      }
    }
  });






});





app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
