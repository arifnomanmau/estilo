// Base URL for API requests
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Using a relative URL works in both environments
  : ''; // Empty string for local development (same origin)

// API path mapping for auth endpoints
// These must match the exact paths expected by the server in api/index.js
export const API_PATHS = {
  // Direct endpoint routes that match the cases in the main switch statement
  LOGIN: '/api/login',         // Changed back to direct endpoint
  LOGOUT: '/api/logout',       // Changed back to direct endpoint
  REGISTER: '/api/register',   // Changed back to direct endpoint
  USER: '/api/user',          // Changed back to direct endpoint
  CONTACT: '/api/contact',
  CONSULTATIONS: '/api/consultations'
};

// Max retries for API requests
export const MAX_API_RETRIES = 2;

// Authentication timeout in milliseconds
export const AUTH_TIMEOUT = 30000; // 30 seconds 