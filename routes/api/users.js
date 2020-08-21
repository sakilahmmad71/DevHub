const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Local modules
const User = require('../../models/User');
const keys = require('../../config/config');

// validation modules
const registerInputValidation = require('../../validations/register');
const loginInputValidation = require('../../validations/login');

// define application router
const router = express.Router();

//  @route   POST localhost:4000/api/users/register
//  @desc    register an user route
//  @access  public
router.post('/register', (req, res) => {
    // Validate register input first
    const { errors, isValid } = registerInputValidation(req.body);
    if (!isValid) res.status(400).json(errors);

    User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            errors.email = 'Email already exist.';
            return res.status(400).json(errors);
        } else {
            const avatar = gravatar.url(req.body.email, { s: '200', r: 'pg', d: 'mm' });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password,
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;

                    newUser
                        .save()
                        .then((user) => res.json(user))
                        .catch((err) => res.json(err));
                });
            });
        }
    });
});

//  @route   POST localhost:4000/api/users/login
//  @desc    login to user account
//  @access  public
router.post('/login', (req, res) => {
    // Validate register input first
    const { errors, isValid } = loginInputValidation(req.body);
    if (!isValid) res.status(400).json(errors);

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email }).then((user) => {
        // check for user
        if (!user) {
            errors.email = 'User not found.';
            return res.status(404).json(errors);
        }

        // check password
        bcrypt.compare(password, user.password).then((isMatched) => {
            if (isMatched) {
                // User matched
                const payload = { id: user.id, name: user.name, avatar: user.avatar };
                // sign token
                jwt.sign(payload, keys.secretOrKey, { expiresIn: '2h' }, (err, token) => {
                    res.json({ success: true, token: `Bearer ${token}` });
                });
            } else {
                errors.password = 'Password incorrect.';
                return res.status(400).json(errors);
            }
        });
    });
});

//  @route   GET localhost:4000/api/users/current
//  @desc    return current user
//  @access  private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
    });
});

module.exports = router;
