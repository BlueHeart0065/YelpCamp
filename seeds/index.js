const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const colors = require('colors');
const {places , descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/Campground').then(() => {
    console.log('database connected'.zebra);
})
.catch(err => {
    console.log('error in database connection'.zebra , err);
})

const name = (array) => array[Math.floor(Math.random()*array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});

    for(let i = 0 ; i < 50 ;i++){
        const randomNumber = Math.floor(Math.random()*1000);

        const camp = new Campground({
            location : `${cities[randomNumber].city}, ${cities[randomNumber].state}`,
            title : `${name(descriptors)} ${name(places)}`
        });

        await camp.save();
        
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})