const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const passport = require('passport');
const { isLoggedIn } = require('../middleware')
const Chart = require('chart.js');
const path = require("path");
const fs = require('fs');
const flash = require('connect-flash');
const User = require('../backend/db/user.js');
const Watchlist = require('../backend/db/watchlist.js');
const router = express.Router();


// Routes will be defined here


// GET request for Login Page
router.get('/login', (req, res) => {
    res.render("login");
});

// POST request for Login Page
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = '/dashboard';
    res.redirect(redirectUrl);
})

// GET request for Logout
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', "Goodbye!");
        res.redirect('/login');
    });
});

// GET request for Dashboard Page
router.get('/dashboard', isLoggedIn, async (req, res) => {
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
        const given = "";
        try {
            const tempDataStore = [];
            // Render the EJS template with the fetched data
            res.render('dashboard', { tempDataStore, given });
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
router.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const profiles = await User.find({ _id: req.user._id });
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
router.get('/watchlist', isLoggedIn, async (req, res) => {
    try {
        const stocks_list = await Watchlist.find({ user_id: req.user._id });
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


router.post('/watchlist/add', isLoggedIn, async (req, res) => {
    // const ticker = Watchlist.find({ stock_symbol: req.body.stock_symbol });
    // if (ticker) {
    //     return req.flash("Error", "Stock already exists in the Watchlist");
    // }
    console.log(req.body)
    const newWatchlist = new Watchlist({
        stock_symbol: req.body.stock_symbol,
        user_id: req.user._id
    });
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
    try {
        const { email, username, first_name, last_name, mobile_number, password } = req.body.user;
        const user = new User({ email, username, first_name, last_name, mobile_number });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) console.log(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/dashboard');
        })
    } catch (e) {
        console.log(e.message)
        req.flash('error', e.message);
        res.redirect('/login');
    }
});


router.get('/searchview', isLoggedIn, async (req, res) => {
    symb = req.query.symbol;
    const timing = req.query.select_time;
    req.session.timing = timing;
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
                res.render('searchview', { tempDataStore, symbol, timing });
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
                res.render('searchview', { tempDataStore, symbol, timing });

            })
            .catch((error) => {
                console.log(error);
            })
    }
    else if (req.query.select_time === 'Weekly') {
        axios('https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=' + symb + '&apikey=JP083ZCQZTWKDTSF')
            .then(async (response) => {
                const symbol = req.query.symbol.toUpperCase();
                const data = response.data;
                const tempDataStore = [];
                const Dates = [];
                const Close = [];
                const tSeries = data['Weekly Time Series'];
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
                res.render('searchview', { tempDataStore, symbol, timing });

            })
            .catch((error) => {
                console.log(error);
            })
    }
    else if (req.query.select_time === 'Monthly') {
        axios('https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=' + symb + '&apikey=JP083ZCQZTWKDTSF')
            .then(async (response) => {
                const symbol = req.query.symbol.toUpperCase();
                const data = response.data;
                const tempDataStore = [];
                const Dates = [];
                const Close = [];
                const tSeries = data['Monthly Time Series'];
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
                res.render('searchview', { tempDataStore, symbol, timing });

            })
            .catch((error) => {
                console.log(error);
            })
    }
});


router.delete('/watchlist/delete/:id', async (req, res) => {
    const { id } = req.params;
    await Watchlist.findByIdAndDelete(id);
    res.redirect('/watchlist')
})


router.get('/download', async (req, res) => {
    const time = req.query.timing;
    if (time === 'Intraday') {
        var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + req.query.stock_symbol + '&interval=5min&apikey=JP083ZCQZTWKDTSF&datatype=csv';
    }
    else if (time === 'Daily') {
        var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + req.query.stock_symbol + '&apikey=JP083ZCQZTWKDTSF&datatype=csv';
    }
    else if (time === 'Weekly') {
        var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=' + req.query.stock_symbol + '&apikey=JP083ZCQZTWKDTSF&datatype=csv';
    }
    else {
        var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=' + req.query.stock_symbol + '&apikey=JP083ZCQZTWKDTSF&datatype=csv';
    }

    var response = await axios.get(url)

    try {
        const filePath = path.join(__dirname, 'temp.csv'); // You can change the filename or location
        fs.writeFileSync(filePath, response.data);

        // Set the appropriate headers for the response
        res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
        res.setHeader('Content-Type', 'text/csv');

        // Stream the file data to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Clean up: remove the temporary file after streaming it to the response
        fileStream.on('close', () => {
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Error fetching or streaming CSV:', error);
        res.status(500).send('Error fetching or streaming CSV');
    }

});


module.exports = router;
