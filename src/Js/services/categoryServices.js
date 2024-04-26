import { loadData } from "../controllers/coursesData.js";

window.addEventListener('load', ()=> {
  let listOfCourses = document.querySelectorAll('.listofcourses .row');
  listOfCourses.forEach(lst => {
    let templateCourseCard = lst.querySelector('#templateCourseCard');
    for (let i = 0; i < 3; i++) {
      let clonedCard = templateCourseCard.cloneNode(true);
      lst.appendChild(clonedCard);
    }
  });
  let featuredContainer = document.querySelector('.carousel-inner');
  let templateFeaturedCourse = document.querySelector('.carousel-item');
  for (let i = 0; i < 2; i++) {
    let clonedCard = templateFeaturedCourse.cloneNode(true);
    clonedCard.classList.remove('active');
    featuredContainer.appendChild(clonedCard);
  }
  loadData({ pageNum: 1, pageSize: 19, pageName: document.title+'Home', category: document.title }).then(data => {
    document.querySelectorAll('.listofcourses .course-card').forEach((e, i) => {
      e.querySelector('.card-title').textContent = data[i].title;
      e.querySelector('.headline').textContent = data[i].headline;
      e.querySelector('.language').textContent = data[i].locale.title;
      e.querySelector('.author').textContent = data[i].visible_instructors[0].display_name;
      e.querySelector('.author-photo').src = data[i].visible_instructors[0].image_100x100;
      e.querySelector('img').src = data[i].image_480x270;
      e.firstElementChild.href = `https://www.udemy.com${data[i].url}`;
      e.firstElementChild.target = `_blank`;
    });
    document.querySelectorAll('.Featured .carousel-inner .carousel-item').forEach((e, i) => {
      e.querySelector('a img').src = data[i+16].image_480x270;
      e.querySelector('a').href = `https://www.udemy.com${data[i+16].url}`;
      e.querySelector('.card-title').textContent = data[i+16].title;
      e.querySelector('.headline').textContent = data[i+16].headline;
      e.querySelector('.auther').textContent = data[i+16].visible_instructors[0].display_name;
    });
  });

  let sectionTitleLinks = document.querySelectorAll('.section-title ul li');
  let activeLink = sectionTitleLinks[0];
  sectionTitleLinks.forEach(li => {
    li.addEventListener('click', () => {
      activeLink.classList.remove('active');
      document.querySelector(`.${ activeLink.textContent.replace(' ', '-') }`).style.display = 'none';
      activeLink = li
      document.querySelector(`.${ activeLink.textContent.replace(' ', '-') }`).style.display = 'block';
      li.classList.add('active');
    });
  });
});