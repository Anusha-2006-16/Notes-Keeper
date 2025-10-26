const mongoose=require('mongoose');

mongoose.connect('mongodb://127.0.0.1/notes-keeper');

const userSchema=mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true
    },
    password:String
});

const User=mongoose.model("User",userSchema);

module.exports=User;