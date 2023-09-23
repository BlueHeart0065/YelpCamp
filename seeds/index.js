const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');


mongoose.connect('mongodb://127.0.0.1:27017/Campground').then(() => {
    console.log('database connected'.zebra);
})
.catch(err => {
    console.log('error in database connection'.zebra , err);
})

const seedDB = async () => {
    await Campground.deleteMany({});
}

seedDB();