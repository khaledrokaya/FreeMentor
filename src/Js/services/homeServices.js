import { loadData } from '../controllers/homeData.js';
window.onload = () => {
  // Courses Cards
  let templateCourseCard = document.getElementById('templateCourseCard');
  let listOfCourses = document.querySelector('.listofcourses .row');
  for (let i = 0; i < 3; i++) {
    let newCard = templateCourseCard.cloneNode(true);
    listOfCourses.appendChild(newCard);
  }
  loadData();

  // Catalog Cards
  let originalCard = document.getElementById('templateCatalogCard');
  let catalogContainer = document.querySelector('#catalog .row');
  let otherCardsData = [
    { title: "Business", img: "Assets/Images/ay-system.webp", link: "Views/busniss.html" },
    { title: "Cloud Computing", img: "Assets/Images/cloud.webp", link: "Views/opps.html" },
    { title: "Cybersecurity", img: "Assets/Images/cyber.webp", link: "Views/opps.html" },
    { title: "Data Science", img: "Assets/Images/data-sience.webp", link: "Views/opps.html" },
    { title: "Executive Leadership", img: "Assets/Images/leadership.webp", link: "Views/opps.html" },
    { title: "Product Management", img: "Assets/Images/proudect.webp", link: "Views/opps.html" },
    { title: "Artificial Intelligence", img: "Assets/Images/programin.webp", link: "Views/opps.html" },
    { title: "Information Technology", img: "Assets/Images/data-sience.webp", link: "Views/opps.html" },
  ];
  otherCardsData.forEach(function (data) {
    let newCard = originalCard.cloneNode(true);
    let newCardTitle = newCard.querySelector('.card-body .card-title');
    let newLearnMoreBtn = newCard.querySelector('.card-body .btn');
    newCardTitle.textContent = data.title;
    newCard.querySelector('img').src = data.img;
    newLearnMoreBtn.href = data.link;
    catalogContainer.appendChild(newCard);
  });

  // Prag Text Slider
  let text = $(".prag-slide").text();
  $(".prag-slide").empty();
  let index = 0;
  let typing = setInterval(function () {
    $(".prag-slide").append(text[index]);
    index++;
    if (index === text.length) {
      $(".prag-slide").empty();
      index = 0;
    }
  }, 150);

  // Featured Slider
  let slides = [
    { img: "Assets/Images/Advanced-Analytics22.png", title: "Advanced Course Selection", text: "Explore an array of advanced courses to enhance your skill set and knowledge base." },
    { img: "Assets/Images/Work-like-Experiences33.png", title: "Real-World Learning Scenarios", text: "Engage in practical learning experiences tailored to real-world scenarios and challenges." },
    { img: "Assets/Images/Blended-Learning44.png", title: "Flexible Learning Options", text: "Enjoy the flexibility of learning at your own pace with live sessions and on-demand content." },
    { img: "Assets/Images/Training-by-Practitioners55.png", title: "Expert-Led Training Sessions", text: "Learn from industry experts and practitioners who bring real-world insights to the table." },
    { img: "Assets/Images/Outcome-Driven-Learning1.png", title: "Skill-Based Learning Outcomes", text: "Achieve tangible skill-based outcomes through immersive learning experiences on our platform." }
  ];
  let currentIndex = 0;
  let container = $('.slider');
  setInterval(function () {
    container.find('img').attr('src', slides[currentIndex].img);
    container.find('h3').text(slides[currentIndex].title);
    container.find('p').text(slides[currentIndex].text);
    currentIndex = (currentIndex + 1) % slides.length;
  }, 3000);

  // Questions Panels
  const borderRadiusFunc = () => {
    for (let i = 1; i <= 10; i++) {
      let panel = document.querySelector(`.panel${i}`);
      if (!panel.classList.contains('show')) {
        document.querySelector(`.flip${i}`).style.borderRadius = `25px`;
      } else {
        document.querySelector(`.flip${i}`).style.borderRadius = ` 25px 25px 0px 0px`;
      }
    }
  };
  for (let i = 1; i <= 10; i++) {
    $(`.flip${i}`).click(function () {
      $(`.panel${i}`).slideToggle("normal");
      $(`.panel${i}`).toggleClass('show');
      borderRadiusFunc();
    });
  }
  borderRadiusFunc();
}
