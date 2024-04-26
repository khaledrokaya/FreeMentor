window.addEventListener('load', function () {
    let profile = document.querySelector('.navbar .profile');
    let loginAndSignup = document.querySelectorAll('.navbar form a');
    if (localStorage.getItem('name')) {
        loginAndSignup.forEach(elem => elem.style.display = 'none');
        let name = localStorage.name;
        if(name.split(' ').length >=2 )name = name.split(' ')[0]+' '+name.split(' ')[1];
        profile.querySelector('p').textContent = name;
        if (localStorage.getItem('photo'))
            profile.firstElementChild.src = window.localStorage.photo;
        profile.classList.remove('d-none');
        profile.style.display = 'flex';
        document.querySelector('form').children[1].style.width = '85%';
    }
    else {
        loginAndSignup.forEach(elem => elem.style.display = 'flex');
    }
    let searchIcon = document.querySelector('.navbar form svg');
    let searchInput = document.querySelector('.navbar form input');
    searchInput.addEventListener("keypress", (e) => {
        if (e.keyCode === 13) { e.preventDefault(); searchInput.classList.toggle('active'); searchInput.value = ""; }
    });
    searchInput.addEventListener('blur', () => { searchInput.classList.remove('active'); })
    searchIcon.addEventListener('click', () => {
        searchInput.classList.toggle('active');
        if (searchInput.classList.contains('active')) searchInput.focus();
    });
    
    profile.addEventListener('click', () => { profile.classList.toggle('active') });
    document.querySelector('.logOut').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        location.reload();
    });
});