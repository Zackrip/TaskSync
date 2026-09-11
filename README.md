# Task Management Dashboard

A full-stack task and team-collaboration platform built on the **MERN stack**, providing a centralized workspace for managing tasks, tracking progress in real time, and communicating with team members.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
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
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=PORT
MONGO_URI=MONGODB_URI
JWT_SECRET=JWT_SECRET
EMAIL_PASS=EMAIL_PASS
EMAIL=EMAIL_ID
REDIS_URL=REDIS_CLOUD_URL
```

### Running the App

```bash
# Start the backend
cd backend
npm run dev

# Start the frontend
cd frontend
npm run dev
```

## Roadmap

- [ ] Integrate **ImageKit** for cloud-based profile image storage.
- [ ] Add **Redis** for caching and session management.
- [ ] Containerize the application with **Docker**.
- [ ] Expand automated test coverage.

## License

This project is licensed under the [MIT License](LICENSE).
