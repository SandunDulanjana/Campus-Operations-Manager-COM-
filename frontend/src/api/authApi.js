import axios from 'axios';

const API_URL = 'http://localhost:8081/api';   // Change if your backend port/route is different
const OAUTH_START_URL = 'http://localhost:8081/oauth2/authorization/google'

// Login with username + password
    export const loginWithCredentials = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
        });
        return response.data;        // Should return { token, user }
    } catch (error) {
        console.error("Login API error:", error.response?.data || error.message);
        throw error;                 // Let the context catch it
    }
    };

    // Optional: Google login start (if you want to keep it as a function)
    export const startGoogleLogin = () => {
    window.location.href = OAUTH_START_URL;
    };
