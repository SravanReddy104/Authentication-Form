import Express from "express";
const app = Express();
import cors from "cors";
import mysql from "mysql";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import path, { dirname } from "path";
const __dirname = path.resolve();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sravan@10",
  database: "auth",
});
app.use(cors());
app.use(bodyParser());
db.connect(function (error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log("Database Connected Successfully..!!");
  }
});
const checkRole = (roles) => async (req, res, next) => {
  const i = req.params.profile;
  const id = i.substring(1,)
  

  var sql = "select * from users where email = ?";
  db.query(sql, [id], function (err, result, fields) {
    if (err) {
      res.send(err.code);
    }
    console.log(result,"result");
    if (result.length === 0) {
      res.send("No Record Found");
    } else {
      !roles.includes(result[0].role)
    ? res.status(401).json("Sorry you do not have access to this route")
    : next();
     
    }
  }
  )
  console.log(id)
  // console.log(req);
  // 
};
app.get("/", (req, res) => {
  console.log(__dirname);
  res.send("hello");
});

app.post("/getSignUp", async (req, res) => {
  const { email, password, role } = req.body;
  const pass = await bcrypt.hash(password, 5);
  const data = {
    email: email,
    password: pass,
    role: role,
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
  console.log(email,password);
  var sql = "select * from users where email = ? and password = ?";
  db.query(sql, [email, password], function (err, result, fields) {
    if (err) {
      res.send(err.code);
    }
    console.log(result);
    if (result.length === 0) {
      res.send("No Record Found");
    } else {
      res.sendStatus(200);
    }
  });
});
app.get("/info/:profile", function (req, res, next) {
  const { profile } = req.params;
 const id = profile.substring(1,)
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
  
  db.query("SELECT * FROM users", function (err, rows) {
    if (err) {
      console.log(err)
      res.render("home", { data: "" });
    } else {
      res.render("home", { data: rows });
    }
  })

});

app.listen(8000, () => {
  console.log("Server is listening");
});

