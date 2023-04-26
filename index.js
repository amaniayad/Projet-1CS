require("dotenv").config();
const express=require('express');
const app=express();
const bcrypt=require('bcrypt');
const mysql=require('mysql2/promise');
const jwt=require('jsonwebtoken');
const urlencode=express.urlencoded({extended:true});
const auth=require('./middleware/auth');
const cookieParser = require("cookie-parser");

app.use(cookieParser())
app.use(express.json());    

const pool=mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'mysqlamani20',
    database:'projet1cs',
    waitForConnections:'true',
    connectionLimit: 10
})

app.post("/login", async (req, res) => {
    try{
      const { email, password } = req.body;
      if (!(email && password)) {
        return res.status(400).send("All input is required");
      }
      const connection = await pool.getConnection((error)=>{
        if(error) throw error
        console.log('Connected')
     });
     const  [results]=await connection.query(`SELECT * FROM accounts where email="${req.body.email}";`)
     connection.release();
     if (results.length===0){return res.send("Email does not exist,Please Sign up")}
    else{
      if (await bcrypt.compare(password, results[0].user_pass)) {
        const token = jwt.sign({ user_id:email },process.env.TOKEN_KEY,{expiresIn: "2h",});
        res.cookie =('token',token, {httpOnly:true});
        return res.status(200).send('logged in');
      }
      res.status(400).send("Invalid Credentials");
    }} catch (err) {
      console.log(err);
    }
  });
  
  app.get("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
  });

app.listen(4500)