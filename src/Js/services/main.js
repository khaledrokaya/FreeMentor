// Import jwt-decode from CDN
import { jwtDecode } from "https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm";

// Make handleCredentialResponse globally available
window.handleCredentialResponse = (response) => {
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
};

window.addEventListener('load', function () {
    try {
        // Initialize Google Sign-In
        initGoogleSignIn();

        const profile = document.querySelector('.navbar .profile');
        const loginAndSignup = document.querySelectorAll('.navbar form a');
        const searchForm = document.querySelector('.navbar form');

        if (!profile || !searchForm) {
            console.error('Required DOM elements not found');
            return;
        }

        // Function to update UI based on auth state
        function updateUIForAuthState() {
            const isAuthenticated = isUserAuthenticated();
            console.log("isAuthenticated", isAuthenticated);

            // Handle login/signup buttons
            loginAndSignup?.forEach(elem => {
                if (elem) {
                    elem.style.display = isAuthenticated ? 'none' : 'flex';
                }
            });

            // Handle profile section
            if (isAuthenticated) {
                const userInfo = getUserInfo();
                if (userInfo?.name) {
                    // Format name to show first and last name only
                    const nameParts = userInfo.name.split(' ').filter(Boolean);
                    const displayName = nameParts.length >= 2
                        ? `${nameParts[0]} ${nameParts[1]}`
                        : userInfo.name;

                    // Update profile name
                    const profileName = profile.querySelector('p');
                    if (profileName) {
                        profileName.textContent = displayName;
                    }

                    // Update profile photo
                    const profilePhoto = profile.querySelector('img');
                    if (profilePhoto) {
                        profilePhoto.src = userInfo.photo || '../Assets/Images/profile-photo.svg';
                    }

                    // Show profile section
                    profile.classList.remove('d-none');
                    profile.style.display = 'flex';

                    // Adjust search input width
                    const searchInput = searchForm.querySelector('input');
                    if (searchInput) {
                        searchInput.style.width = '85%';
                    }
                }
            } else {
                // Hide profile section when not authenticated
                profile.classList.add('d-none');
                profile.style.display = 'none';

                // Reset search input width
                const searchInput = searchForm.querySelector('input');
                if (searchInput) {
                    searchInput.style.width = '';
                }
            }
        }

        // Initial UI update
        updateUIForAuthState();

        // Search functionality
        const searchIcon = searchForm.querySelector('svg');
        const searchInput = searchForm.querySelector('input');

        if (searchInput) {
            searchInput.addEventListener("keypress", (e) => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    searchInput.classList.toggle('active');
                    searchInput.value = "";
                }
            });

            searchInput.addEventListener('blur', () => {
                searchInput.classList.remove('active');
            });
        }

        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                searchInput?.classList.toggle('active');
                if (searchInput?.classList.contains('active')) {
                    searchInput.focus();
                }
            });
        }

        // Profile dropdown
        if (profile) {
            profile.addEventListener('click', () => {
                profile.classList.toggle('active');
            });
        }

        // Logout button
        const logoutButton = document.querySelector('.logOut');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }

        // Listen for storage changes (for multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === null || e.key.startsWith('g_') || ['name', 'photo', 'email'].includes(e.key)) {
                updateUIForAuthState();
            }
        });
    } catch (error) {
        console.error('Error in main.js:', error);
    }
});

// Auth helper functions
function initGoogleSignIn() {
    try {
        if (document.getElementById('g_id_onload')) {
            console.log('Google Sign-In already initialized');
            return;
        }

        // Initialize Google Sign-In
        const divElement = document.createElement("div");
        divElement.id = "g_id_onload";
        divElement.setAttribute("data-client_id", "590681556603-9bnp9hfuc87jvvel7ilvramitabtaoui.apps.googleusercontent.com");
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
                retryGoogleSignIn();
            }
        });
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        retryGoogleSignIn();
    }
}

function retryGoogleSignIn() {
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

function isUserAuthenticated() {
    try {
        const name = localStorage.getItem('name');
        const email = localStorage.getItem('email');

        // Check if we have all required auth data
        if (!name || !email) {
            return false;
        }

        // Try to decode the token to verify it's still valid
        try {
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

function getUserInfo() {
    try {
        if (!isUserAuthenticated()) {
            return null;
        }

        const name = localStorage.getItem('name');
        const photo = localStorage.getItem('photo');
        const email = localStorage.getItem('email');

        // Verify all required fields exist
        if (!name || !email) {
            logout(); // Clear invalid data
            return null;
        }

        return {
            name,
            photo: photo || `https://ui-avatars.com/api/?name=${name}`,
            email
        };
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}

function logout() {
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