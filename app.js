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
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/route-users');


const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname , 'public')));
app.use(express.static(path.join(__dirname , 'views')));
app.set('view engine', 'ejs');
app.engine('ejs',ejsMate);
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(flash());

app.use(session({
    secret : 'thisissessionsecret',
    resave : false , 
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires : Date.now() + (1000 * 60 * 60 * 24 * 7 ),
        maxAge : (1000 * 60 * 60 * 24 * 7 ),
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://127.0.0.1:27017/Campground').then(() => {
    console.log('database connected'.blue);
})
.catch(err => {
    console.log('error in database connection'.blue , err);
})

app.use((req , res , next) => {
    console.log('----------------------------------------- SESSION -----------------------------------------'.blue);
    console.log(req.session);
    console.log('----------------------------------------- USER -----------------------------------------'.blue);
    console.log(req.user);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.deletion = req.flash('deletion');
    res.locals.failure = req.flash('failure');
    next();
});

app.use('/' , campRoutes);
app.use('/campgrounds/:id/' , reviewRoutes);
app.use('/' , userRoutes);

app.get('/' , (req , res) => {
    res.send('working');
});

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