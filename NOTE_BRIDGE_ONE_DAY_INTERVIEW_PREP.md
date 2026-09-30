# Note-Bridge: One-Day Interview Prep Guide

## 1. Project Introduction

### Elevator Pitches
**30-Second Introduction:**
"Note-Bridge is a full-stack MERN application that combines note management with a social feed. It uses Firebase for file storage and MongoDB for metadata. I integrated Socket.IO to provide real-time notifications for likes and follow requests, and used the Gemini AI API to automatically summarize text notes."

**90-Second Introduction:**
"Note-Bridge is a real-time social note-sharing platform I built using React, Node.js, Express, and MongoDB. The core problem it solves is making educational resource sharing interactive. Users can upload folders and files, and share them on a public feed. 
For file uploads, I send binaries to Firebase Storage and save the returned URL in MongoDB. For authentication, I used bcrypt and JWT. 
A major technical feature is the real-time interaction using Socket.IO. When a user comments or likes a post, the server emits a socket event directly to the recipient's socket ID, updating their UI instantly. I also integrated the Google Gemini API on the backend to generate automatic summaries and tags for text notes, handling rate limiting gracefully with fallback mock data."

### Introduction Questions

**1. Walk me through Note-Bridge.**
- **Answer should cover:** It’s a MERN-stack social note-sharing app. Frontend is React/Vite, Backend is Node/Express, Database is MongoDB, and Storage is Firebase. It features real-time Socket.IO notifications and Gemini AI summaries.
- **Priority:** Must Know

**2. What problem does Note-Bridge solve?**
- **Answer should cover:** It transitions note-taking from a solitary activity to a collaborative one, allowing users to share structured folders/files, request viewing access, and engage via comments/likes in real-time.
- **Priority:** Important

**3. What are the main features of Note-Bridge?**
- **Answer should cover:** JWT authentication, CRUD for notes and folders, Firebase file uploads, social sharing feed, real-time socket notifications for likes/comments/follows, and AI note summarization.
- **Priority:** Must Know

**4. What is the complete technology stack?**
- **Answer should cover:** 
  - Frontend: React 18, Vite, Context API, Bootstrap, Socket.IO Client, Firebase SDK.
  - Backend: Node.js, Express.js, Mongoose, Socket.IO, Multer, Google GenAI SDK, bcrypt, JWT.
  - Storage: MongoDB, Firebase Storage.
- **Priority:** Must Know

**5. What makes this more than a basic CRUD notes application?**
- **Answer should cover:** The dual-storage architecture (Firebase + MongoDB), real-time bidirectional WebSocket communication (Socket.IO), relational social data models (Likes, Comments, View Requests), and third-party AI API integration.
- **Priority:** Must Know

---

## 2. Frontend

**6. How is global state managed in the React frontend?**
- **Answer should cover:** The Context API is used instead of Redux to avoid over-engineering. `NoteContext` holds global variables like `authtoken`, `userId`, `urlPath`, and notification unread counts.
- **Project reference:** `frontend/src/context/notes/noteContext.js` and `App.jsx`.
- **Priority:** Must Know

**7. How does React Router handle navigation?**
- **Answer should cover:** `createBrowserRouter` defines static and dynamic routes. Dynamic routes like `/social/profile/:id` allow rendering specific user profiles.
- **Project reference:** `frontend/src/App.jsx`.
- **Priority:** Important

**8. Where do you persist authentication on the client side?**
- **Answer should cover:** The JWT (`authtoken`) and `userId` are stored in the browser's `localStorage` upon login and retrieved on subsequent loads.
- **Project reference:** `App.jsx` (`localStorage.getItem("authtoken")`).
- **Priority:** Must Know

**9. Explain a common `useEffect` use case in this app.**
- **Answer should cover:** `useEffect` is used in `App.jsx` to check if the `authtoken` exists on mount to set the `islogout` state, and to clear flash alert messages (`isOK`) after 2 seconds.
- **Project reference:** `frontend/src/App.jsx`.
- **Priority:** Important

**10. How is file uploading handled on the frontend?**
- **Answer should cover:** The frontend uses the Firebase Client SDK (`uploadBytes`). The user selects a file, the file is pushed directly to Firebase, and a download URL is returned to be sent to the Express backend.
- **Project reference:** `frontend/src/firebase/savefile.js`.
- **Priority:** Must Know

**11. Did you notice any direct DOM manipulation in the React code?**
- **Answer should cover:** Yes. In `App.jsx`, there is an event listener for `resize` that uses `document.getElementsByClassName("fixedHeight")` to manually adjust height. *Improvement:* This should ideally be handled via React state or CSS viewport units (`vh`).
- **Project reference:** `frontend/src/App.jsx`.
- **Priority:** Optional

---

## 3. Backend and REST APIs

**12. Explain the Express backend setup and middleware order.**
- **Answer should cover:** `cors()` allows frontend requests, `express.json()` parses JSON bodies. After global middleware, custom routers (auth, notes, folder, social, ai, notification) are mapped to paths like `/api/notes`.
- **Project reference:** `backend/index.js`.
- **Priority:** Must Know

**13. Walk me through the Login flow.**
- **Answer should cover:** `POST /api/auth/login`. Middleware `express-validator` checks input length. The route queries MongoDB for the email, uses `bcrypt.compare` on the password, and if valid, signs a JWT and returns it.
- **Project reference:** `backend/routes/auth.js`.
- **Priority:** Must Know

**14. Walk me through Creating a text note.**
- **Answer should cover:** `POST /api/notes/text/upload`. Custom `fetchUser` middleware verifies the JWT. The route checks for duplicate notes, instantiates a new `Note` document with the text and tags, and calls `.save()`.
- **Project reference:** `backend/routes/notes.js`.
- **Priority:** Must Know

**15. How does the custom `fetchUser` middleware work?**
- **Answer should cover:** It intercepts requests, extracts the JWT from the `authToken` header, verifies it using `jwt.verify(token, JWTserect)`, and attaches the decoded user ID to `req.id` before calling `next()`.
- **Project reference:** `backend/middlewire/fetchUser.js`.
- **Priority:** Must Know

**16. How is user input validated before hitting the database?**
- **Answer should cover:** Express-validator is used in route definitions (e.g., `body("email").isEmail()`). The route handler checks `validationResult(req)` and returns early if errors exist.
- **Project reference:** `backend/routes/auth.js`.
- **Priority:** Important

**17. How is MongoDB connected to the application?**
- **Answer should cover:** Using `mongoose.connect()` inside an async function utilizing the `MONGODB_URL` environment variable.
- **Project reference:** `backend/index.js` and individual route files.
- **Priority:** Important

**18. What is a major architectural weakness in your database connection logic?**
- **Answer should cover:** Currently, `connectToMongo()` is called inside every single route handler (e.g., `router.post(...)`), opening redundant connections. *Improvement:* It should be called once globally at server startup in `index.js`.
- **Project reference:** Almost all route files (e.g., `backend/routes/notes.js`).
- **Priority:** Must Know

---

## 4. MongoDB and Mongoose

**19. How are the schemas structured relationally?**
- **Answer should cover:** They heavily rely on Mongoose `ObjectId` referencing. Every feature (`Note`, `Folder`, `Like`, `Comment`, `Post`) has a `user: { type: mongoose.Schema.Types.ObjectId, ref: "user" }` field to link to the author.
- **Project reference:** `backend/models/`.
- **Priority:** Must Know

**20. What is the difference between embedding and referencing in MongoDB?**
- **Answer should cover:** Embedding stores sub-documents inside a parent (good for 1-to-few). Referencing (which Note-Bridge uses) stores IDs pointing to other collections (good for 1-to-many, like thousands of likes on a post).
- **Project reference:** `backend/models/social/postLike.js`.
- **Priority:** Important

**21. How do you prevent passwords from being sent to the frontend?**
- **Answer should cover:** By using the Mongoose query chain `.select("-password")` when fetching user data.
- **Project reference:** `backend/routes/auth.js` (`/getuser` route).
- **Priority:** Must Know

**22. How are cascading deletes handled when a folder is deleted?**
- **Answer should cover:** The `/delete` folder route fetches the folder, manually queries and iterates through all sub-folders and files starting with that `folderPath`, and uses `deleteOne` repeatedly.
- **Project reference:** `backend/routes/folder.js`.
- **Priority:** Important

**23. What is a query performance weakness in the codebase?**
- **Answer should cover:** Performing `await Model.deleteOne()` inside a `for` loop executes sequential database calls, blocking the thread. *Improvement:* Use `Model.deleteMany({ _id: { $in: idArray } })`.
- **Project reference:** `backend/routes/notes.js` (Route-4).
- **Priority:** Must Know

---

## 5. Authentication and Security

**24. Explain the difference between Authentication and Authorisation.**
- **Answer should cover:** Authentication verifies *who* the user is (Login/JWT creation). Authorisation verifies *what* they can do (middleware checking if `req.id === req.body.user` before deleting a note).
- **Project reference:** `backend/routes/notes.js`.
- **Priority:** Must Know

**25. How is bcrypt used to secure passwords?**
- **Answer should cover:** It generates a salt (`bcrypt.genSalt(10)`) and hashes the plain text password before saving. During login, it hashes the provided input and compares it to the database hash using `bcrypt.compare()`.
- **Project reference:** `backend/routes/auth.js`.
- **Priority:** Must Know

**26. Is the JWT payload encrypted?**
- **Answer should cover:** No. JWTs are Base64Url encoded, not encrypted. Anyone can decode the payload, which is why only safe data like the user ID is stored inside `jwt.sign({ id: user.id })`.
- **Priority:** Must Know

**27. What is a critical security vulnerability regarding JWTs in this codebase?**
- **Answer should cover:** The JWT lacks an expiration time (`expiresIn`). A stolen token is permanently valid. *Not currently implemented:* Short-lived access tokens and refresh tokens.
- **Project reference:** `backend/routes/auth.js` (`jwt.sign` implementation).
- **Priority:** Must Know

**28. What are the risks of storing JWTs in `localStorage`?**
- **Answer should cover:** `localStorage` is accessible via JavaScript, making the app vulnerable to Cross-Site Scripting (XSS) attacks. *Improvement:* Store JWTs in `HttpOnly` secure cookies.
- **Project reference:** `frontend/src/App.jsx`.
- **Priority:** Important

**29. Explain CORS and why it's needed.**
- **Answer should cover:** Cross-Origin Resource Sharing. Browsers block requests from a frontend (e.g., localhost:5173) to a backend on a different port (localhost:3000) by default. The backend `cors()` middleware adds headers to permit this.
- **Project reference:** `backend/index.js`.
- **Priority:** Optional

---

## 6. Socket.IO

**30. Why use Socket.IO instead of standard HTTP REST APIs?**
- **Answer should cover:** HTTP is unidirectional (client must poll). WebSockets allow persistent, bidirectional connections so the server can push notifications (like comments/follows) to the client instantly.
- **Priority:** Must Know

**31. How does the server know which socket belongs to which user?**
- **Answer should cover:** Upon connection, the frontend emits `userConnected` with their `userId`. The backend maintains a global in-memory dictionary: `const users = {}` mapping `users[userId] = socket.id`.
- **Project reference:** `backend/index.js` (lines 50-58).
- **Priority:** Must Know

**32. What exactly happens when a user likes a post?**
- **Answer should cover:** 
  1. Frontend HTTP POST saves the Like in MongoDB. 
  2. Frontend emits `postLike` via socket. 
  3. Server receives it, looks up the post owner's socket: `const target = users[data.userAboutId]`. 
  4. Server emits: `io.to(target).emit("postLike", notificationData)`.
- **Project reference:** `backend/index.js` (lines 81-88).
- **Priority:** Must Know

**33. What is the difference between `io.emit` and `io.to(id).emit`?**
- **Answer should cover:** `io.emit` broadcasts the event to *all* connected clients. `io.to(socketId).emit` targets one specific client. Note-Bridge uses `io.to()` for private notifications like Follow Requests.
- **Project reference:** `backend/index.js`.
- **Priority:** Important

**34. What happens if the notification recipient is offline?**
- **Answer should cover:** *Not currently implemented:* The Socket event is lost. To fix this, notifications are pulled from MongoDB (`/api/notification/get`) when the user logs back in. Socket.IO is strictly for active sessions here.
- **Priority:** Important

**35. What is the major scalability flaw with your Socket.IO implementation?**
- **Answer should cover:** The `users` dictionary is stored in server RAM. If deployed to multiple servers (horizontal scaling), a user connected to Server A cannot receive a like event processed by Server B.
- **Follow-up / Fix:** *Not currently implemented:* Use the Socket.IO Redis Adapter to share events across all server instances via Pub/Sub.
- **Priority:** Must Know

**36. Did you implement Socket disconnection cleanup?**
- **Answer should cover:** No. When a user disconnects, their `userId` remains in the `users` dictionary. *Improvement:* Implement a `socket.on('disconnect')` listener to delete the entry to prevent memory leaks.
- **Project reference:** `backend/index.js`.
- **Priority:** Important

---

## 7. Firebase and File Storage

**37. Why use both MongoDB and Firebase?**
- **Answer should cover:** MongoDB is optimized for querying text and relationships. Storing large binary files (images/PDFs) in MongoDB causes severe database bloat and latency. Firebase Object Storage is optimized and cheaper for binaries.
- **Priority:** Must Know

**38. Walk me through the Firebase upload flow.**
- **Answer should cover:** The React frontend uses the Firebase Client SDK (`uploadBytes`) to push the file directly to Google servers. Firebase returns a download URL. The frontend then sends *only* this URL to the Express backend to save in MongoDB.
- **Project reference:** `frontend/src/firebase/savefile.js`.
- **Priority:** Must Know

**39. What happens if the Firebase upload succeeds, but the MongoDB save fails?**
- **Answer should cover:** We end up with an "orphaned" file in Firebase taking up space, but no record of it in the app. *Not currently implemented:* A cleanup chron job or webhook to delete unreferenced Firebase files.
- **Priority:** Important

**40. How is file deletion handled?**
- **Answer should cover:** The backend uses a custom Firebase script (`deleteFolderRecursive`) using Firebase Admin to delete the actual files, and then executes `Model.deleteOne()` to remove the metadata from MongoDB.
- **Project reference:** `backend/routes/folder.js`.
- **Priority:** Important

---

## 8. Gemini AI

**41. Why call the Gemini API from the backend instead of the frontend?**
- **Answer should cover:** To protect the `GEMINI_API_KEY`. If called from React, the key would be exposed in the browser's network tab, leading to quota theft.
- **Project reference:** `backend/routes/ai.js`.
- **Priority:** Must Know

**42. How does the note summarization work?**
- **Answer should cover:** The frontend posts the note text. Express instantiates `GoogleGenerativeAI`, constructs a strict prompt asking for 1-2 sentences and 3 tags, calls `model.generateContent(prompt)`, and parses the response.
- **Project reference:** `backend/routes/ai.js`.
- **Priority:** Important

**43. What are the weaknesses of the current AI parsing logic?**
- **Answer should cover:** The backend parses the LLM output manually using `.split('\n')` and string replacement. This breaks if the AI deviates from the requested format. *Improvement:* Request structured JSON output from Gemini.
- **Project reference:** `backend/routes/ai.js` (lines 38-47).
- **Priority:** Important

---

## 9. Improvements and Debugging

**44. What would you improve first in this codebase? (Security / Performance)**
- **Answer should cover:** 
  1. Add JWT expiration (`expiresIn`). 
  2. Move `connectToMongo()` out of the route handlers and into server initialization to prevent connection pooling exhaustion. 
  3. Replace sequential `await .deleteOne()` in `for` loops with `deleteMany`.
- **Priority:** Must Know

**45. How would you test this application?**
- **Answer should cover:** *Not currently implemented:* I would add unit tests for middleware using Jest, API integration tests using Supertest, and frontend component tests using React Testing Library.
- **Priority:** Important

---

## Final Revision Section

### Top 15 Questions to Revise First
1. Q1: Walk me through Note-Bridge.
2. Q4: Complete Tech Stack.
3. Q6: Context API state management.
4. Q10 & Q38: Firebase vs MongoDB upload flow.
5. Q12: Express Middleware flow.
6. Q13: Login and Auth flow.
7. Q18: Database connection weakness (repeated calls).
8. Q19: Mongoose Relational Referencing.
9. Q23: Query performance (Sequential loops vs deleteMany).
10. Q24: Authentication vs Authorisation.
11. Q27: Missing JWT Expiration vulnerability.
12. Q30: Why Socket.IO over HTTP.
13. Q31 & Q32: User ID mapping and Like/Comment Event Flow.
14. Q35: Socket.IO multi-server scaling (Redis).
15. Q41: Hiding Gemini API keys on the backend.

### One-Page Project Cheat Sheet

- **Purpose:** Collaborative, real-time social note and folder sharing.
- **Stack:** MERN + Vite + Socket.IO + Firebase Storage + Google Gemini AI.
- **Main Frontend:** `App.jsx` (Routing/Context), `savefile.js` (Firebase client upload).
- **Main Backend:** `index.js` (Express + Socket mapping), `fetchUser.js` (JWT verification).
- **Main Models:** `User`, `Note`, `Folder`, `Post`, `Like`, `Comment`, `Follow`, `View`.
- **JWT Flow:** Generated without expiry on Login, stored in LocalStorage, passed in `authToken` header, verified by `fetchUser` middleware.
- **Firebase Flow:** Client uploads bytes -> gets URL -> sends URL to Express -> saves to MongoDB.
- **Socket Flow:** Client emits `userConnected` -> Server maps `userId` to `socket.id` -> Client emits interaction (like) -> Server targets recipient `socket.id` and emits.
- **Gemini Flow:** Client sends text -> Backend builds prompt -> Calls Gemini -> Parses string output -> Returns summary to Client.
- **Current Limitations:** No JWT expiry, LocalStorage XSS risk, sequential DB loops, in-memory sockets, repeated Mongo connections.
- **Suggested Improvements:** Add Refresh Tokens, use HttpOnly cookies, use `deleteMany()`, implement Redis Adapter, connect to Mongo once globally.

### Honest Answers for Missing Features

- **No refresh tokens:** "I built the MVP using a single non-expiring JWT for speed, but I understand a production app requires a short-lived access token and an HttpOnly refresh token."
- **No rate limiting:** "Not currently implemented. I would add `express-rate-limit` to protect auth and AI routes from brute-force and billing attacks."
- **No proper Socket scaling:** "Right now, sockets are in a JS object memory map. For horizontal scaling, I would implement the Socket.IO Redis adapter."
- **No automated testing:** "I tested manually. If expanding, I'd implement Jest for backend logic and React Testing Library for the frontend."
- **No Transactions:** "If Firebase succeeds but Mongo fails, a file is orphaned. I'd implement a server chron-job to periodically delete Firebase files that lack MongoDB references."

### Final Mock Interview (Practise these aloud)

1. Walk me through the Note-Bridge architecture.
2. Why did you use both Firebase and MongoDB?
3. What is the difference between Authentication and Authorisation in your API?
4. Explain how your custom JWT middleware works.
5. Why are your JWTs currently a security risk, and how would you fix it?
6. Walk me through exactly what happens when user A likes user B's post.
7. How does the server know which specific socket ID belongs to user B?
8. What happens to your Socket.IO setup if the app scales to 5 backend servers?
9. I noticed a `connectToMongo()` call in every route. Why is that bad?
10. How did you secure the Gemini AI API integration?
