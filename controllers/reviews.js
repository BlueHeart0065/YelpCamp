const Campground = require('../models/campgrounds');
const Review = require('../models/review');


module.exports.createReview = async (req, res , next) => {
    const id = req.params.id;
    const {rating , comment} = req.body;
    const campground = await Campground.findById(id);

    const review = new Review({rating , comment , author : req.user.id});
    
    campground.reviews.push(review);

    await campground.save();
    await review.save();
    req.flash('success' , 'Comment and Ratings submitted!');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteReview = async (req , res , next) => {
    const {id , reviewID} = req.params;
    await Campground.findByIdAndUpdate(id , {$pull : {reviews : reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('deletion' , 'Your comment was removed!');
    res.redirect(`/campgrounds/${id}`);
}