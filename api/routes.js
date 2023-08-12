const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const passport = require('passport');
const { isLoggedIn } = require('../middleware')
const path = require("path");
const fs = require('fs');
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
            res.redirect('/dashboard');
        })
    } catch (e) {
        console.log(e.message)
        res.redirect('/login');
    }
});


// INFO
router.get('/searchview', isLoggedIn, async (req, res) => {
    symb = req.query.symbol;
    const lister = await Watchlist.find({ user_id: req.user._id });
    var show_add_delete = "";
    lister.forEach(item => {
        if (symb.toUpperCase() === item.stock_symbol) {
            show_add_delete = item._id
        }
    })
    const timing = req.query.select_time;
    const tempDataStore = [];
    req.session.timing = timing;
    const news_feed = await axios('https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=' + symb + '&apikey=JP083ZCQZTWKDTSF')
    const items = parseInt(news_feed.data.items);
    const feed = news_feed.data.feed;
    var sentiment = 0;
    for (var i = 0; i < items; i++) {
        sentiment = sentiment + feed[i].overall_sentiment_score;
    }
    var sent_avg = sentiment * 1.0 / items;
    var sent_exp = "";
    var angle = 0;
    if (sent_avg <= -0.35) {
        sent_exp = "Bearish";
        angle = -40;
    }
    else if (sent_avg > -0.35 && sent_avg <= -0.15) {
        sent_exp = "Somewhat Bearish";
        angle = -20;
    }
    else if (sent_avg > -0.15 && sent_avg < 0.15) {
        sent_exp = "Neutral";
        angle = 0;
    }
    else if (sent_avg >= 0.15 && sent_avg < 0.35) {
        sent_exp = "Somewhat Bullish";
        angle = 20;
    }
    else if (sent_avg >= 0.35) {
        sent_exp = "Bullish";
        angle = 40;
    }

    axios('https://www.alphavantage.co/query?function=OVERVIEW&symbol=' + symb + '&apikey=JP083ZCQZTWKDTSF')
        .then(async (response) => {
            const symbol = req.query.symbol.toUpperCase();
            const data = response.data;
            tempDataStore.push({ "Name": data.Name, "BookValue": data.BookValue, "Sector": data.Sector, "MarketCapitalization": data.MarketCapitalization, "EPS": data.EPS, "DividendPerShare": data.DividendPerShare, "Description": data.Description, "PEGRatio": data.PEGRatio, "ReturnOnEquityTTM": data.ReturnOnEquityTTM, "GrossProfitTTM": data.GrossProfitTTM, "WeekHigh": data['52WeekHigh'], "WeekLow": data['52WeekLow'], "DayMovingAverage": data['50DayMovingAverage'] });
            res.render('searchview', { tempDataStore, symbol, timing, show_add_delete, sent_exp, angle });
        })
        .catch((error) => {
            console.log(error);
        })
});


// Charting
router.get('/chart-data', async (req, res) => {
    if (req.query.timing === 'Intraday') {
        axios('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + req.query.symbol.toUpperCase() + '&interval=5min&apikey=JP083ZCQZTWKDTSF')
            .then(async (response) => {
                const symbol = req.query.symbol.toUpperCase();
                const data = response.data;
                const tSeries = data['Time Series (5min)'];
                var dates = [];
                var values = [];
                var i = 0;
                for (var tempData in tSeries) {
                    dates.push(i);
                    values.push(tSeries[tempData]['4. close']);
                    i = i + 1;
                    //tempDataStore.push({ "Date": tempData, "open": tSeries[tempData]['1. open'], "high": tSeries[tempData]['2. high'], "low": tSeries[tempData]['3. low'], "close": tSeries[tempData]['4. close'], "volume": tSeries[tempData]['5. volume'] })
                }
                const responseData = { datesss: dates, valuesss: values }
                res.json(responseData);

            })
            .catch((error) => {
                console.log(error);
            })
    }
    else if (req.query.timing === 'Daily') {
        axios('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + req.query.symbol.toUpperCase() + '&apikey=JP083ZCQZTWKDTSF')
            .then(async (response) => {
                const symbol = req.query.symbol.toUpperCase();
                const data = response.data;
                const tSeries = data['Time Series (Daily)'];
                var dates = [];
                var values = [];
                var i = 0;
                for (var tempData in tSeries) {
                    dates.push(i);
                    values.push(tSeries[tempData]['4. close']);
                    i = i + 1;
                    //tempDataStore.push({ "Date": tempData, "open": tSeries[tempData]['1. open'], "high": tSeries[tempData]['2. high'], "low": tSeries[tempData]['3. low'], "close": tSeries[tempData]['4. close'], "volume": tSeries[tempData]['5. volume'] })
                }
                const responseData = { datesss: dates, valuesss: values }
                res.json(responseData);

            })
            .catch((error) => {
                console.log(error);
            })
    }
    else if (req.query.timing === 'Weekly') {
        axios('https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=' + req.query.symbol.toUpperCase() + '&apikey=JP083ZCQZTWKDTSF')
            .then(async (response) => {
                const symbol = req.query.symbol.toUpperCase();
                const data = response.data;
                const tSeries = data['Weekly Time Series'];
                var dates = [];
                var values = [];
                var i = 0;
                for (var tempData in tSeries) {
                    dates.push(i);
                    values.push(tSeries[tempData]['4. close']);
                    i = i + 1;
                    //tempDataStore.push({ "Date": tempData, "open": tSeries[tempData]['1. open'], "high": tSeries[tempData]['2. high'], "low": tSeries[tempData]['3. low'], "close": tSeries[tempData]['4. close'], "volume": tSeries[tempData]['5. volume'] })
                }
                const responseData = { datesss: dates, valuesss: values }
                res.json(responseData);

            })
            .catch((error) => {
                console.log(error);
            })
    }
    else if (req.query.timing === 'Monthly') {
        axios('https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=' + req.query.symbol.toUpperCase() + '&apikey=JP083ZCQZTWKDTSF')
            .then(async (response) => {
                const symbol = req.query.symbol.toUpperCase();
                const data = response.data;
                const tSeries = data['Monthly Time Series'];
                var dates = [];
                var values = [];
                var i = 0;
                for (var tempData in tSeries) {
                    dates.push(i);
                    values.push(tSeries[tempData]['4. close']);
                    i = i + 1;
                    //tempDataStore.push({ "Date": tempData, "open": tSeries[tempData]['1. open'], "high": tSeries[tempData]['2. high'], "low": tSeries[tempData]['3. low'], "close": tSeries[tempData]['4. close'], "volume": tSeries[tempData]['5. volume'] })
                }
                const responseData = { datesss: dates, valuesss: values }
                res.json(responseData);

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
