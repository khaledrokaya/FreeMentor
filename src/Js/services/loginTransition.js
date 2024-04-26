import { LogIn, SignUp } from "../controllers/LoginData.js";

window.onload = async () => {
  let toggleContainer = document.querySelector('.toggle-container');
  let toggleButton = document.querySelector('.toggle-container button');
  let pToggle = document.querySelector('.toggle-container p');
  let h1Toggle = document.querySelector('.toggle-container h1');
  const togglePages = () => {
    window.innerWidth >= 697 ? toggleContainer.classList.toggle('active1') : toggleContainer.classList.toggle('active2')
    setTimeout(() => {
      h1Toggle.textContent = (h1Toggle.textContent === 'Welcome Back!') ? 'Hello, Friend!' : 'Welcome Back!';
      pToggle.textContent = (pToggle.textContent === 'Register with your personal details to use all of site features') ? 'Enter your personal details to use all of site features' : 'Register with your personal details to use all of site features';
      toggleButton.textContent = (toggleButton.textContent === 'Sign In') ? 'Sign Up' : 'Sign In';
    }, 300);
  };

  // Sign Up Actions
  let signUpForm = document.getElementById('SignUp');
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(signUpForm);
    const userData = {};
    formData.forEach((value, key) => {
      userData[key] = value;
    });
    SignUp(userData).then(data => {
      if (data.success) {
        document.querySelectorAll('.message')[0].style.display = 'none';
        document.getElementById('email_signup').value = '';
        document.getElementById('name_signup').value = '';
        document.getElementById('password_signup').value = '';
        togglePages();
      } else {
        document.getElementById('message_signup').textContent = `${data.message}`;
        document.querySelectorAll('.message')[0].style.display = 'flex';
      }
    });
  });

  // Log In Actions
  let logInForm = document.getElementById('LogIn');
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(logInForm);
    const userData = {};
    formData.forEach((value, key) => {
      userData[key] = value;
    });
    LogIn(userData).then(data => {
      if (data.success) {
        document.getElementById('email_login').value = '';
        document.getElementById('password_login').value = '';
        localStorage.name = `${data.info.name}`;
        localStorage.email = `${data.info.email}`;
        localStorage.photo = '';
        history.back();
      } else {
        if (data.message === 'User not found')
          document.getElementById('email_login').value = '';
        if (data.message === 'Incorrect password' || data.message === 'User not found')
          document.getElementById('password_login').value = '';
        document.getElementById('message_login').textContent = data.message;
        document.querySelectorAll('.message')[1].style.display = 'flex';
      }
    });
  });

  // Toggle Button Actions
  toggleButton.addEventListener('click', togglePages);
  toggleContainer.classList.remove('active1');
  toggleContainer.classList.remove('active2');
  const url = new URLSearchParams(location.search);
  const action = url.get('action');
  if (action && action === 'signup') togglePages();
}