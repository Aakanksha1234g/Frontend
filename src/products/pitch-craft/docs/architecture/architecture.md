# Pitch Craft Architecture

## High-Level Overview

Pitch Craft is a client-side application built with React. It allows users to create, edit, and manage presentations or "pitches." The application is structured into several key components:

*   **Projects Page:** This is the main landing page for Pitch Craft. It displays a list of all the user's projects and allows them to create new projects or open existing ones.
*   **Pitch Editor:** This is the core of the application. It provides a canvas-based editor where users can add and manipulate various types of media, such as text, images, and videos. The editor also includes a variety of tools and panels for customizing the appearance and behavior of the pitch.
*   **API Layer:** The application communicates with a backend API to save and load project data. The API layer is responsible for handling all the network requests and data transformations.

## Directory Structure

The Pitch Craft codebase is organized into the following directories:

*   `constants`: Contains constant values used throughout the application.
*   `contexts`: Contains React contexts for managing global state.
*   `hooks`: Contains custom React hooks for reusing component logic.
*   `pages`: Contains the main pages of the application, such as the projects page and the pitch editor.
*   `utils`: Contains utility functions used throughout the application.
