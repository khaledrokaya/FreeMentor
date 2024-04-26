import { loadData } from "../controllers/coursesData.js";

const ShowCoursesData = (coursesData) => {
  document.querySelectorAll('.listofcourses #templateCourseCard').forEach((e, i) => {
    e.querySelector('.card-title').textContent = coursesData[i].title;
    e.querySelector('.headline').textContent = coursesData[i].headline;
    e.querySelector('.language').textContent = coursesData[i].locale.title;
    e.querySelector('.author').textContent = coursesData[i].visible_instructors[0].display_name;
    e.querySelector('.author-photo').src = coursesData[i].visible_instructors[0].image_100x100;
    e.querySelector('img').src = coursesData[i].image_480x270;
    document.querySelectorAll('.courseLink')[i].href = `https://www.udemy.com${coursesData[i].url}`;
    document.querySelectorAll('.courseLink')[i].target = `_blank`;
  });
}

window.addEventListener('load', function () {
  let listOfCourses = document.querySelectorAll('.listofcourses .row');
  let listOfCoursesContainer = document.querySelector('.listofcourses .row');
  const message = document.createElement('h5');
  message.textContent = 'Sorry, there are no courses available matching your selected criteria. Please try adjusting your filters or check back later for updates.';
  message.style.cssText = 'max-width: 100%; margin: 0 auto; background-color: #eee; padding: 30px 40px; border-radius: 25px;'

  listOfCourses.forEach(lst => {
    let templateCourseCard = lst.querySelector('#templateCourseCard');
    for (let i = 0; i < 9; i++) {
      let clonedCard = templateCourseCard.cloneNode(true);
      lst.appendChild(clonedCard);
    }
  });
  document.querySelector('.filter-container .closeFilters').addEventListener('click', ()=>{ document.querySelector('.filter-container').classList.remove('active'); })
  document.querySelector('.filters').addEventListener('click', () => {
    document.querySelector('.filter-container').classList.toggle('active');
  });
  let data = {};
  data['category'] = document.title;
  data['pageNum'] = 1;
  data['pageSize'] = 10;
  data['pageName'] = document.title;
  loadData(data).then(coursesData => {
    ShowCoursesData(coursesData);
  })
  document.querySelector('.showResults').addEventListener('click', () => {
    let data = {};
    data['category'] = document.title;
    data['pageNum'] = 1;
    data['pageSize'] = 10;
    data['pageName'] = document.title;
    document.querySelectorAll('input[type="radio"]:checked').forEach(e => {
      data[e.name] = e.id;
    });
    loadData(data).then(coursesData => {
      listOfCoursesContainer.childNodes.forEach((e, i) => {
        if (e.nodeType === 1)
          e.style.display = 'none';
      });
      for (let i = 0; i < coursesData.length; i++) {
        listOfCoursesContainer.children[i].style.display = 'block';
      }
      if (!coursesData.length) {
        listOfCoursesContainer.appendChild(message);
      }
      else {
        if (listOfCoursesContainer.lastElementChild === message)
          listOfCoursesContainer.removeChild(listOfCoursesContainer.lastElementChild);
      }
      ShowCoursesData(coursesData);
    });
    document.querySelector('.filter-container').classList.toggle('active');
  });
  $(".sort").click(function () {
    $(".business-courses .dropdown-toggle").text(` Sort by ${$(this).text()}`);
    $(".business-courses .menuo-sort").css("width", "270px");
  });
  $(".Filter").click(function () {
    $(".left-frame").slideToggle("slow");
  });
  for (let i = 1; i <= 6; i++) {
    $(`.item${i}`).click(function () {
      $(`.sitem${i}`).slideToggle("slow");
      if (i === 3) $(".skill-search").slideUp("slow");
    });
  }
  $('#searchInput').click(function () {
    $(".skill-search").slideToggle("slow");
  });
  $('#searchInput').on('input', function () {
    let query = $(this).val().toLowerCase();
    $('#programmingSkills option').each(function () {
      let optionText = $(this).text().toLowerCase();
      if (optionText.indexOf(query) === -1) {
        $(this).hide();
      } else {
        $(this).show();
      }
    });
  });
  document.querySelector('.resetFilters').addEventListener('click', () => {
    document.querySelectorAll('[type="radio"]').forEach(e => e.checked = false)
  });
});