const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path');
const colors = require('colors'); 

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError  = require('./utils/ExpressError');
const campRoutes = require('./routes/route-campgrounds');
const reviewRoutes = require('./routes/route-reviews');

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



app.use('/' , campRoutes);
app.use('/campgrounds/:id/' , reviewRoutes);

app.get('/' , (req , res) => {
    res.send('working');
})

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