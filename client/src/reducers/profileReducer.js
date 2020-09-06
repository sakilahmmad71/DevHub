import {
    GET_PROFILE,
    GET_PROFILES,
    PROFILE_LOADING,
    PROFILE_NOT_FOUND,
    CLEAR_CURRENT_PROFILE,
    GET_ERRORS,
} from '../actions/types';

const initialState = {
    profile: null,
    profiles: null,
    loading: false,
};

const profileReducer = (state = initialState, action) => {
    switch (action.type) {
        case PROFILE_LOADING:
            return {
                ...state,
                loading: true,
            };

        case GET_PROFILE:
            return {
                ...state,
                profile: action.payload,
                loading: false,
            };

        case CLEAR_CURRENT_PROFILE:
            return {
                ...state,
                profile: null,
            };

        default:
            return state;
    }
};

export default profileReducer;
