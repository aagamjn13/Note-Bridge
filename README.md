# 📚 Note-Bridge

**Note-Bridge** is a MERN-based **real-time social note-sharing platform** designed to help students and learners organize, store, and share their notes efficiently. It combines cloud-based file storage, social networking features, and AI-powered note summarization to create a collaborative learning environment.

---

## 🚀 Features

- 🔐 **Authentication & Authorization** – Secure user registration, login, and JWT-based authentication.
- 📝 **Note Management** – Create, organize, edit, and manage text notes, files, and folders.
- 📂 **File & Folder Organization** – Maintain a structured directory system for educational resources.
- ☁️ **Cloud File Storage** – Upload and manage documents, PDFs, images, and notes using **Firebase Storage**.
- 👥 **Social Feed** – Share notes and folders with the community through an interactive social feed.
- ❤️ **Likes & Comments** – Engage with shared notes using likes and comments.
- 🤝 **Follow & View Requests** – Send follow requests and request access to protected notes.
- 🔔 **Real-time Notifications** – Instant updates for likes, comments, follow requests, and other interactions using **Socket.IO**.
- 🤖 **AI-powered Summaries** – Integrated with **Google Gemini AI** to generate note summaries and relevant tags automatically.
- 📱 **Responsive Design** – User-friendly interface optimized for desktop and mobile devices.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:------------|
| **Frontend** | React, Vite, React Router, Bootstrap, Context API |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT, bcrypt |
| **File Storage** | Firebase Storage |
| **AI Integration** | Google Gemini API |
| **Real-time Communication** | Socket.IO |

---

## ⚙️ Key Functionalities

- User Authentication & Profile Management
- Text Note Creation
- File & Folder Upload Management
- Social Feed for Shared Notes
- Like & Comment System
- Follow Request Management
- Protected Note Access Requests
- Real-time Notifications
- AI-generated Note Summaries & Tags
- Responsive User Interface

---

## 🏗️ Project Architecture

- **Frontend:** React application built using Vite with Context API for global state management.
- **Backend:** Express REST APIs handling authentication, note management, social features, and AI integration.
- **Database:** MongoDB stores user information, notes, folders, posts, likes, comments, and metadata.
- **Cloud Storage:** Firebase Storage stores uploaded files while MongoDB stores only the corresponding metadata and download URLs.
- **Real-time Layer:** Socket.IO enables instant notifications and live updates across connected users.
- **AI Layer:** Google Gemini API generates summaries and tags for text-based notes.
   
---
 
## 🌟 Highlights

- Full MERN Stack Application
- JWT Authentication
- Firebase Cloud Storage Integration
- Real-time Communication with Socket.IO
- AI-powered Note Summarization
- Modular REST API Architecture
- Responsive & User-friendly Interface
- Scalable Folder and Note Management System
