const express = require('express');
const joi = require('joi');
const WrapAsync = require('../utils/WrapAsync');
const ExpressError  = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campgrounds');

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

router.post('/reviews' , validateReview ,WrapAsync(async (req, res , next) => {
    const id = req.params.id;
    const {rating , comment} = req.body;
    const campground = await Campground.findById(id);

    const review = new Review({rating , comment});
    
    campground.reviews.push(review);

    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/:reviewID' , WrapAsync(async (req , res , next) => {
    const {id , reviewID} = req.params;
    await Campground.findByIdAndUpdate(id , {$pull : {reviews : reviewID}});
    await Review.findByIdAndDelete(reviewID);
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;