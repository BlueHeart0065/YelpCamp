const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const colors = require('colors');
const {places , descriptors} = require('./seedHelpers');

const dbUrl = process.env.MONGO_ATLAS;


mongoose.connect(dbUrl).then(() => {
    console.log('database connected'.zebra);
})
.catch(err => {
    console.log('error in database connection'.zebra , err);
})

const name = (array) => array[Math.floor(Math.random()*array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});

    for(let i = 0 ; i < 300 ;i++){
        const randomNumber = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random() * 3000);

        const camp = new Campground({
            author : '652eb0b251a386f2a143e393',
            location : `${cities[randomNumber].city}, ${cities[randomNumber].state}`,
            geometry : {
                type : 'Point', 
                coordinates : [cities[randomNumber].longitude, cities[randomNumber].latitude]
            },
            title : `${name(descriptors)} ${name(places)}`,
            description : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo rerum, quas ullam maiores aspernatur iusto voluptate aperiam debitis perferendis nesciunt. Quo, sequi.',
            price : price,
            images : [
                {
                    url : 'https://res.cloudinary.com/dox2e0yag/image/upload/v1697433806/YelpCamp/txtvyzyknzihu9jarzu9.jpg',
                    filename : 'YelpCamp/txtvyzyknzihu9jarzu9'
                },
                {
                    url : 'https://res.cloudinary.com/dox2e0yag/image/upload/v1697433823/YelpCamp/psliurbqkv1lbq6qg7wd.jpg',
                    filename : 'YelpCamp/psliurbqkv1lbq6qg7wd'
                }
            ]
        });

        await camp.save();
        
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})