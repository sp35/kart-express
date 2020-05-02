const mongoose = require('mongoose');


const companySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
},
{
	timestamps: true
});

const productSchema = mongoose.Schema({
    imagePath: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    // company: {
    //     type: mongoose.Schema.Types.ObjectId, 
    //     ref: 'Company' 
    // },
}, 
{
	timestamps: true
});

module.exports = {
    'Product': mongoose.model('Product', productSchema),
    'Company': mongoose.model('Company', companySchema)
}
