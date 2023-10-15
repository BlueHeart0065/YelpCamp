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
        const price = Math.floor(Math.random() * 3000);

        const camp = new Campground({
            author : '652b8c5b13e1af1da47d09ed',
            location : `${cities[randomNumber].city}, ${cities[randomNumber].state}`,
            title : `${name(descriptors)} ${name(places)}`,
            image : 'http://source.unsplash.com/collection/483251',
            description : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo rerum, quas ullam maiores aspernatur iusto voluptate aperiam debitis perferendis nesciunt. Quo, sequi.',
            price : price
        });

        await camp.save();
        
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})