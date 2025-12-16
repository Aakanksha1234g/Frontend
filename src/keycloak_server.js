// Import required modules
// const express = require('express');
// const session = require('express-session');
// const axios = require('axios');
// const { keycloak, memoryStore } = require('./keycloak');
import express from 'express';                    //framework to build the server
import session from 'express-session';            //used to manage user sessions
import axios from 'axios';                               //to make http requests ( to communicate with keycloak)
import {keycloak, memoryStore} from './keycloak.js';    //to handle keycloak authentication and manage session storage


const app = express();               //initialize express app

// Middleware to parse JSON requests
app.use(express.json());

// Configure session management
app.use(
  session({
    secret: 'my-secret', // Secret key for session encryption
    resave: false, // Prevents resaving session if not modified
    saveUninitialized: true, // Saves uninitialized sessions
    store: memoryStore, // Stores session data in memory
  })
);

// Integrate Keycloak middleware
app.use(keycloak.middleware());

// Public route accessible without authentication
app.get('/public', (req, res) => res.send('Public Route'));

// Protected route requiring authentication
app.get('/protected', keycloak.protect(), (req, res) => {
  res.send('Protected Route - User Authenticated');
});

// Admin-only route requiring specific role
app.get('/permissions', keycloak.protect('realm:admin'), (req, res) => {
  res.send('Admin Permissions Granted');
});

// Login endpoint to authenticate users
app.post('/login', async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  try {
    // Send request to Keycloak token endpoint
    const response = await axios.post(
      'http://localhost:8080/realms/my-realm/protocol/openid-connect/token',
      new URLSearchParams({
        client_id: 'frontend-client', // Keycloak client ID
        grant_type: 'password', // Grant type for password-based authentication
        username, // Username provided by the user
        password, // Password provided by the user
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Content type for form data
        },
      }
    );

    const { access_token, refresh_token } = response.data; // Extract tokens from Keycloak response

    // Send tokens back to the client
    res.json({
      message: 'Login successful',
      accessToken: access_token,
      refreshToken: refresh_token,
    });
  } catch (error) {
    // Handle authentication errors
    res.status(401).json({
      message: 'Invalid credentials',
      error: error.response?.data || error.message, // Include error details
    });
  }
});

// Signup endpoint to register new users
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body; // Extract user details from request body

  try {
    // Authenticate as Keycloak admin to create new users
    const adminTokenResponse = await axios.post(
      'http://localhost:8080/realms/master/protocol/openid-connect/token',
      new URLSearchParams({
        client_id: 'admin-cli', // Keycloak admin client ID
        grant_type: 'password', // Grant type for password-based authentication
        username: 'admin', // Keycloak admin username
        password: 'admin', // Keycloak admin password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Content type for form data
        },
      }
    );

    const adminToken = adminTokenResponse.data.access_token; // Extract admin token

    // Create a new user in Keycloak
    await axios.post(
      'http://localhost:8080/admin/realms/my-realm/users',
      {
        username, // New user's username
        email, // New user's email
        enabled: true, // Enable the user account
        credentials: [
          {
            type: 'password', // Credential type
            value: password, // User's password
            temporary: false, // Password is not temporary
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`, // Include admin token in headers
          'Content-Type': 'application/json', // Content type for JSON data
        },
      }
    );

    // Send success response
    res.json({ message: 'Signup successful' });
  } catch (error) {
    // Handle signup errors
    res.status(500).json({
      message: 'Signup failed',
      error: error.response?.data || error.message, // Include error details
    });
  }
});

// Start the middleware server
app.listen(3001, () => console.log('Middleware running on http://localhost:3001'));