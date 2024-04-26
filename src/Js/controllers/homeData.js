export function loadData() {
  fetch('/getCourses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pageNum: 1, pageSize: 4, pageName: 'Home' })
  })
    .then(response => response.json())
    .then(data => {
      document.querySelectorAll('.listofcourses .course-card').forEach((e, i) => {
        e.querySelector('.card-title').textContent = data[i].title;
        e.querySelector('.headline').textContent = data[i].headline;
        e.querySelector('.language').textContent = data[i].locale.title;
        e.querySelector('.author').textContent = data[i].visible_instructors[0].display_name;
        e.querySelector('img').src = data[i].image_480x270;
        e.querySelector('.card-body img').src = data[i].visible_instructors[0].image_100x100;
        e.firstElementChild.href = `https://www.udemy.com${data[i].url}`;
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}