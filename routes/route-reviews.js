const express = require('express');
const joi = require('joi');
const WrapAsync = require('../utils/WrapAsync');
const ExpressError  = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campgrounds');
const flash = require('connect-flash');


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
    const authorId = await Review.findById(reviewID);
    if(authorId != req.user.id){
        req.flash('failure' ,  `Cannot delete someone else's comment`);
        return res.redirect(`/campgrounds/${id}`);
    }
}

router.post('/reviews' , isLoggedin ,validateReview ,WrapAsync(async (req, res , next) => {
    const id = req.params.id;
    const {rating , comment} = req.body;
    const campground = await Campground.findById(id);

    const review = new Review({rating , comment , author : req.user.id});
    
    campground.reviews.push(review);

    await campground.save();
    await review.save();
    req.flash('success' , 'Comment and Ratings submitted!');
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/:reviewID' , isAuthor ,isLoggedin ,WrapAsync(async (req , res , next) => {
    const {id , reviewID} = req.params;
    await Campground.findByIdAndUpdate(id , {$pull : {reviews : reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('deletion' , 'Your comment was removed!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;