const mongoose = require('mongoose');
const User = require('./user.js')

const watchlistSchema = new mongoose.Schema({
    stock_symbol: {
        type: String,
        require: true,
        unique: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});


module.exports = mongoose.model('Watchlist', watchlistSchema);