const mongoose = require('mongoose');
const User = require('./user.js');

// Table for the Watchlist Schema

const notelistSchema = new mongoose.Schema({
    stock_symbol: {
        type: String,
        require: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    notepad: {
        type: String,
    }
});


module.exports = mongoose.model('Notelist', notelistSchema);