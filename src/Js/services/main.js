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

        if (AuthService.isAuthenticated()) {
            // Hide login/signup buttons
            loginAndSignup?.forEach(elem => {
                if (elem) elem.style.display = 'none';
            });

            const userInfo = AuthService.getUserInfo();
            if (userInfo?.name) {
                let name = userInfo.name;
                // Format name to show first and last name only
                const nameParts = name.split(' ').filter(Boolean);
                if (nameParts.length >= 2) {
                    name = `${nameParts[0]} ${nameParts[1]}`;
                }

                const profileName = profile.querySelector('p');
                if (profileName) profileName.textContent = name;

                // Set profile photo if available
                const profilePhoto = profile.firstElementChild;
                if (profilePhoto && userInfo.photo) {
                    profilePhoto.src = userInfo.photo;
                }

                profile.classList.remove('d-none');
                profile.style.display = 'flex';

                const searchInput = searchForm.children[1];
                if (searchInput) searchInput.style.width = '85%';
            }
        } else {
            loginAndSignup?.forEach(elem => {
                if (elem) elem.style.display = 'flex';
            });
        }

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
        const logoutButton = document.querySelector('.logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                AuthService.logout();
            });
        }
    } catch (error) {
        console.error('Error in main.js:', error);
    }
});