const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const md5 = require("md5");
const app = express();
app.use(express.static("public"));

//package to store the user uploaded image to the server folder
const Storages = multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cd)=>{
    cd(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
});

let upload=multer({
  storage:Storages
}).single('Browse');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// app.use(multer({ dest: ‘./uploads/’,
//  rename: function (fieldname, filename) {
//    return filename;
//  },
// }));

//mongo db conncection
mongoose.connect("mongodb://localhost:27017/imageDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

//mongodb User schema
const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
  userType: String,
});
const User = new mongoose.model("User", userSchema);

const imageScema= new mongoose.Schema({
  image:String,
  Download: String,
  category:String,
  imageName:String
  // userName:userSchema
});

const Image= new mongoose.model("Image",imageScema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/contributor",function(req,res){
  res.render("contributor");
});

app.get("/normal_user",function(req,res){
  Image.find({},function(err,datas){
    if(err){console.log(err);}
    else {
      res.render("normal_user",{images:datas});
    }
  });

});

//register route which uses hash function to protect password
app.post("/register",function(req,res){
  let uName = req.body.username;
  let password = md5(req.body.password);
  let userType=req.body.userType;
const newUser= new User({
userName:uName,
password:password,
userType:userType
});
newUser.save(function(err){
  if(err){
    console.log(err);
  }
  else{                                  //checking the user type and routing the page based on the user.
    if(userType==='normalUser'){
      res.redirect("/normal_user");
    }
    else{
    res.redirect("/contributor");
  }
  }
});
});

//login route
app.post("/login",function(req,res){
  let userName=req.body.username;
  let password=md5(req.body.password);
  User.findOne({userName:userName},function(err,foundUser){
    if(err){console.log(err);}
    else{
      if(foundUser){
        if(foundUser.password===password){
          if(foundUser.userType==='normalUser'){
            res.redirect("/normal_user");
          }
          else{
          res.redirect("/contributor");
        }
        }
      }
    }
  });

})

//contributor route to accept the user uploaded image file
app.post("/contributor",upload,function(req,res){
let imageName=req.body.imageName;
console.log(req.file.filename);
let imagePath=req.file.filename;
let category=req.body.Category;
const imageData= new Image({
  image:imagePath,
  imageName:imageName,
  category:category,
});
imageData.save(function(err){
  if(err){
  console.log(err);
}
else{
  res.redirect("/contributor");
}
});

});

app.post("/normalUser",function(req,res){

});




app.listen(3000, function() {
  console.log("Server started at port 3000");
});
