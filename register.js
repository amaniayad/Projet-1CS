require("dotenv").config();
const express=require('express');
const app=express();
const mysql=require('mysql2/promise');
const bcrypt=require('bcrypt');
const jwt = require("jsonwebtoken");
const encoder=express.urlencoded({extended:true})

app.use(express.json())

const pool=mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'mysqlamani20',
    database:'projet1cs',
    waitForConnections:'true',
    connectionLimit: 10
})

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname +'/register.html'))
})

app.post('/register',encoder, async (req,res)=>{
    if (!(req.body.email && req.body.password && req.body.name && req.body.lastname)) {
        return res.status(400).send("All input is required");
      }
     const hashedPassword =await bcrypt.hash(req.body.password, 10);
     const connection = await pool.getConnection((error)=>{
        if(error) throw error
        console.log('Connected')
     });
     const [results]=await connection.query(`SELECT * FROM accounts where email="${req.body.email}";`)
     if (results.length!==0){return res.send("Email exists,Please log in")}
     else{
try {
    const token = jwt.sign({ user_id: req.body.email },process.env.TOKEN_KEY,{expiresIn: "2h",});
    const [result] = await connection.query(`INSERT INTO accounts (user_name,user_lastName,email,user_pass,token) Values (?,?,?,?,?)`,
        [req.body.name, req.body.lastname, req.body.email.toLowerCase(), hashedPassword,token]);
    console.log(`Added user with ID ${result.insertId}`);
    return res.sendStatus(200);
} catch (error) {
    console.error(error);
    res.sendStatus(500);
}finally{
    connection.release();
}
}})

app.listen(3000)
