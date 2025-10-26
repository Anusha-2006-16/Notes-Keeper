const mongoose=require('mongoose');

mongoose.connect('mongodb://127.0.0.1/notes-keeper');

const notesSchema=mongoose.Schema({
    title:String,
    content:String,
    pinned:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
});

const Note=mongoose.model("Note",notesSchema);

module.exports=Note;