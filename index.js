const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const path = require("path");
const User = require('./backend/db/user');
const MongoDBStore = require("connect-mongo")(session);

const app = express()
const port = 3000

// Set the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/frontend/views'));

// Set the public assets/images for express
app.use(express.static(__dirname + '/public'));

// Set the css for express
app.use(express.static(__dirname + '/frontend/css'));


const store = new MongoDBStore(
    {
        url: 'mongodb://0.0.0.0:27017/RugantTradingPlatform',
        secret: 'thisshouldbeabettersecret!',
        touchAfter: 24 * 60 * 60
    }
);

store.on('error', function (e) {
    console.log("Session store error", e)
});


const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};


// sanitize( for SQL injection attacks)
app.use(mongoSanitize());


// To have Flash and Session
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


// To parse json
app.use(express.json());

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));

// To use extra methods
app.use(methodOverride('_method'));

//To use Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Import routes
const router = require('./api/routes');
const { MongoStore } = require("connect-mongo");
const { func } = require("joi");

// Use the router
app.use('/', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});


//mongodb+srv://devodutt98:cP5IneuOCZRl74aZ@cluster0.tmfg3z9.mongodb.net/?retryWrites=true&w=majority
// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/RugantTradingPlatform', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Failed to connect to MongoDB:', error));