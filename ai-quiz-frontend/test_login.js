import api from './lib/axios.js';

async function testAuth() {
  try {
    const r = await api.post('/auth/register', {
        username: "testuser",
        email: "test@example.com",
        password: "password123"
    });
    console.log("Register response:", r.data);
  } catch (err) {
    if (err.response?.status === 409) {
        console.log("User already exists, continuing to login...");
    } else {
        console.error("Register failed", err.response?.data || err.message);
        return;
    }
  }

  try {
    const l = await api.post('/auth/login', {
        email: "test@example.com",
        password: "password123"
    });
    console.log("Login success!", l.data);
  } catch (err) {
    console.error("Login failed", err.response?.data || err.message);
  }
}

testAuth();
