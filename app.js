//jshint esversion:6

// packages
// Dotenv is for still variables secure when publish on gitHub
require('dotenv').config();
const   express = require("express"),
        bodyParser = require("body-parser"),
        ejs = require("ejs"),
        mongoose = require("mongoose"),
        // bcrypt = require("bcrypt"),
        session = require('express-session'),
        passport = require("passport"),
        passportLocalMongoose = require("passport-local-mongoose");

const app = express();
// const saltRounds = 10;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// To use Cookies
app.use(session({
    secret: "Frase Secreta ultra recontra 53CR37A.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



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

mongoose.set("useCreateIndex",true);


// -------------------------- Create schema and Model --------------------------
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

// ----------------------------------- POST ------------------------------------

app.post('/register', (req, res) => {

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });

    // // -------------- To encrypt password with hash 5 salt rounds -----------------
    //
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //
    //     newUser.save((err) => {
    //         if (err) return console.log(err);
    //         console.log("User saved successfully");
    //         res.render("secrets");
    //     });
    // });

});


app.post("/login", (req, res) => {

    const user = new User ({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });


    // // -------------- To desencrypt password with hash 5 salt rounds -----------------
    // const   username = req.body.username,
    //         password = req.body.password;
    //
    // User.findOne({email: username}, (err, foundUser) => {
    //     if (err) return console.log(err);
    //     if (foundUser) {
    //         // This part is important for de authentication
    //         bcrypt.compare(password, foundUser.password, function(err, result) {
    //             if (result) {
    //                 res.render("secrets");
    //             } else {
    //                 res.send("La contraseña no coincide");
    //             }
    //         });
    //     } else {
    //         res.send("El usuario no existe");
    //     }
    // });
});





app.listen(3000, () => {
  console.log("Server started on port 3000");
});
