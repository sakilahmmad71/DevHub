const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// local modules
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const postFormValidation = require('../../validations/post');

//  @route   GET localhost:4000/api/posts/:post_id
//  @desc    get a single post
//  @access  public
router.get('/:post_id', (req, res) => {
    Post.findById(req.params.post_id)
        .then((post) => res.json(post))
        .catch((err) => res.status(400).json({ nopostfound: 'No post found.' }));
});

//  @route   GET localhost:4000/api/posts
//  @desc    get all posts
//  @access  public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then((post) => res.json(post))
        .catch((err) => res.status(400).json({ nopostsfound: 'No posts found.' }));
});

//  @route   POST localhost:4000/api/posts
//  @desc    create posts
//  @access  private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = postFormValidation(req.body);
    if (!isValid) res.status(400).json(errors);

    const newPost = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
    };

    new Post(newPost)
        .save()
        .then((post) => res.json(post))
        .catch((err) => res.status(400).json(err));
});

//  @route   DELETE localhost:4000/api/posts/:id
//  @desc    delete post
//  @access  private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id)
            .then((post) => {
                if (post.user.toString() !== req.user.id) {
                    return res.status(401).json({ notauthorized: 'User not authorized.' });
                }
                post.remove().then(() => res.json({ success: true }));
            })
            .catch((err) => res.status(404).json({ nopostfound: 'Post not found.' }));
    });
});

//  @route   POST localhost:4000/api/posts/like/:id
//  @desc    like post
//  @access  private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id)
            .then((post) => {
                if (post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
                    return res.status(400).json({ alreadyliked: 'User already liked this post.' });
                }
                post.likes.unshift({ user: req.user.id });
                post.save().then((post) => res.json(post));
            })
            .catch((err) => res.status(404).json({ nopostfound: 'Post not found.' }));
    });
});

//  @route   POST localhost:4000/api/posts/unlike/:id
//  @desc    unlike post
//  @access  private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
        Post.findById(req.params.id)
            .then((post) => {
                if (
                    post.likes.filter((like) => like.user.toString() === req.user.id).length === 0
                ) {
                    return res
                        .status(400)
                        .json({ alreadyliked: 'You are not yet like this post.' });
                }
                const removeIndex = post.likes
                    .map((item) => item.user.toString())
                    .indexOf(req.user.id);

                post.likes.splice(removeIndex, 1);
                post.save().then((post) => res.json(post));
            })
            .catch((err) => res.status(404).json({ nopostfound: 'Post not found.' }));
    });
});

//  @route   POST localhost:4000/api/posts/comment/:id
//  @desc    comment to a post
//  @access  private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = postFormValidation(req.body);
    if (!isValid) res.status(400).json(errors);

    Post.findById(req.params.id)
        .then((post) => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id,
            };

            post.comments.unshift(newComment);
            post.save().then((post) => res.json(post));
        })
        .catch((err) => res.status(404).json({ nopostfound: 'Post not found.' }));
});

//  @route   DELETE localhost:4000/api/posts/comment/:id/:comment_id
//  @desc    delete comment
//  @access  private
router.delete(
    '/comment/:id/:comment_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = postFormValidation(req.body);
        if (!isValid) res.status(400).json(errors);

        Post.findById(req.params.id)
            .then((post) => {
                if (
                    post.comments.filter(
                        (comment) => comment._id.toString() === req.params.comment_id
                    ).length === 0
                ) {
                    return res.status(404).json({ commentnotexist: 'Comment does not exist.' });
                }

                const removeIndex = post.comments
                    .map((item) => item._id.toString())
                    .indexOf(req.params.comment_id);

                post.comments.splice(removeIndex, 1);

                post.save().then((post) => res.json(post));
            })
            .catch((err) => res.status(404).json({ nopostfound: 'Post not found.' }));
    }
);

module.exports = router;
