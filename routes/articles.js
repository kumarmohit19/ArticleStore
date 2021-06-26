const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Bring in Models
let Article = require('../models/article');
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add Article',
  });
});

// Add Submit POST Route
router.post(
  '/add',
  [
    check('title', 'Title is required').not().isEmpty(),
    //check('author', 'Author is required').not().isEmpty(),
    check('body', 'Body is required').not().isEmpty(),
  ],
  (req, res) => {
    // Get Errors
    const errors = validationResult(req).errors;

    if (errors.length > 0) {
      res.render('add_article', {
        title: 'Add Article',
        errors: errors,
      });
    } else {
      let article = new Article();
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save(function (err) {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash('success', 'Article Added');
          res.redirect('/');
        }
      });
    }
  }
);

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, function (err, article) {
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    } else {
      res.render('edit_article', {
        title: 'Edit Article',
        article: article,
      });
    }
  });
});

// Update Submit POST Route
router.post('/edit/:id', (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = { _id: req.params.id };

  Article.updateOne(query, article, function (err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Updated');
      res.redirect('/');
    }
  });
});

router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = { _id: req.params.id };

  Article.findById(req.params.id, function (err, article) {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.deleteOne(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

// Get Single Article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, function (err, article) {
    User.findById(article.author, function (err, user) {
      res.render('article', {
        article: article,
        author: user.name,
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please Login');
    res.redirect('/users/login');
  }
}

module.exports = router;
