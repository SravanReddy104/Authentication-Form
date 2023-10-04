import Express from "express";
const app = Express();
import cors from "cors";
import mysql from "mysql";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import path, { dirname } from "path";
import jwt from "jsonwebtoken"
import env from "dotenv"
import cookieParser from "cookie-parser";
// import session from "express-session";
import  Sessions  from "express-session";
app.use(Sessions({
  secret: "thisismysecrctekey",
  saveUninitialized:true,
  resave: false
  }));
  
  app.use(cookieParser());
env.config()
const __dirname = path.resolve();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sravan@10",
  database: "auth",
});
app.use(cors())
app.use(bodyParser());
db.connect(function (error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log("Database Connected Successfully..!!");
  }
});
const checkRole = (roles) => async (req, res, next) => {
  const id = req.params.profile;
  // console.log(i)
  // const id = i.substring(1,)
  // console.log(id)
  

  var sql = "select * from users where email = ?";
  db.query(sql, [id], function (err, result, fields) {
    if (err) {
      res.send(err.code);
    }
    // console.log(result,"result");
    if (result.length === 0) {
      res.send("No Record Found");
    } else {
      !roles.includes(result[0].role)
    ? res.status(401).json("Sorry you do not have access to this route")
    : next();
     
    }
  }
  )

  // 
};
const employeeAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log(process.env.APP_SECRET);
  if (!authHeader) return res.sendStatus(403);
  console.log(authHeader); // Bearer token
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
    console.log("verifying");
    if (err) return res.sendStatus(403); //invalid token

    console.log(decoded); //for correct token
    next();
  });
};

app.get("/", (req, res) => {
//   console.log("hello")
 console.log(req.session)
  
  console.log(__dirname);
  res.send("hello");
});

app.post("/getSignUp", async (req, res) => {
  const { email, password, role,name } = req.body;
  // console.log(password,"password")
  const pass = await bcrypt.hash(password, 7);
  const data = {
    email: email,
    password: pass,
    role: role,
    name:name
  };
  db.query("INSERT INTO users SET ?", data, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.send("Successfully Signed You can login now");
    }
  });
});


app.post("/getLogIn", (req, res) => {

  let email = req.body.email;
  
  let password = req.body.password;
  req.session.user=email
  console.log(email,password);
  var isMatch;
  var sql = "select * from users where email = ?";
  db.query(sql, [email],  async (err, result, fields) =>{
 
    if (err) {
      res.send(err.code);
    }
  //  console.log(result)

    if (result.length >= 1) {
      
      isMatch = await bcrypt.compare(password, result[0]?.password);
     
  }
  console.log(result[0]?.password)
  console.log(isMatch,"saa")
    // console.log(result);
    
    if (result.length === 0) {
      res.status(403).send("No Record Found");
    } 
   
    else if (isMatch) {

      let token = await jwt.sign(
        {
          role: result[0].role,
          email: result[0].email,
          password: result[0].password,
        },
        process.env.APP_SECRET,
        { expiresIn: "3 days" }
      );
      // console.log(token)
      
      // console.log("hello",result[0].password)
      res.status(200).send(token);
    }
  });
});
app.get("/info/:profile",employeeAuth,  (req, res, next) =>{
  const { profile } = req.params;
 const id = profile.substring(0,)
 console.log(id,"id")
  const sql = "select * from users where email = ?";
  db.query(sql, [id], (err, rows) => {
    if (err) {
      res.send(err.code);
    } else {
      // console.log(rows)
      // console.log("hello")
      res.send(rows);
    }
  });
});
app.get("/:profile/users",checkRole(["admin"]), function (req, res, next) {

  db.query("SELECT * FROM users",  (err, rows) =>{
    if (err) {
      console.log(err)
      res.send(rows);
    } else {
      // res.render("home", { data: rows });
      res.send(rows)
    }
  })

});

app.listen(3002,"192.168.1.6" ,() => {
  console.log("Server is listening");
});

