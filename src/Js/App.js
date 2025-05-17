import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize environment variables - look for .env in project root
dotenv.config({ path: path.join(__dirname, '../..', '.env') });

// Verify environment variables are loaded
if (!process.env.COURSERA_CLIENT_ID || !process.env.COURSERA_CLIENT_SECRET) {
  console.error('Error: Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../')));

// Constants
const USERS_FILE_PATH = path.join(__dirname, '../../Data/auth/users.json');

// Ensure users directory exists
const usersDir = path.dirname(USERS_FILE_PATH);
if (!fs.existsSync(usersDir)) {
  fs.mkdirSync(usersDir, { recursive: true });
}

// Helper function to read users from JSON file
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      fs.writeFileSync(USERS_FILE_PATH, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Helper function to write users to JSON file
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
}

// Get Coursera access token
async function getAccessToken() {
  try {
    const tokenUrl = 'https://api.coursera.com/oauth2/client_credentials/token';
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.COURSERA_CLIENT_ID,
      client_secret: process.env.COURSERA_CLIENT_SECRET,
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
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Login handler
async function LogIn(loginData) {
  try {
    if (!loginData?.email || !loginData?.password) {
      return { success: false, message: 'Email and password are required' };
    }

    const users = readUsers();
    const user = users.find(u => u.email === loginData.email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.password !== loginData.password) {
      return { success: false, message: 'Incorrect password' };
    }

    return {
      success: true,
      message: 'Login successful',
      info: {
        name: user.name,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'An error occurred while checking login, please try again later' };
  }
}

// Signup handler
async function signUp(newUser) {
  try {
    if (!newUser?.email || !newUser?.password || !newUser?.name) {
      return { success: false, message: 'All fields are required' };
    }

    const users = readUsers();
    const existingUser = users.find(u => u.email === newUser.email);

    if (existingUser) {
      return { success: false, message: 'User found already, please Log In' };
    }

    users.push({
      email: newUser.email,
      name: newUser.name,
      password: newUser.password
    });

    if (writeUsers(users)) {
      return { success: true, message: 'User registered successfully' };
    } else {
      return { success: false, message: 'An error occurred while registering user' };
    }
  } catch (error) {
    console.error('Error during signup:', error);
    return { success: false, message: 'An error occurred while adding user, please try again later' };
  }
}

// Get Coursera courses
async function getCourseraCourses({ pageNum = 1, pageSize = 10, query = "", pageName = null }) {
  try {
    const accessToken = await getAccessToken();

    // Build course URL with query parameters
    const courseUrl = new URL('https://api.coursera.org/api/courses.v1');
    if (query) {
      courseUrl.searchParams.append('q', 'search');
      courseUrl.searchParams.append('query', query);
    }
    courseUrl.searchParams.append('limit', pageSize);
    courseUrl.searchParams.append('fields', 'slug,name,description,photoUrl,instructorIds');

    // Fetch courses
    const courseResponse = await fetch(courseUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!courseResponse.ok) {
      throw new Error('Failed to fetch Coursera courses');
    }

    const courseData = await courseResponse.json();

    // If no courses found, return empty array
    if (!courseData.elements?.length) {
      return [];
    }

    // Get unique instructor IDs
    const instructorIds = new Set(courseData.elements.flatMap(course => course.instructorIds || []));

    // If no instructors, return courses without instructor info
    if (instructorIds.size === 0) {
      return courseData.elements.map(course => ({
        url: course.slug,
        title: course.name,
        headline: course.description,
        coursePhoto: course.photoUrl,
        locale: { title: course.language },
        visible_instructors: [{
          display_name: "Unknown Instructor",
          image_100x100: ""
        }],
      }));
    }

    // Fetch instructor data
    const instructorUrl = new URL('https://api.coursera.org/api/instructors.v1');
    instructorUrl.searchParams.append('ids', [...instructorIds].join(','));
    instructorUrl.searchParams.append('fields', 'fullName,photo');

    const instructorResponse = await fetch(instructorUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!instructorResponse.ok) {
      throw new Error('Failed to fetch Coursera instructors');
    }

    const instructorData = await instructorResponse.json();

    // Merge course and instructor data
    const mergedCourses = courseData.elements.map(course => ({
      url: course.slug ? `https://www.coursera.org/learn/${course.slug}` : `https://www.coursera.org/learn/${course.url}`,
      title: course.name,
      headline: course.description,
      image_480x270: course.photoUrl,
      locale: { title: course.language },
      visible_instructors: instructorData.elements.map(i => ({
        display_name: i.fullName || "Unknown Instructor",
        image_100x100: i.photo || ""
      })),
    }));

    // Save to file if pageName provided
    if (pageName) {
      const dataDir = path.join(__dirname, '../../Data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(dataDir, `${pageName}Courses.json`),
        JSON.stringify(mergedCourses, null, 2),
        'utf8'
      );
    }

    return mergedCourses;
  } catch (error) {
    console.error('Error fetching Coursera courses:', error);
    throw error;
  }
}

// Routes
app.post('/api/login', async (req, res) => {
  try {
    const result = await LogIn(req.body);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const result = await signUp(req.body);
    res.json(result);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/getCourses', async (req, res) => {
  try {
    const { pageNum, pageSize, query, pageName } = req.body;
    const courses = await getCourseraCourses({ pageNum, pageSize, query, pageName });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Error fetching courses', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something broke!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
