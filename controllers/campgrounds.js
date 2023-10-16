const campgrounds = require('../models/campgrounds');
const Campground = require('../models/campgrounds');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;


const geocoder = mbxGeocoding({accessToken : mapToken})

module.exports.index = async (req , res , next) => {
    const campgrounds = await Campground.find({});

    res.render('index' , {campgrounds});
}

module.exports.new  = (req , res) => {
    res.render('new');
}

module.exports.createNew  = async (req, res, next) => {

    const geoData = await geocoder.forwardGeocode({
        query : req.body.location,
        limit : 1
    }).send();

    const { title, location, image, price, description } = req.body;

    const camp = new Campground({
        title: title,
        location: location,
        price: price,
        description: description,
        author : req.user.id
    });

    camp.geometry = geoData.body.features[0].geometry;

    camp.images = req.files.map(f => ({url : f.path , filename : f.filename}));

    await camp.save();
    req.flash('success' , 'New campgound created');
    res.redirect(`/campgrounds/${camp.id}`);

}

module.exports.edit = async (req , res , next) => {
    const id = req.params.id;
    const camp = await Campground.findById(id);
    res.render('edit' , {camp});
}

module.exports.createEdit = async (req , res , next) => {
    const id = req.params.id;
    const {title , location , price , description} = req.body;

    const camp = await Campground.findByIdAndUpdate(id , {'title' : title , 'location' : location , 'price' : price , 'description' : description});

    const imgs = req.files.map(f => ({url : f.path , filename : f.filename}))

    camp.images.push(...imgs);

    if(req.body.deleteimages){
        for(let filename of req.body.deleteimages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull : {images : {filename : {$in : req.body.deleteimages}} } } );
    }

    await camp.save();

    req.flash('success' , 'Successfully updated campground');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.delete = async (req, res, next) => {

    const id = req.params.id;
    
    await Campground.findByIdAndDelete(id);
    req.flash('deletion' , 'Campground was deleted');
    res.redirect('/campgrounds');

}

module.exports.show = async (req , res , next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate({
        path : 'reviews',
        populate : {
            path : 'author'
        }
    }).populate('author');
    res.render('show' , {campground});
}