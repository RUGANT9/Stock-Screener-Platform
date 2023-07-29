const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
    stock_symbol: {
        type: String,
        require: true
    },
    quantity: {
        type: Number,
        require: true
    },
    curr_value: {
        type: Number,
        require: true
    }
});


module.exports = mongoose.model('Holding', holdingSchema);
