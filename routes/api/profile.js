const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// local modules
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const validateProfileInput = require('../../validations/profile');
const validateExperienceInput = require('../../validations/experience');
const validateEducationInput = require('../../validations/education');

// ==========================   localhost:4000/api/profiles    ==================================== //

//  @route   GET localhost:4000/api/profile
//  @desc    get current profile route
//  @access  protect
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if (!profile) {
                errors.noprofile = 'There is no profile fot this user.';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch((err) => res.status(404).json(err));
});

//  @route   GET localhost:4000/api/profile/handle/:handle
//  @desc    get profile by handle
//  @access  public
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if (!profile) {
                errors.handle = 'No profile found for this handle.';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch((err) => res.status(400).json(err));
});

//  @route   GET localhost:4000/api/profile/user/:ID
//  @desc    get profile by user_id
//  @access  public
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if (!profile) {
                errors.userid = 'No profile found for this user id.';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch((err) => res.status(400).json({ noprofile: 'There is no profile fot this user.' }));
});

//  @route   GET localhost:4000/api/profile/all
//  @desc    get all profile
//  @access  public
router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then((profiles) => {
            if (!profiles) {
                errors.userid = 'No profile found for this user id.';
                res.status(404).json(errors);
            }
            res.json(profiles);
        })
        .catch((err) => res.status(400).json({ noprofile: 'There is no profiles' }));
});

//  @route   POST localhost:4000/api/profile
//  @desc    create user profile
//  @access  private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // validating profile input first
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) res.status(400).json(errors);
    // making a field for data modelling
    const profileFields = {};

    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    if (typeof req.body.skills !== 'undefined') profileFields.skills = req.body.skills.split(',');

    profileFields.social = {};

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then((profile) => {
        if (profile) {
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).then((profile) => res.json(profile));
        } else {
            Profile.findOne({ handle: profileFields.handle }).then((profile) => {
                if (profile) {
                    errors.handle = 'That handle already exist.';
                    res.status(400).json(errors);
                }

                new Profile(profileFields).save().then((profile) => res.json(profile));
            });
        }
    });
});

// ==========================   localhost:4000/api/profiles    ==================================== //

// ==========================   localhost:4000/api/profiles/education and experience    ==================================== //

//  @route   POST localhost:4000/api/profile/experience
//  @desc    create user experience
//  @access  private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    // validating profile input first
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) res.status(400).json(errors);

    Profile.findOne({ user: req.user.id }).then((profile) => {
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description,
        };

        profile.experience.unshift(newExp);
        profile.save().then((profile) => res.json(profile));
    });
});

//  @route   POST localhost:4000/api/profile/education
//  @desc    create user education
//  @access  private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    // validating profile input first
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) res.status(400).json(errors);

    Profile.findOne({ user: req.user.id }).then((profile) => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description,
        };

        profile.education.unshift(newEdu);
        profile.save().then((profile) => res.json(profile));
    });
});

//  @route   DELETE localhost:4000/api/profile/experience/:exp_id
//  @desc    delete user experience
//  @access  private
router.delete(
    '/experience/:exp_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                const removeIndex = profile.experience
                    .map((item) => item.id)
                    .indexOf(req.params.exp_id);
                profile.experience.splice(removeIndex, 1);
                profile.save().then((profile) => res.json(profile));
            })
            .catch((err) => res.status(400).json(err));
    }
);

//  @route   DELETE localhost:4000/api/profile/education/:edu_id
//  @desc    delete user education
//  @access  private
router.delete(
    '/education/:edu_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                const removeIndex = profile.education
                    .map((item) => item.id)
                    .indexOf(req.params.edu_id);
                profile.education.splice(removeIndex, 1);
                profile.save().then((profile) => res.json(profile));
            })
            .catch((err) => res.status(400).json(err));
    }
);

//  @route   DELETE localhost:4000/api/profile
//  @desc    delete user and profile
//  @access  private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
            User.findOneAndRemove({ _id: req.user.id }).then(() => res.json({ success: true }));
        })
        .catch((err) => res.status(400).json(err));
});

module.exports = router;
