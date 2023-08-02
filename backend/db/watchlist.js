const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    stock_symbol: {
        type: String,
        require: true,
        unique: true,
    }
});


module.exports = mongoose.model('Watchlist', watchlistSchema);