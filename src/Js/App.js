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

async function getCourses({ pageNum, pageSize, pageName, category, subCategory, duration, instructionalLevel }) {
  return new Promise((resolve, reject) => {
    let link = `https://www.udemy.com/api-2.0/courses/?page=${pageNum}&page_size=${pageSize}&price=price-free`;
    link += (category !== undefined) ? `&category=${category}` : '';
    link += (subCategory !== undefined) ? `&subcategory=${subCategory}` : '';
    link += (duration !== undefined) ? `&duration=${duration}` : '';
    link += (instructionalLevel !== undefined) ? `&instructional_level=${instructionalLevel}` : '';
    fetch(link, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Authorization': 'Basic M2J2NGNOMndoUWVHa284RHFWS0VZb1R1OGpzOXBqUHBEcU15RkxkMzpRQnJSQUZkbzc1U1RzbWpYbUdkZlJxTU1aVDlCaTBmQUlNVERYT1huN1ZuZVJrQW9PbWk4Wjh0bHozYmdYbXNEVWJyR1NOU3dOeGJVMVpKYnF4cm9YcFhvNzhPWXBLVzNkV1pYS0JtTEpSbmJUNVphaFRTelNCWDliTHZLc2lnbw==',
        'Content-Type': 'application/json'
      },
      mode: 'no-cors'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch course list');
        }
        return response.json();
      })
      .then(data => {
        fs.writeFile(`src/Data/${pageName}Courses.json`, JSON.stringify(data.results, null, 2), 'utf8', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.results);
          }
        });
      })
      .catch(error => {
        return error;
      });
  });
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
  const coursesData = req.body;
  let result = await getCourses(coursesData);
  res.json(result);
});

app.use(express.static(path.join(__dirname, '../')));
app.use(express.static(path.join(__dirname, '../Views')));

app.listen(3000);
