const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const Chart = require('chart.js');
const flash = require('connect-flash');
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
    if (req.query.given) {
        const given = req.query.given;
        try {
            const tempDataStore = [];
            // Render the EJS template with the fetched data
            res.render('dashboard', { tempDataStore, given });
        } catch (err) {
            console.error(err);
        }
    } else {
        try {
            const tempDataStore = [];
            // Render the EJS template with the fetched data
            res.render('dashboard', { tempDataStore });
        } catch (err) {
            console.error(err);
        }
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
            // Render the EJS template with the fetched datas
            res.render('profile', { profiles });
        }
    } catch (err) {
        console.error(err);
    }
});


// GET request for Watchlist Page
router.get('/watchlist', async (req, res) => {
    try {
        const stocks_list = await Watchlist.find({});
        if (!stocks_list) {
            console.error(err);
            res.send('Error fetching data');
        } else {
            // Render the EJS template with the fetched data
            res.render('watchlist', { stocks_list });
        }
    } catch (err) {
        console.error(err);
    }
});


router.post('/watchlist/add', async (req, res) => {
    // const ticker = Watchlist.find({ stock_symbol: req.body.stock_symbol });
    // if (ticker) {
    //     return req.flash("Error", "Stock already exists in the Watchlist");
    // }
    const newWatchlist = new Watchlist(
        req.body
    );
    try {
        const result = await newWatchlist.save({});
        if (!result) {
            console.error(err);
            res.send('Error saving data');
        } else {
            console.log('Data saved successfully');
            res.redirect('/watchlist');
        }
    } catch (err) {
        console.error(err);
    }
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


router.get('/searchview', async (req, res) => {
    symb = req.query.symbol;
    if (req.query.select_time === 'Intraday') {
        axios('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + symb + '&interval=5min&apikey=JP083ZCQZTWKDTSF')
            .then(async (response) => {
                const symbol = req.query.symbol.toUpperCase();
                const data = response.data;
                const tempDataStore = [];
                const tSeries = data['Time Series (5min)'];
                for (var tempData in tSeries) {
                    // Here You get your Date
                    // console.log("Your Date - " + tempData);
                    // console.log(tSeries[tempData]);
                    // console.log(tSeries[tempData]['1. open']);
                    // console.log(tSeries[tempData]['2. high']);
                    tempDataStore.push({ "Date": tempData, "open": tSeries[tempData]['1. open'], "high": tSeries[tempData]['2. high'], "low": tSeries[tempData]['3. low'], "close": tSeries[tempData]['4. close'], "volume": tSeries[tempData]['5. volume'] })
                }
                res.render('searchview', { tempDataStore, symbol });
            })
            .catch((error) => {
                console.log(error);
            })
    }
    else if (req.query.select_time === 'Daily') {
        axios('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + symb + '&apikey=JP083ZCQZTWKDTSF')
            .then(async (response) => {
                const symbol = req.query.symbol.toUpperCase();
                const data = response.data;
                const tempDataStore = [];
                const Dates = [];
                const Close = [];
                const tSeries = data['Time Series (Daily)'];
                for (var tempData in tSeries) {
                    // Here You get your Date
                    Dates.push(tempData);
                    // console.log(tSeries[tempData]);
                    // console.log(tSeries[tempData]['1. open']);
                    Close.push(tSeries[tempData]['4. close']);
                    tempDataStore.push({ "Date": tempData, "open": tSeries[tempData]['1. open'], "high": tSeries[tempData]['2. high'], "low": tSeries[tempData]['3. low'], "close": tSeries[tempData]['4. close'], "volume": tSeries[tempData]['5. volume'] })
                }
                const chart_data = {
                    labels: Dates,
                    values: Close,
                };
                res.render('searchview', { tempDataStore, symbol });

            })
            .catch((error) => {
                console.log(error);
            })
    }
});



module.exports = router;
