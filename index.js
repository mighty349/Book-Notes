import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import cookieParser from "cookie-parser";

const app=express();
const port=3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Mighty-Library",
    password: "Warrior3490#",
    port: 5432,
  });
  db.connect();


app.get("/",(req,res)=>{
    res.set('Cache-Control', 'no-store');
    res.render("login.ejs");
})

app.post("/validate",async(req,res)=>{
    const username=req.body.username.trim();
    const password=req.body.password.trim();
    console.log(username+""+password);
    try {
        const result=await db.query("select * from users where username=$1",[username]);
        if(result.rows[0].username==username && result.rows[0].password==password)
        {
            res.cookie('user', result.rows[0].user_id, { httpOnly: true });
            res.redirect("/home");
        }
        else
        {
            throw error;
        }
    } catch (error) {
        console.log(error);
        res.render("login.ejs",{wrong:"wrong credentials"});
    }
})



app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.post("/new-user",async(req,res)=>{
    const email=req.body.email.trim();
    const username=req.body.username.trim();
    const password=req.body.password.trim();
    try{
        const result=await db.query("insert into users(email,username,password)values($1,$2,$3)",[email,username,password]);
        res.redirect("/");
    }
    catch(error){
        console.log(error);
          res.render("signup.ejs",{wrong:"Already Registred Please Sign In "})
    }

})

app.get("/home",async(req,res)=>{
    const user = req.cookies.user;
    console.log(user);
    const result=await db.query("select * from read_books where user_id=$1",[user]);
    let items=result.rows
    let images=[];
    res.render("home.ejs",{items});
    
})
app.get("/logout",(req,res)=>{
    res.redirect("/");
})
app.post("/add",async(req,res)=>{
    const user = req.cookies.user;
    const title=req.body.title;
    const date=req.body.date;
    const rating=req.body.rating;
    const olid=req.body.isbn
    const preview=req.body.preview;
    const notes=req.body.notes;
    try {
        const result=await db.query("insert into read_books values($1,$2,$3,$4,$5,$6,$7)",[user,olid,title,date,rating,preview,notes]);
    } catch (error) {
        
    }
    res.redirect("/home");
})

app.get("/new",(req,res)=>{
    res.render("new.ejs");
})

app.get("/delete/:book_name",async(req,res)=>{
    const id=req.cookies.user;
    const book_name=req.params.book_name
    const result=await db.query("delete  from read_books where book_name=$1 and user_id=$2",[book_name,id]);
    res.redirect("/home");

})

app.get("/view/:book_name",async(req,res)=>{
    const book_name=req.params.book_name;
    const id=req.cookies.user;
    let result=await db.query("select notes from read_books where book_name=$1 and user_id=$2",[book_name,id]);
    console.log(result);
    result=result.rows[0].notes;
    res.render("view.ejs",{notes:result});
})

app.get("/update/:book_name",async(req,res)=>{
    const book_name=req.params.book_name;
    const id=req.cookies.user;
    const result=await db.query("select * from read_books where book_name=$1 and user_id=$2",[book_name,id]);
    res.render("new.ejs",{modify:result.rows[0]});
})

app.post("/modify/:book_label",async(req,res)=>{
    const id=req.cookies.user;
    const book_label=req.params.book_label;

    const title=req.body.title;
    const date=req.body.date;
    const rating=req.body.rating;
    const olid=req.body.isbn
    const preview=req.body.preview;
    const notes=req.body.notes;

    const result=await db.query("update read_books set book_id=$1,book_name=$2,readtime=$3,rating=$4,preview=$5,notes=$6  where user_id=$7 and book_label=$8",[olid,title,date,rating,preview,notes,id,book_label]);

    res.redirect("/home");
})















app.listen(port,()=>{
    console.log("server listening on port 3000");
})

process.on('SIGINT', () => {
    console.log('Closing database connection');
    db.end();
    process.exit();
  });