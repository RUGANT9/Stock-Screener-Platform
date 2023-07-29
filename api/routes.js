const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const User = require('../backend/db/user.js');
const Watchlist = require('../backend/db/watchlist.js');
const router = express.Router();

// Routes will be defined here


// GET request for Login Page
router.get('/login', (req, res) => {
    res.render("login");
});


// GET request for Dashboard Page
router.get('/dashboard', async (req, res) => {
    try {
        const watchlist = await Watchlist.find({});
        if (!watchlist) {
            console.error(err);
            res.send('Error fetching data');
        } else {
            // Render the EJS template with the fetched data
            console.log(watchlist)
            res.render('dashboard', { watchlist });
        }
    } catch (err) {
        console.error(err);
    }
});


// GET request for Signup Page
router.get('/signup', (req, res) => {
    res.render("signup");
});


// GET request for About Page
router.get('/about', (req, res) => {
    res.render("about");
});


// GET request for Profile Page
router.get('/profile', async (req, res) => {
    try {
        const profiles = await User.find({});
        if (!profiles) {
            console.error(err);
            res.send('Error fetching data');
        } else {
            // Render the EJS template with the fetched data
            console.log(profiles)
            res.render('profile', { profiles });
        }
    } catch (err) {
        console.error(err);
    }
});


// GET request for Positions Page
router.get('/positions', (req, res) => {
    res.render("positions");
});


// POST request for Signup Details
router.post('/signup', async (req, res) => {
    const newUser = new User(
        req.body.user
    );
    try {
        const resultant = await newUser.save({});
        if (!resultant) {
            console.error(err);
            res.send('Error saving data');
        } else {
            console.log('Data saved successfully');
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
    }
});


router.get('/dashboard/watchlist/add', async (req, res) => {
    axios('https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=' + req.query.symbol + '&apikey=JP083ZCQZTWKDTSF')
        .then(async (response) => {
            const resp = response.data;
            const yo = Object.keys(resp.bestMatches[0])
            const newWatchlist = new Watchlist({
                stock_symbol: (resp.bestMatches[0][yo[0]]),
            }
            );
            try {
                const resultant = await newWatchlist.save({});
                if (!resultant) {
                    console.error(err);
                    res.send('Error saving data');
                } else {
                    console.log('Watchlist item saved successfully');
                    res.redirect('/dashboard');
                }
            } catch (err) {
                console.error(err);
            }
        })
        .catch((error) => {
            console.log(error);
        })
});

let information = 0;

function updateInformation() {
    information = _.random(50, 200);
}

// Endpoint to provide the updated information
router.get('/api/information', (req, res) => {
    res.json({ information });
});

setInterval(updateInformation, 2000);
module.exports = router;