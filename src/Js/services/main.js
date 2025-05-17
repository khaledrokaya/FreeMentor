import { AuthService } from './authService.js';

// Make handleCredentialResponse globally available
window.handleCredentialResponse = (response) => {
    AuthService.handleCredentialResponse(response);
};

window.addEventListener('load', function () {
    try {
        // Initialize Google Sign-In
        AuthService.init();

        const profile = document.querySelector('.navbar .profile');
        const loginAndSignup = document.querySelectorAll('.navbar form a');
        const searchForm = document.querySelector('.navbar form');

        if (!profile || !searchForm) {
            console.error('Required DOM elements not found');
            return;
        }

        // Function to update UI based on auth state
        function updateUIForAuthState() {
            const isAuthenticated = AuthService.isAuthenticated();

            // Handle login/signup buttons
            loginAndSignup?.forEach(elem => {
                if (elem) {
                    elem.style.display = isAuthenticated ? 'none' : 'flex';
                }
            });

            // Handle profile section
            if (isAuthenticated) {
                const userInfo = AuthService.getUserInfo();
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
                AuthService.logout();
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