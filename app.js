const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/db');

mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db = mongoose.connection;

// Check connection
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function (err) {
  console.log(err);
});

// Init App
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Express body-parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extented: true }));

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session Middleware
app.use(
  session({
    secret: 'new secret',
    resave: true,
    saveUninitialized: true,
  })
);

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', (req, res) => {
  Article.find({}, function (err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles,
      });
    }
  });
});

// Route Files
app.use('/articles', require('./routes/articles'));
app.use('/users', require('./routes/users'));

// Start Server
app.listen(3000, function () {
  console.log('Server started on Port 3000...');
});
