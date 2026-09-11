# Task Management Dashboard

A full-stack task and team-collaboration platform built on the **MERN stack**, providing a centralized workspace for managing tasks, tracking progress in real time, and communicating with team members.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)
- [License](#license)

## Overview

The application is organized around three core modules:

- **Authentication & User Management** — secure sign-up, login, and password recovery.
- **Task Management** — role-based task creation, assignment, and tracking with real-time notifications.
- **Real-Time Chat** — direct messaging between users.

## Features

### Authentication & User Management
- Secure registration and login using an **Access Token + Refresh Token** flow — access tokens authorize protected API requests, while refresh tokens are used to reissue access tokens when they expire.
- **Forgot Password / Reset Password** flow — a reset link is emailed via **Nodemailer**, allowing users to securely set a new password.
- Profile image upload handled with **Multer** (cloud storage via **ImageKit** planned).

### Task Management
- Full task lifecycle: create, view, update, delete, and assign tasks.
- Role-based access control with two roles per task:
  - **Creator** — assigns the task, updates status/details/due date, deletes it, or assigns it to themselves.
  - **Assignee** — limited access, can only update task status (e.g., Completed, In Progress).
- Tasks are automatically flagged **Overdue** once their due date passes without completion.
- **Real-time notifications** powered by **Socket.io**:
  - Assignee is notified when a task is assigned to them.
  - Assignee is notified when a creator updates the task.
  - Creator is notified when an assignee changes the task status.
- **Native desktop/browser notifications**, delivered even when the tab is backgrounded or minimized.

### Real-Time Chat
- One-on-one conversations between users.
- View available users, create or retrieve conversations, send messages, and fetch message history.
- Backend built with dedicated models for **users**, **conversations**, and **messages**, with delivery over Socket.io.

## Screenshots

### Authentication & User Management
| Registration | Login |
|---|---|
| ![Registration Page](screenshots/image1.png) | ![Login Page](screenshots/image2.png) |

| Forgot Password | Reset Password |
|---|---|
| ![Forgot Password](screenshots/image3.png) | ![Reset Password](screenshots/image4.png) |

### Task Management
| Assigned To Me | Assigned To Others |
|---|---|
| ![Assigned To Me](screenshots/image5.png) | ![Assigned To Others](screenshots/image6.png) |

| Create Task | Update Task |
|---|---|
| ![Create Task](screenshots/image7.png) | ![Update Task](screenshots/image8.png) |

### Real-Time Notifications
![Notifications Panel](screenshots/image9.png)

### Real-Time Chat
![Chat Module](screenshots/image10.png)

### User Profile
![User Profile](screenshots/image11.png)

> Place the `screenshots/` folder at the root of your repository so the images above render correctly on GitHub.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Redux |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-Time Communication | Socket.io |
| Authentication | JWT (Access & Refresh Tokens) |
| Email Service | Nodemailer |
| File Uploads | Multer |

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local instance or Atlas connection string)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SMTP_HOST=your_smtp_host
SMTP_USER=your_email
SMTP_PASS=your_email_password
```

### Running the App

```bash
# Start the backend
cd server
npm run dev

# Start the frontend
cd ../client
npm start
```

## Roadmap

- [ ] Integrate **ImageKit** for cloud-based profile image storage.
- [ ] Add **Redis** for caching and session management.
- [ ] Containerize the application with **Docker**.
- [ ] Expand automated test coverage.

## License

This project is licensed under the [MIT License](LICENSE).
