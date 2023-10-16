const express = require('express');
const WrapAsync = require('../utils/WrapAsync');
const ExpressError  = require('../utils/ExpressError');
const Campground = require('../models/campgrounds');
const joi = require('joi');
const flash = require('connect-flash');
const { storage } = require('../cloudinary/index');
const multer = require('multer');
const upload = multer({storage})

//controllers
const campgrounds = require('../controllers/campgrounds');

const router = express.Router();

const validateCampground = (req , res , next) => {

    const campgroundSchema = joi.object({
        title : joi.string().required(),
        // image : joi.string().required(),
        price : joi.number().required().min(0),
        description : joi.string().required(),
        location : joi.string().required(),
        deleteimages : joi.array()
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

router.get('/campgrounds', WrapAsync(campgrounds.index));

router.route('/campgrounds/new')
    .get( isLoggedin , campgrounds.new)
    .post( isLoggedin, upload.array('image'), validateCampground ,WrapAsync(campgrounds.createNew));

router.route('/campgrounds/:id/edit')
    .get( isLoggedin , isAuthor ,WrapAsync(campgrounds.edit))
    .put( isLoggedin , isAuthor , upload.array('image') , validateCampground ,WrapAsync(campgrounds.createEdit));

router.route('/campgrounds/:id')
    .delete( isLoggedin , isAuthor , WrapAsync(campgrounds.delete))
    .get( WrapAsync(campgrounds.show));

module.exports = router;