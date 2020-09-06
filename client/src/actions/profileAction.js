import Axios from 'axios';
import {
    GET_PROFILE,
    GET_PROFILES,
    PROFILE_LOADING,
    PROFILE_NOT_FOUND,
    CLEAR_CURRENT_PROFILE,
    GET_ERRORS,
} from './types';

export const getCurrentProfile = () => (dispatch) => {
    dispatch(setProfileLoading());
    Axios.get('/api/profile')
        .then((res) => {
            dispatch({
                type: GET_PROFILE,
                payload: res.data,
            });
        })
        .catch((error) =>
            dispatch({
                type: GET_PROFILE,
                payload: {},
            })
        );
};

export const setProfileLoading = () => {
    return {
        type: PROFILE_LOADING,
    };
};

export const clearCurrentProfile = () => {
    return {
        type: CLEAR_CURRENT_PROFILE,
    };
};
