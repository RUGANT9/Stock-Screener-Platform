const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    company_name: String,
    price: String,
    user_id: String,
    quantity: Number,
    transaction_type: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;