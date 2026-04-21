import axios from 'axios'

const BASE = 'http://localhost:8081/api/profile'

export async function getProfile() {
  const res = await axios.get(BASE)
  return res.data
}

export async function updateProfile(payload) {
  const res = await axios.put(BASE, payload)
  return res.data
}

// ✅ Updated function
export async function updatePassword(payload) {
  try {
    const res = await axios.put(`${BASE}/password`, payload, {
      withCredentials: true,     // Important for cookies/sessions
      maxRedirects: 0,           // Don't let axios follow redirect automatically
      validateStatus: status => status < 400 || status === 302  // Allow redirect status
    });
    return res.data;
  } catch (error) {
    // Handle OAuth redirect case
    if (error.response?.status === 302 || 
        error.response?.headers?.location?.includes('accounts.google.com')) {
      
      // Let the browser handle the Google OAuth redirect naturally
      window.location.href = error.response.headers.location;
      return null; // Stop further execution
    }
    
    // Re-throw other errors
    throw error;
  }
}

export async function updateProfilePicture(imageData) {
  const res = await axios.put(`${BASE}/picture`, { imageData }, {
    withCredentials: true
  });
  return res.data
}