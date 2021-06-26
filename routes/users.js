const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Models
let User = require('../models/user');

// Regiter Form
router.get('/register', (req, res) => {
  res.render('register');
});

// Register Process
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  (req, res) => {
    // Get Errors
    const errors = validationResult(req).errors;

    if (errors.length > 0) {
      console.log(errors);
      res.render('register', {
        errors: errors,
      });
    } else {
      const { name, email, username, password } = req.body;

      let newUser = new User({
        name,
        email,
        username,
        password,
      });

      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) {
            console.log(err);
          }
          newUser.password = hash;
          newUser.save(function (err) {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash('success', 'You are now registered and can log in');
              res.redirect('/users/login');
            }
          });
        });
      });
    }
  }
);

// Login Form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
