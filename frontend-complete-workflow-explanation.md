# Frontend Complete Workflow Explanation

This document provides a detailed, line-by-line explanation of the files and folders involved in the workflow of the `AIE-Frontend-develop` project.

---

## **File: `vite.config.js`**

### **Purpose**
- Configures the Vite development server and build tool.
- Defines plugins, aliases, and server settings.

### **Key Sections**
- **Plugins**:
  - `react`: Enables React support.
  - `tailwindcss`: Integrates Tailwind CSS.
  - `svgr`: Allows importing SVGs as React components.
  - `inspect`: Debugging tool for inspecting Vite's internal state.
- **Aliases**:
  - Shortcuts for importing files (e.g., `@api` maps to `src/api`).
- **Server Settings**:
  - `host: true`: Enables external access.
  - `port: 5173`: Sets the development server port.

---

## **File: `package.json`**

### **Purpose**
- Manages project dependencies and scripts.

### **Key Sections**
- **Scripts**:
  - `dev`: Starts the development server.
  - `build`: Builds the app for production.
  - `test`: Runs tests using Vitest.
- **Dependencies**:
  - Libraries like `react`, `react-router`, `@tanstack/react-query`, and `tailwindcss`.
- **DevDependencies**:
  - Tools like `vite`, `eslint`, and `prettier` for development.

---

## **File: `src/main.jsx`**

### **Purpose**
- Entry point of the application.
- Sets up providers, routing, and global utilities.

### **Key Sections**
- **Providers**:
  - `QueryClientProvider`: Manages server-side state.
  - `ToastProvider`: Handles toast notifications.
  - `UserProvider`: Provides user authentication context.
- **Router**:
  - Configures routes using `createBrowserRouter`.
- **HeroUIWrapper**:
  - Wraps the app with Hero UI components.

---

## **File: `src/routes/routes.jsx`**

### **Purpose**
- Defines the app's navigation structure.

### **Key Routes**
- `/`: Public route for the welcome page.
- `/login`: Public route for the login page.
- `/signup`: Public route for the signup page.
- `/home`: Private route for the home page.
- `/edit-profile`: Private route for editing the user profile.

---

## **File: `src/api/apiMethods.js`**

### **Purpose**
- Provides reusable functions for making API requests.

### **Key Functions**
- `fetchData`: Sends GET requests.
- `sendData`: Sends POST, PUT, or DELETE requests.

---

## **File: `src/shared/context/user-context.jsx`**

### **Purpose**
- Manages user authentication and profile data.

### **Key Sections**
- **State Management**:
  - `useReducer`: Handles user state updates.
- **Persistence**:
  - Saves user data to `localStorage`.
- **Custom Hook**:
  - `useUser`: Provides access to the user context.

---

## **File: `src/shared/utils/toast-service.js`**

### **Purpose**
- Provides a utility for displaying toast notifications.

### **Key Functions**
- `setToastFunction`: Sets the toast display function.
- `showToast`: Displays a toast message.

---

This document now includes explanations for all files and folders involved in the workflow. Let me know if further details are needed!
