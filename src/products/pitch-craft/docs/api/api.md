# Pitch Craft API Reference

This document provides a reference for the API endpoints used by the Pitch Craft application.

## Projects

### Get Projects

*   **URL:** `/api/pitch-craft/projects`
*   **Method:** `GET`
*   **Description:** Fetches a list of all Pitch Craft projects.
*   **Success Response:**
    *   **Code:** 200
    *   **Content:** `[{ "id": "string", "name": "string", "createdAt": "date" }]`

### Create Project

*   **URL:** `/api/pitch-craft/projects`
*   **Method:** `POST`
*   **Description:** Creates a new Pitch Craft project.
*   **Data Params:** `{"name": "string"}`
*   **Success Response:**
    *   **Code:** 201
    *   **Content:** `{"id": "string", "name": "string", "createdAt": "date"}`

### Get Project

*   **URL:** `/api/pitch-craft/projects/{id}`
*   **Method:** `GET`
*   **Description:** Fetches a single Pitch Craft project by its ID.
*   **Success Response:**
    *   **Code:** 200
    *   **Content:** `{"id": "string", "name": "string", "data": "object"}`

### Update Project

*   **URL:** `/api/pitch-craft/projects/{id}`
*   **Method:** `PUT`
*   **Description:** Updates a Pitch Craft project.
*   **Data Params:** `{"name": "string", "data": "object"}`
*   **Success Response:**
    *   **Code:** 200
    *   **Content:** `{"id": "string", "name": "string", "data": "object"}`

### Delete Project

*   **URL:** `/api/pitch-craft/projects/{id}`
*   **Method:** `DELETE`
*   **Description:** Deletes a Pitch Craft project.
*   **Success Response:**
    *   **Code:** 204
