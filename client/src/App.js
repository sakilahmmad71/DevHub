import React from 'react';
import jwt_decode from 'jwt-decode';

import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';

import store from './store';

import setAuthToken from './utils/setAuthToken ';
import { setCurrentUser, logoutUser } from './actions/authAction';
import { clearCurrentProfile } from './actions/profileAction';

if (localStorage.jwtToken) {
    setAuthToken(localStorage.jwtToken);
    const decoded = jwt_decode(localStorage.jwtToken);
    store.dispatch(setCurrentUser(decoded));
    const currenTime = Date.now() / 1000;

    if (decoded.exp < currenTime) {
        store.dispatch(logoutUser());
        store.dispatch(clearCurrentProfile());
        window.location.href = '/login';
    }
}

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div className='App'>
                    <Navbar />
                    <Route exact path='/' component={Landing} />
                    <div>
                        <Route exact path='/register' component={Register} />
                        <Route exact path='/login' component={Login} />
                        <Route exact path='/dashboard' component={Dashboard} />
                    </div>
                    <Footer />
                </div>
            </Router>
        </Provider>
    );
}

export default App;
