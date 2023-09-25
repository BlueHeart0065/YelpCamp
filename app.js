const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path');
const colors = require('colors'); 
const Campground = require('./models/campgrounds');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname , 'public')));
app.use(express.static(path.join(__dirname , 'views')));

mongoose.connect('mongodb://127.0.0.1:27017/Campground').then(() => {
    console.log('database connected'.zebra);
})
.catch(err => {
    console.log('error in database connection'.zebra , err);
})

app.get('/' , (req , res) => {
    res.send('working');
})

app.get('/campgrounds', async (req , res) => {
    const campgrounds = await Campground.find({});

    res.render('index' , {campgrounds});
});

app.get('/campgrounds/new' , (req , res) => {
    res.render('new');
});

app.post('/campgrounds/new' , async (req , res) => {
    const {title , location} = req.body;

    const camp = new Campground({
        title : title,
        location : location
    });

    await camp.save();
    res.redirect(`/campgrounds/${camp.id}`);
});

app.get('/campgrounds/:id' , async (req , res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);

    res.render('show' , {campground});
});





app.listen(port , () => {
    console.log(`listening on port ${port}`);
});