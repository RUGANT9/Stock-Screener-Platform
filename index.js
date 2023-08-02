const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require("path");
const app = express()
const port = 3000

// Set the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/frontend/views'));

// Set the public assets/images for express
app.use(express.static(__dirname + '/public'));

// Set the css for express
app.use(express.static(__dirname + '/frontend/css'));

// To have Flash
app.use(flash());

// To parse json
app.use(express.json());

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));

// To use extra methods
app.use(methodOverride('_method'));

// Import routes
const router = require('./api/routes');

// Use the router
app.use('/', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/RugantTradingPlatform', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Failed to connect to MongoDB:', error));