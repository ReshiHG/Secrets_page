//jshint esversion:6

// packages
// Dotenv is for still variables secure when publish on gitHub
require('dotenv').config();
const   express = require("express"),
        bodyParser = require("body-parser"),
        ejs = require("ejs"),
        mongoose = require("mongoose"),
        md5 = require("md5"),
        bcrypt = require("bcrypt");

const app = express();
const saltRounds = 10;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// ----------------------- Connection database ---------------------------------

// Contect with mongo
mongoose.connect(
    'mongodb://localhost:27017/userDB',
    {useNewUrlParser: true, useUnifiedTopology: true}
);

// Conection Test
mongoose.connection.on("error", console.error.bind(console, "connection error:"));

mongoose.connection.once("open", () => {
  console.log("Connection to userDB successfully!");
});

// -------------------------- Create schema and Model --------------------------
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);



// user1.save((err) => {
//     if (err) return console.log(err);
//     console.log("User saved successfully");
// });

// ----------------------------------- GET -------------------------------------

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

// ----------------------------------- POST ------------------------------------

app.post('/register', (req, res) => {

    // -------------------------- To encrypt password ------------------------------

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });

        newUser.save((err) => {
            if (err) return console.log(err);
            console.log("User saved successfully");
            res.render("secrets");
        });
    });

});


app.post("/login", (req, res) => {
    const   username = req.body.username,
            password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
        if (err) return console.log(err);
        if (foundUser) {
            // This part is important for de authentication
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if (result) {
                    res.render("secrets");
                } else {
                    res.send("La contraseña no coincide");
                }
            });
        } else {
            res.send("El usuario no existe");
        }
    });
});





app.listen(3000, () => {
  console.log("Server started on port 3000");
});
