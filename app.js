const express=require('express');
const app=express();
const userModel=require('./models/user.js');
const notesModel=require('./models/note.js');
const methodOverride=require('method-override');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const path=require("path");

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.static("public"));

//Home Page
app.get('/',(req,res)=>{
    res.render("index.ejs");
})

//signup form
app.get('/signup',(req,res)=>{
    res.render("signup.ejs");
})
app.post('/signup',async(req,res)=>{
    const {name,email,password}=req.body;
    const existingUser=await userModel.findOne({email});
  if (existingUser) {
  return res.send("<h3>User already exists. <a href='/signin'>Login here</a>.</h3>");
}

    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(password,salt,async function(err,hash){
          if(err){
            return res.send("<h1>Something went wrong.Try again later.</h1>")
          }
            const user=await userModel.create({
                name,
                email,
                password:hash
            });
            console.log("New User Created Account.\n Details : ",user);
            res.redirect(`/notes/${user._id}`);
        })
    })
})

//SignIn Page
app.get("/signin",(req,res)=>{
    res.render("signin.ejs");
});

app.post("/signin",async(req,res)=>{
    const {email,password}=req.body;
    const existingUser=await userModel.findOne({email});
    if(!existingUser){
        return res.send("<h1>User not found!</h1>");
    }
    bcrypt.compare(password,existingUser.password,async function(err,result){
        if(err){
           return res.send("<h1>Something went wrong!</h1>"); 
        }
        if(password !== req.body.password){
            return res.send("<h1>Enter Correct Details!</h1>");
        }
        res.redirect(`/notes/${existingUser._id}`);
    })
})

//User-Notes-Page
app.get('/notes/:id',async(req,res)=>{
    const {id}=req.params;
    const notes=await notesModel.find({userId:id}).sort({pinned:-1});
    const user=await userModel.findById(id);
    res.render("userpage.ejs",{user,notes});
});

app.post('/notes/:id',async(req,res)=>{
    const {id}=req.params;
    const {title,content}=req.body;
    await notesModel.create({
        title,content,userId:id 
    });
    res.redirect(`/notes/${id}`);
})

//view all notes of individual user
app.get('/notes/:userid/view',async(req,res)=>{
     const {userid,noteid}=req.params;
     const user=await userModel.findById(userid);
    const notes=await notesModel.find({userId:userid});
    res.render("viewnotes.ejs",{notes,user});
})

//get results by search filter
app.get('/notes/:userid/viewSearch',async(req,res)=>{
    const {userid}=req.params;
  const {title}=req.query;
  const user=await userModel.findById(userid);
  const notes=await notesModel.find({
    userId:userid,
    title:{$regex:title,$options:'i'}
  });

  res.render("viewnotes.ejs",{user,notes});
})

//edit notes
app.get('/notes/:userid/:noteid/edit',async(req,res)=>{
    const {userid,noteid}=req.params;
    const user=await userModel.findById(userid);
    const note=await notesModel.findById(noteid);
    res.render('notesedit.ejs',{user,note});
})

app.put('/notes/:userid/:noteid',async(req,res)=>{
    const {userid,noteid}=req.params;
    const {  title, content } = req.body;
    const user=await userModel.findById(userid);
    const note=await notesModel.findById(noteid);
    await notesModel.findByIdAndUpdate(noteid,{title,content});
    res.redirect(`/notes/${userid}`);
})


//delete notes
app.delete('/notes/:userid/:noteid',async(req,res)=>{
    const {userid,noteid}=req.params;
    await notesModel.findByIdAndDelete(noteid);
    res.redirect(`/notes/${userid}`);
})

//view individual note
app.get('/notes/:userid/:noteid/viewNote', async (req, res) => {
    const { userid, noteid } = req.params;
    const user = await userModel.findById(userid);
    const note = await notesModel.findById(noteid);
    res.render("viewindividualnote.ejs", { user, note });
});

 
//pin/unpin note
app.post('/notes/:userid/:noteid/pin',async(req,res)=>{
    const {userid,noteid}=req.params;
    const note=await notesModel.findById(noteid);
     if (!note) return res.send("Note not found!");
    const index=note.pinned.indexOf(userid);
    if(index === -1){
        note.pinned.push(userid);
    }
    else{
        note.pinned.splice(index,1);
    }
    await note.save();
    res.redirect(`/notes/${userid}`);
})

app.post('/notes/:userid/:noteid/pin/view',async(req,res)=>{
      const {userid,noteid}=req.params;
    const note=await notesModel.findById(noteid);
    if(!note){
        return res.send("Note not found!");
    }
    const index=note.pinned.indexOf(userid);
    if(index === -1){
        note.pinned.push(userid);
    }
    else{
        note.pinned.splice(index,1);
    }
    await note.save();
    res.redirect(`/notes/${userid}/view`)
})

app.listen(3000,()=>{
    console.log("App listening on the PORT 3000");
})