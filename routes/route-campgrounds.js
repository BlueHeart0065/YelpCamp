const express = require('express');
const WrapAsync = require('../utils/WrapAsync');
const ExpressError  = require('../utils/ExpressError');
const Campground = require('../models/campgrounds');
const joi = require('joi');
const flash = require('connect-flash');


const router = express.Router();

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

const isLoggedin = (req , res , next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('failure' , 'You need to be logged in to complete the action');
        return res.redirect('/login');
    }
    next();
} 

const isAuthor = async (req , res , next) => {
    const id = req.params.id;
    const camp = await Campground.findById(id);
    const authorID = camp.author;

    if(req.user.id != authorID){
        req.flash('failure' , 'You do not have the permission to perform that action');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

router.get('/campgrounds', WrapAsync(async (req , res , next) => {
    const campgrounds = await Campground.find({});

    res.render('index' , {campgrounds});
}));

router.get('/campgrounds/new' ,  isLoggedin ,(req , res) => {
    res.render('new');
});

router.post('/campgrounds/new', validateCampground ,isLoggedin ,WrapAsync(async (req, res, next) => {
    const { title, location, image, price, description } = req.body;

    const camp = new Campground({
        title: title,
        location: location,
        image: image,
        price: price,
        description: description,
        author : req.user.id
    });

    await camp.save();
    req.flash('success' , 'New campgound created');
    res.redirect(`/campgrounds/${camp.id}`);

}));

router.get('/campgrounds/:id/edit' , isLoggedin , isAuthor ,WrapAsync(async (req , res , next) => {
    const id = req.params.id;
    const camp = await Campground.findById(id);
    res.render('edit' , {camp});
}));

router.put('/campgrounds/:id/edit' , isLoggedin , isAuthor ,validateCampground ,WrapAsync(async (req , res , next) => {
    const id = req.params.id;
    const {title , location , image , price , description} = req.body;

    await Campground.findByIdAndUpdate(id , {'title' : title , 'location' : location , 'image' : image , 'price' : price , 'description' : description});
    req.flash('success' , 'Successfully updated campground');
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/campgrounds/:id', isLoggedin , isAuthor , WrapAsync(async (req, res, next) => {

    const id = req.params.id;
    
    await Campground.findByIdAndDelete(id);
    req.flash('deletion' , 'Campground was deleted');
    res.redirect('/campgrounds');

}));

router.get('/campgrounds/:id' , WrapAsync(async (req , res , next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate({
        path : 'reviews',
        populate : {
            path : 'author'
        }
    }).populate('author');
    res.render('show' , {campground});
}));

module.exports = router;