const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path');
const colors = require('colors'); 
const Campground = require('./models/campgrounds');
const Review = require('./models/review');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError  = require('./utils/ExpressError');
const WrapAsync = require('./utils/WrapAsync');
const joi = require('joi');

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

const validateCampground = (req , res , next) => {

    const campgroundSchema = joi.object({
        title : joi.string().required(),
        image : joi.string().required(),
        price : joi.number().required().min(0),
        description : joi.string().required(),
        location : joi.string().required()
    });

    const {error} = campgroundSchema.validate(req.body);
    
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg , 400);
    }
    else{
        next();
    }
}

const validateReview = (req , res , next) => {

    const reviewSchema = joi.object({
        rating : joi.number().required().min(1).max(5),
        comment : joi.string().required()
    });
    
    const {error} = reviewSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg , 400);
    }
    else{
        next();
    }
};

app.get('/' , (req , res) => {
    res.send('working');
})

app.get('/campgrounds', WrapAsync(async (req , res , next) => {
    const campgrounds = await Campground.find({});

    res.render('index' , {campgrounds});
}));

app.get('/campgrounds/new' , (req , res) => {
    res.render('new');
});

app.post('/campgrounds/new', validateCampground , WrapAsync(async (req, res, next) => {
    const { title, location, image, price, description } = req.body;

    const camp = new Campground({
        title: title,
        location: location,
        image: image,
        price: price,
        description: description
    });

    await camp.save();
    res.redirect(`/campgrounds/${camp.id}`);

}));

app.get('/campgrounds/:id/edit' , WrapAsync(async (req , res , next) => {
    const id = req.params.id;

    const camp = await Campground.findById(id);

    res.render('edit' , {camp});
}));

app.put('/campgrounds/:id/edit' , validateCampground ,WrapAsync(async (req , res , next) => {
    const id = req.params.id;
    const {title , location , image , price , description} = req.body;

    await Campground.findByIdAndUpdate(id , {'title' : title , 'location' : location , 'image' : image , 'price' : price , 'description' : description});

    res.redirect(`/campgrounds/${id}`);
}));

app.post('/campgrounds/:id/reviews' , validateReview ,WrapAsync(async (req, res , next) => {
    const id = req.params.id;
    const {rating , comment} = req.body;
    const campground = await Campground.findById(id);

    const review = new Review({rating , comment});
    
    campground.reviews.push(review);

    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id/delete/:reviewID' , WrapAsync(async (req , res , next) => {
    const {id , reviewID} = req.params;
    await Campground.findByIdAndUpdate(id , {$pull : {reviews : reviewID}});
    await Review.findByIdAndDelete(reviewID);
    res.redirect(`/campgrounds/${id}`);
}))

app.delete('/campgrounds/:id', WrapAsync(async (req, res, next) => {

    const id = req.params.id;

    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');

}));

app.get('/campgrounds/:id' , WrapAsync(async (req , res , next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('show' , {campground});
}));

app.all('*' , (req , res , next) => {
    next(new ExpressError('Page not found' , 404));
})

app.use((err , req , res , next)=> {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error' , {err , statusCode});
});


app.listen(port , () => {
    console.log(`listening on port ${port}`);
});