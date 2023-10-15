const express = require('express');
const joi = require('joi');
const WrapAsync = require('../utils/WrapAsync');
const ExpressError  = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campgrounds');
const flash = require('connect-flash');
const reviews = require('../controllers/reviews');


const router = express.Router({mergeParams : true});


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


const isLoggedin = (req , res , next) => {
    if(!req.isAuthenticated()){
        req.flash('failure' , 'You need to be logged in to complete the action');
        return res.redirect('/login');
    }
    next();
} 

const isAuthor = async (req , res , next) => {
    const id = req.params.id;
    const reviewID = req.params.reviewID;
    const review = await Review.findById(reviewID);
    if(review.author != req.user.id){
        req.flash('failure' ,  `Cannot delete someone else's comment`);
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

router.post('/reviews' , isLoggedin ,validateReview ,WrapAsync(reviews.createReview));

router.delete('/:reviewID' , isAuthor ,isLoggedin ,WrapAsync(reviews.deleteReview));

module.exports = router;