const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path');
const colors = require('colors'); 
const Campground = require('./models/campgrounds');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname , 'public')));
app.use(express.static(path.join(__dirname , 'views')));
app.set('view engine', 'ejs');
app.engine('ejs',ejsMate);
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

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

app.post('/campgrounds/new' , async (req , res , next) => {

    try{

        const {title , location , image , price , description} = req.body;
    
        const camp = new Campground({
            title : title,
            location : location,
            image : image,
            price : price,
            description : description
        });
    
        await camp.save();
        res.redirect(`/campgrounds/${camp.id}`);
    }catch (e){
        next(e);
    }
});

app.get('/campgrounds/:id/edit' , async (req , res) => {
    const id = req.params.id;

    const camp = await Campground.findById(id);

    res.render('edit' , {camp});
})

app.put('/campgrounds/:id/edit' , async (req , res) => {
    const id = req.params.id;
    const {title , location , image , price , description} = req.body;

    await Campground.findByIdAndUpdate(id , {'title' : title , 'location' : location , 'image' : image , 'price' : price , 'description' : description});

    res.redirect(`/campgrounds/${id}`);
})

app.delete('/campgrounds/:id' , async (req , res) => {
    const id = req.params.id;
    
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

app.get('/campgrounds/:id' , async (req , res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);

    res.render('show' , {campground});
});


app.use((err , req , res , next)=> {
    res.send('error occoured'.blue);
})




app.listen(port , () => {
    console.log(`listening on port ${port}`);
});