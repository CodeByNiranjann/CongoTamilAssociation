// src/api.js
// One shared place for all requests to the backend.
// Pages and admin sections import these functions instead of calling fetch directly.

// Backend address. Set VITE_API_URL in a .env file for production.
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Same key that AdminLogin.jsx and App.jsx use
const TOKEN_KEY = "cta_admin_token";

// Sends the request and returns the JSON the backend sent back.
// If anything goes wrong, it throws an Error with a message that is safe to show.
// useAuth: true adds the admin login token to the request.
async function request(path, method, body, useAuth) {
  const headers = {};
  const options = { method: method, headers: headers };

  if (useAuth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.Authorization = "Bearer " + token;
    }
  }

  if (body instanceof FormData) {
    // The browser sets the correct Content-Type for file uploads by itself
    options.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(API_URL + path, options);
  } catch (error) {
    throw new Error("Cannot reach the server. Please try again later.");
  }

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  // Login expired or invalid: clear it and go back to the login page
  if (response.status === 401 && useAuth) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/admin/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  if (response.ok === false) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

// Public or admin GET.  Example: apiGet("/events")  or  apiGet("/events/admin", true)
export function apiGet(path, useAuth) {
  return request(path, "GET", undefined, useAuth === true);
}

// POST with JSON or FormData.  Example: apiPost("/events", formData, true)
export function apiPost(path, body, useAuth) {
  return request(path, "POST", body, useAuth === true);
}

// PUT with JSON or FormData
export function apiPut(path, body, useAuth) {
  return request(path, "PUT", body, useAuth === true);
}

// DELETE
export function apiDelete(path, useAuth) {
  return request(path, "DELETE", undefined, useAuth === true);
}