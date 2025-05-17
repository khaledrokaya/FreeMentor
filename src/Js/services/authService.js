import { config } from '../../config.js';
import { jwtDecode } from "https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm";

export class AuthService {
  static init() {
    try {
      if (document.getElementById('g_id_onload')) {
        console.log('Google Sign-In already initialized');
        return;
      }

      // Initialize Google Sign-In
      const divElement = document.createElement("div");
      divElement.id = "g_id_onload";
      divElement.setAttribute("data-client_id", config.googleClientId);
      divElement.setAttribute("data-context", "signin");
      divElement.setAttribute("data-ux_mode", "popup");
      divElement.setAttribute("data-callback", "handleCredentialResponse");
      divElement.setAttribute("data-auto_prompt", "false");
      document.body.appendChild(divElement);

      // Create sign-in button if it doesn't exist
      const navbarForm = document.querySelector('.navbar form');
      if (!document.querySelector('.g_id_signin') && navbarForm) {
        const signInButton = document.createElement("div");
        signInButton.className = "g_id_signin";
        signInButton.setAttribute("data-type", "standard");
        signInButton.setAttribute("data-shape", "rectangular");
        signInButton.setAttribute("data-theme", "outline");
        signInButton.setAttribute("data-text", "sign_in_with");
        signInButton.setAttribute("data-size", "large");
        signInButton.setAttribute("data-logo_alignment", "left");
        navbarForm.appendChild(signInButton);
      }

      // Add error handling for Google Sign-In load
      window.addEventListener('error', (event) => {
        if (event.target && event.target.src && event.target.src.includes('accounts.google.com')) {
          console.error('Google Sign-In failed to load:', event.error);
          this.retryGoogleSignIn();
        }
      });
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      this.retryGoogleSignIn();
    }
  }

  static retryGoogleSignIn() {
    console.log('Retrying Google Sign-In initialization...');
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to reload Google Sign-In script');
    };
    document.body.appendChild(script);
  }

  static handleCredentialResponse(response) {
    try {
      if (!response?.credential) {
        console.error('Invalid credential response');
        return;
      }

      const data = jwtDecode(response.credential);
      if (!data?.name || !data?.email) {
        console.error('Invalid JWT payload');
        return;
      }

      // Store the credential for later use
      localStorage.setItem('g_token', response.credential);
      localStorage.setItem('name', data.name);
      localStorage.setItem('photo', data.picture || '');
      localStorage.setItem('email', data.email);

      // Reload the page to update the UI
      location.reload();
    } catch (error) {
      console.error('Error handling Google sign-in:', error);
      alert('Failed to sign in with Google. Please try again.');
    }
  }

  static isAuthenticated() {
    try {
      const token = localStorage.getItem('g_token');
      const name = localStorage.getItem('name');
      const email = localStorage.getItem('email');

      // Check if we have all required auth data
      if (!token || !name || !email) {
        return false;
      }

      // Try to decode the token to verify it's still valid
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Check if token is expired
        if (decoded.exp && decoded.exp < currentTime) {
          this.logout(); // Clear expired token
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error decoding token:', error);
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  static logout() {
    try {
      // Get the token before clearing storage
      const token = localStorage.getItem('g_token');

      // Clear all auth data
      localStorage.removeItem('g_token');
      localStorage.removeItem('name');
      localStorage.removeItem('photo');
      localStorage.removeItem('email');

      // Revoke Google authentication if token exists
      if (token && window.google && google.accounts && google.accounts.id) {
        google.accounts.id.revoke(token, () => {
          console.log('Google token revoked successfully');
        });
      }

      // Reload the page to update the UI
      location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still try to clear local storage and reload
      localStorage.clear();
      location.reload();
    }
  }

  static getUserInfo() {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      const name = localStorage.getItem('name');
      const photo = localStorage.getItem('photo');
      const email = localStorage.getItem('email');

      // Verify all required fields exist
      if (!name || !email) {
        this.logout(); // Clear invalid data
        return null;
      }

      return {
        name,
        photo: photo || '',
        email
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }
} 