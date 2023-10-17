const mongoose = require('mongoose');
const Review = require('./review');

const Schema = mongoose.Schema;
const opts = {toJSON : {virtuals : true}};

const campgroundSchema = new Schema({
    title : String,
    images : [{
        url : String,
        filename : String
    }],
    geometry : {
        type : {
            type : String,
            enum : ['Point'],
            required : true
        },
        coordinates : {
            type : [Number],
            required : true
        }
    },
    price : Number,
    description : String,
    location : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
}, opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<p style="font-size : 1.2vw;">${this.title}</p>
    <p style="font-size : 1vw;"> Rs.${this.price}</p>
    <a href="/campgrounds/${this.id}">
    <button class="btn btn-info">visit campground</button>
    </a>`
});

campgroundSchema.post('findOneAndDelete' , async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id : {$in : doc.reviews}
        });
    }
})

module.exports = mongoose.model('Campground' , campgroundSchema);