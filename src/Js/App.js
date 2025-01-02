const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs')

const app = express();
app.use(bodyParser.json());

const dbConfig = {
  host: 'bgtxdgwdkjspr10mgzjx-mysql.services.clever-cloud.com',
  user: 'usbuexqp4neirm6j',
  password: 'LoCjEip1jPp01eyRuB1w',
  database: 'bgtxdgwdkjspr10mgzjx'
};

const connection = mysql.createConnection(dbConfig);

async function getAccessToken() {
  const tokenUrl = 'https://api.coursera.com/oauth2/client_credentials/token';
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: "A9qdGdnf3iVz78jKKqpCFUOrnSJJTthNUuGUbmAlK912aUVQ",
    client_secret: "ZLM3iY2xK3MrvNW7h7PaLW9SYGLTlsI8Q91BN8QG7br7jM0Pu9Knqb2zinJyu0Wn",
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error('Failed to obtain access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function LogIn(loginData) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM users WHERE email = ?`,
      [loginData.email],
      (err, results) => {
        if (err) {
          console.error('Error checking login:', err);
          return reject({ success: false, message: 'An error occurred while checking login, please try again later' });
        }
        if (results.length === 0) {
          return resolve({ success: false, message: 'User not found' });
        }
        const user = results[0];
        if (user.password !== loginData.password) {
          return resolve({ success: false, message: 'Incorrect password' });
        }
        return resolve({ success: true, message: 'Login successful', info: user });
      }
    );
  });
}

async function signUp(newUser) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM users WHERE email = ?`,
      [newUser.email],
      (err, results) => {
        if (err) {
          console.error('Error adding user:', err);
          return reject({ success: false, message: 'An error occurred while adding user, please try again later' });
        }
        if (results.length > 0) {
          return resolve({ success: false, message: 'User found already, please Log In' });
        }
        connection.query(
          `INSERT INTO users (email, name, password) VALUES (?, ?, ?)`,
          [newUser.email, newUser.name, newUser.password],
          (err) => {
            if (err) {
              console.error('Error adding user:', err);
              return reject({ success: false, message: 'An error occurred while adding user, please try again later' });
            }
            return resolve({ success: true, message: 'User registered successfully' });
          }
        );
      }
    );
  });
}

async function getCourseraCourses({ pageNum, pageSize, query = "", pageName }) {
  try {
    const accessToken = await getAccessToken();
    const courseUrl = `https://api.coursera.org/api/courses.v1?${query !== "" ? `q=search&query=${query}&` : ""}limit=${pageSize}&fields=slug,name,description,photoUrl,instructorIds`;
    const courseResponse = await fetch(courseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
    if (!courseResponse.ok) throw new Error('Failed to fetch Coursera courses');
    const courseData = await courseResponse.json();
    const instructorIds = new Set(courseData.elements.flatMap(course => course.instructorIds));
    if (instructorIds.size === 0) {
      return courseData.elements.map(course => ({
        url: course.slug,
        title: course.name,
        headline: course.description,
        coursePhoto: course.photoUrl,
        locale: { title: course.language },
        visible_instructors: [{
          display_name: "",
          image_100x100: ""
        }],
      }));
    }
    const instructorUrl = `https://api.coursera.org/api/instructors.v1?ids=${[...instructorIds].join(',')}&fields=fullName,photo`;
    const instructorResponse = await fetch(instructorUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
    if (!instructorResponse.ok) throw new Error('Failed to fetch Coursera instructors');
    let instructorData = await instructorResponse.json();
    instructorData = instructorData.elements;
    const mergedCourses = courseData.elements.map(course => ({
      url: course.slug,
      title: course.name,
      headline: course.description,
      image_480x270: course.photoUrl,
      locale: { title: course.language },
      visible_instructors: instructorData.map(i => ({
        display_name: i.fullName,
        image_100x100: i.photo
      })),
    }));
    if (pageName) {
      fs.writeFileSync(`src/Data/${pageName}Courses.json`, JSON.stringify(mergedCourses, null, 2), 'utf8');
    }

    return mergedCourses;
  } catch (error) {
    console.error('Error fetching Coursera courses:', error);
    throw error;
  }
}

app.post('/login', async (req, res) => {
  const loginData = req.body;
  const result = await LogIn(loginData);
  res.json(result);
});

app.post('/signup', async (req, res) => {
  const signUpData = req.body;
  const result = await signUp(signUpData);
  res.json(result);
});

app.post('/getCourses', async (req, res) => {
  const { pageNum, pageSize, query, pageName } = req.body;
  try {
    const courses = await getCourseraCourses({ pageNum, pageSize, query, pageName });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.use(express.static(path.join(__dirname, '../')));
app.use(express.static(path.join(__dirname, '../Views')));

app.listen(3000);
