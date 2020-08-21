const express = require('express');
const mongoose = require('mongoose');
const bodyParse = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');

// local files requiring
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// Initializing our App
const App = express();

// setting up morgan to see every request
App.use(morgan('dev'));

// settingup bodyparser middleware
App.use(bodyParse.urlencoded({ extended: false }));
App.use(bodyParse.json());

// DB config
const db = require('./config/config').mongoURI;

// connect to mongodb
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log(`MongoDB connected`))
    .catch((err) => console.log(err));

// passport middleware and passport config
App.use(passport.initialize());
require('./config/passport.cong')(passport);

// Use routes
App.use('/api/users', users);
App.use('/api/profile', profile);
App.use('/api/posts', posts);

const PORT = process.env.PORT || 4000;
App.listen(PORT, () => console.log(`Server listenning on port ${PORT}...`));
