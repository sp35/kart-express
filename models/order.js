const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    },
    shopper: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Shopper' 
    },
    deliverer: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Deliverer' 
    },
    orderDateTime: {
        type: Date,
        default: Date.now()
    },
    deliveredDateTime: {
        type: Date,
        default: null
    },
    accepted: {
        type: Boolean,
        default: false
    },
    arrived: {
        type: Boolean,
        default: false
    },
    delivered: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('Order', orderSchema);
