const express = require('express');
//const https = require("https")
const mongoose = require("mongoose");
const bodyparser = require('body-parser');
const dAte = require("./ourModule");  /// or const dAte = require(__dirname + "/ourModule");  
const _ = require("lodash"); ///An U

const app = express();
app.set("view engine","ejs") 
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todoblog",{useNewUrlParser:true});

//let todoItems = [];
//let posts = [];

const itemsSchema = {
    name: String
};
  
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Apple"
});  
const defaultItems = [item1];

const homeStartingContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
const aboutContent = "Malesuada fames ac turpis egestas integer eget aliquet. Tristique nulla aliquet enim tortor. Mi sit amet mauris commodo quis. Praesent elementum facilisis leo vel fringilla. In fermentum posuere urna nec tincidunt praesent. Vehicula ipsum a arcu cursus vitae congue mauris. Nunc eget lorem dolor sed. Sed sed risus pretium quam. Volutpat lacus laoreet non curabitur. Quisque non tellus orci ac auctor augue. Congue quisque egestas diam in arcu. Nulla malesuada pellentesque elit eget gravida cum sociis natoque penatibus. Nunc id cursus metus aliquam eleifend mi in. Arcu dictum varius duis at consectetur lorem donec. Semper viverra nam libero justo laoreet sit amet. Ipsum dolor sit amet consectetur adipiscing elit ut. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit. Pulvinar sapien et ligula ullamcorper malesuada proin. Aliquet risus feugiat in ante metus dictum at tempor.";
const contactContent = "Sed nisi lacus sed viverra tellus in hac habitasse platea. Suspendisse ultrices gravida dictum fusce. Quam elementum pulvinar etiam non quam lacus suspendisse faucibus. Mauris cursus mattis molestie a iaculis. Dui faucibus in ornare quam viverra orci. Nisl pretium fusce id velit ut tortor pretium viverra suspendisse. At tellus at urna condimentum mattis pellentesque id. Viverra aliquet eget sit amet tellus. Odio eu feugiat pretium nibh ipsum consequat. A diam maecenas sed enim ut. Dolor morbi non arcu risus quis varius quam quisque. Scelerisque mauris pellentesque pulvinar pellentesque. Ipsum dolor sit amet consectetur adipiscing elit ut. Ut tristique et egestas quis ipsum suspendisse ultrices gravida dictum. Tincidunt tortor aliquam nulla facilisi cras fermentum odio eu feugiat. Massa sapien faucibus et molestie ac feugiat"; 

app.get('/',function(req,res){
    //let day  = dAte();
    Item.find({},function(err,foundItems){
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Inserted Default Items to show");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Title", newListItems: foundItems});
        }
    });

});

///amra localhost:3000/jaiccha dilei shei route create krte ei list Schema jekhane
/// route er nam er jonno name and oi route a jinish potro rakhte items array use krtesi
const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name : customListName} , function(err,foundList){
        if(!err){
            if(!foundList){ ///if empty 
                ///create New List or route
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }else{
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            } 
        }
    });

});

app.post("/",function(req,res){

    const itemName = req.body.el1;
    const listName = req.body.submitBut;

    const item = new Item({
        name: itemName
    });

    if (listName === "Title"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name : listName},function(err,found){
            found.items.push(item);
            found.save();
            res.redirect("/" + listName);
        });
    }
 
});


app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Title"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                //console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}},function(err, foundList){
            if (!err){
                res.redirect("/" + listName);
            }
        });
    }
});

const postSchema = {
    title: String,
    content: String
};
  
const Post = mongoose.model("Post", postSchema);

app.get("/home/blog", function(req, res){
    
    Post.find({}, function(err, posts){
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts
        });
    });

});

app.get("/home/compose", function(req, res){
    res.render("compose");
});


app.post("/home/compose", function(req, res){
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody
    });
  
    post.save(function(err){
      if (!err){
          res.redirect("/home/blog");
      }else{
          console.log(err);
      }
    });
});

app.get("/posts/:postId", function(req, res){

    const requestedPostId = req.params.postId;
    
      Post.findOne({_id: requestedPostId}, function(err, post){
        res.render("post", {
          title: post.title,
          content: post.content
        });
      });
    
});

app.get("/home/about", function(req, res){
    res.render("about", {aboutContent: aboutContent});
});
  
app.get("/home/contact", function(req, res){
    res.render("contact", {contactContent: contactContent});
});


/*
app.post("/compose", function(req, res){
    const post = {
      title: req.body.postTitle,
      content: req.body.postBody
    };
    posts.push(post);
    res.redirect("/home");  
});


app.get("/posts/:postName", function(req, res){
    const requestedTitle = _.lowerCase(req.params.postName);
  
    posts.forEach(function(post){
      const storedTitle = _.lowerCase(post.title);
  
      if (storedTitle === requestedTitle) {
        res.render("post", {
          title: post.title,
          content: post.content
        });
      }
    });
  
});
*/

app.listen(3000,function(){
    console.log("Server is Running");
});


