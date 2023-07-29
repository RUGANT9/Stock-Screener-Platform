const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    stock_symbol: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    quantity: {
        type: Number,
        require: true
    },
    time: {
        type: Date,
        require: true
    },
    user_id: {
        type: String,
        require: true
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;