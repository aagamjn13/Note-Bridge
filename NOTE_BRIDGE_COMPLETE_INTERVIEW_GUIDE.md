# Note-Bridge: Complete Interview Guide

## 1. Project Summary

**What Note-Bridge does:**
Note-Bridge is a full-stack, real-time social platform for note-sharing. Users can register, create text notes, upload files and folders, and share them on a social feed. Other users can view, like, and comment on these posts, send follow requests, and ask for permission to view protected notes. Real-time notifications keep users updated on social interactions, while Gemini AI provides quick note summaries and tags.

**The technical stack:**
- **Frontend:** React 18, Vite, React Router, Context API, Bootstrap, Socket.IO Client, Firebase SDK.
- **Backend:** Node.js, Express.js, Socket.IO, Multer, Google Generative AI SDK, bcrypt, JWT.
- **Database:** MongoDB (via Mongoose).
- **File Storage:** Firebase Storage.

**How the components communicate:**
The React frontend makes standard HTTP requests to the Express REST APIs for CRUD operations, authentication, and file uploading. Metadata is saved in MongoDB, while actual files are directly uploaded to Firebase Storage. Concurrently, a persistent Socket.IO connection provides real-time event broadcasting for likes, comments, and follow requests. The Express backend also communicates securely with the Google Gemini API to generate note summaries.

**Why it's more than basic CRUD:**
Note-Bridge implements complex relational data modeling (users, posts, likes, comments, and requests), real-time bidirectional communication via WebSockets, third-party file storage synchronization, and AI integration, moving it beyond a standard task-list application.

### Explanations for Interviews

**30-second explanation:**
"Note-Bridge is a MERN-stack social note-sharing platform. It allows users to upload files to Firebase, store metadata in MongoDB, and share their notes on a social feed. It features real-time notifications using Socket.IO for likes and follow requests, and uses the Google Gemini API to automatically summarize text notes."

**90-second interview explanation:**
"Note-Bridge is a full-stack application I built using React, Node.js, Express, and MongoDB. It solves the problem of sharing educational resources by combining file storage with a social feed. I implemented authentication using JWT and bcrypt. When a user uploads a note, the actual file goes to Firebase Storage, while its URL and metadata are saved in MongoDB. 
For the social features, users can like, comment, and send follow requests. To make this interactive, I integrated Socket.IO so users receive real-time notifications without refreshing the page. Finally, I integrated the Gemini AI API on the backend to automatically generate brief summaries and tags for text notes, improving discoverability."

**3-minute detailed explanation:**
"Note-Bridge is a comprehensive social platform for sharing notes, built with the MERN stack. Let me break down the architecture. 
On the frontend, I used React with Vite and the Context API for state management, specifically avoiding Redux to keep the architecture lightweight. The UI is responsive, built with Bootstrap and custom CSS.
The backend is an Express server. Security is handled via JWT for session management and bcrypt for password hashing. For the database, I designed relational Mongoose schemas connecting Users, Notes, Folders, Posts, Likes, and Comments. 
A major technical challenge was handling file uploads. Instead of storing large binaries in MongoDB, I configured the frontend to upload directly to Firebase Storage. The Firebase URL is then passed to the Express backend and stored in MongoDB as metadata.
To elevate the user experience, I implemented Socket.IO. When a user comments or sends a follow request, the backend updates MongoDB and simultaneously emits a socket event to the specific recipient's socket ID, providing instant UI feedback.
Lastly, I integrated the Google Gemini API on the backend. When a user writes a text note, a protected API route constructs a prompt and calls Gemini to generate a summary and tags. I handled API rate limiting and missing keys by implementing a fallback mock response, ensuring the UI doesn't break during errors."

---

## 2. Repository Architecture

### Folder and File Map
```text
Note-Bridge/
├── frontend/
│   ├── index.html           # Main HTML entry point
│   ├── package.json         # Frontend dependencies and scripts
│   ├── vite.config.js       # Vite bundler configuration
│   └── src/
│       ├── main.jsx         # React root rendering
│       ├── App.jsx          # React Router configuration and global Context provider
│       ├── components/      # Reusable React UI components
│       ├── context/         # React Context (NoteContext) for global state
│       ├── css/             # Custom global styles
│       ├── firebase/        # Firebase initialization and file operations
│       └── functions/       # Helper functions
└── backend/
    ├── index.js             # Express application and Socket.IO server initialization
    ├── package.json         # Backend dependencies
    ├── .env                 # Environment variables (DB URL, JWT Secret, Gemini Key)
    ├── firebase/            # Firebase Admin logic (e.g., recursive folder deletion)
    ├── middlewire/          # Express middleware (e.g., fetchUser for JWT validation)
    ├── models/              # Mongoose schemas (Auth, Notes, Folders, Social features)
    └── routes/              # Express route handlers
        ├── auth.js          # Registration, login, and profile editing
        ├── notes.js         # Note creation, fetching, and deletion
        ├── folder.js        # Folder CRUD operations
        ├── ai.js            # Gemini API integration for summaries
        ├── notification/    # Notification fetching routes
        └── social/          # Posts, likes, comments, and requests
```

### Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend [React Frontend (Vite)]
        UI[React Components]
        Context[Context API]
        SocketClient[Socket.IO Client]
        FirebaseClient[Firebase SDK]
    end

    subgraph Backend [Node.js / Express Backend]
        API[REST API Routes]
        Middleware[JWT Auth Middleware]
        SocketServer[Socket.IO Server]
    end

    subgraph External [External Services]
        Mongo[(MongoDB)]
        FirebaseStorage[(Firebase Storage)]
        Gemini[Google Gemini API]
    end

    %% HTTP Data Flow
    UI -->|HTTP Requests (Fetch)| Middleware
    Middleware -->|Validated Requests| API
    API -->|Mongoose Queries| Mongo
    API -->|Server-side prompt| Gemini
    
    %% File Storage Flow
    FirebaseClient -->|Direct Byte Uploads| FirebaseStorage
    FirebaseClient -->|Returns Download URL| UI
    
    %% Real-time Flow
    SocketClient <-->|WebSocket Events| SocketServer
```

---

## 3. End-to-End Flows

### 1. User Registration and Login
- **Frontend Component:** `SignupForm.jsx` / `LoginForm.jsx`.
- **API Endpoint:** `POST /api/auth/create` or `POST /api/auth/login`.
- **Middleware:** `express-validator` validates email format and password length.
- **Database Query:** `User.findOne()` checks for duplicates. `bcrypt.hash()` secures the password. `User.save()` stores it.
- **Response:** Backend returns a JWT token. Frontend saves it in `localStorage` using `localStorage.setItem("authtoken", data.jwtToken)`.

### 2. Creating a Text Note
- **Frontend:** User types text in `Addnotes.jsx`.
- **API Endpoint:** `POST /api/notes/text/upload`.
- **Middleware:** `fetchUser` verifies the JWT in the headers.
- **Database Query:** `Note.save()` saves the text content, folder path, and tags.
- **Response:** Returns the saved note object to update the UI.

### 3. Uploading a File
- **Frontend:** User selects a file in `FileUpload.jsx`.
- **Firebase Flow:** Frontend calls `uploadFileToFirebase()` (`firebase/savefile.js`). The Firebase SDK uploads bytes directly to Firebase Storage and returns a Download URL.
- **API Endpoint:** The frontend then sends this URL to `POST /api/notes/file/upload`.
- **Database Query:** Backend creates a `Note` document containing the Firebase URL and metadata (size, extension), but not the binary data.

### 4. Creating a Social Post
- **Frontend:** User selects a note or folder and clicks share.
- **API Endpoint:** `POST /api/social/post/file/upload` or `/post/folder/upload`.
- **Database Query:** Creates a `Post` document referencing the `Note` ID, `User` ID, and `AboutId`.

### 5. Sending a Like or Comment
- **API Endpoint:** `POST /api/social/post/like/submit` or `/post/comment/post`.
- **Database Query:** Saves a `Like` or `Comment` document.
- **Socket Event:** Simultaneously, the frontend calls `socket.emit("postLike", data)` or `socket.emit("postComment", data)`.
- **Socket Receiver:** The backend receives the emit, maps the target `userId` to a specific `socket.id`, and uses `io.to(userId).emit("postLike", ...)` to push the notification instantly.

### 6. Generating a Gemini Summary
- **Frontend:** Note content is sent via fetch.
- **API Endpoint:** `POST /api/ai/summarize`.
- **Backend Flow:** Express initializes `GoogleGenerativeAI`, constructs a strict prompt string, and calls `model.generateContent(prompt)`.
- **Response:** Backend parses the text response to extract a summary string and a tags array, then returns it as JSON.

---

## 4. Concept-Wise Theory

### Frontend

#### React Context API
**Basic idea:** A way to share data globally across components without passing props down manually at every level (prop drilling).
**How Note-Bridge uses it:** Defined in `context/notes/noteContext.js` and wrapped around the router in `App.jsx`. It holds global state like `islogout`, `authtoken`, `userId`, `urlPath`, and notification counts.
**Interview focus:** Explain that it replaces Redux for lightweight global state.

#### React Router
**Basic idea:** Enables navigation between different views in a single-page application without reloading the browser page.
**How Note-Bridge uses it:** Uses `createBrowserRouter` and `RouterProvider` in `App.jsx`. Defines routes like `/social/profile/:id` using dynamic parameters.
**Interview focus:** Explain how dynamic routing (`:id`) works and how components extract this using `useParams()`.

#### Local Storage
**Basic idea:** Browser API to store key-value pairs persistently across sessions.
**How Note-Bridge uses it:** Stores `authtoken`, `userId`, and `seen` (notification count).
**Current limitation:** Storing JWTs in `localStorage` is vulnerable to Cross-Site Scripting (XSS) attacks. A more secure approach is using `HttpOnly` cookies.

### Backend

#### Express Middleware
**Basic idea:** Functions that have access to the request and response objects. They can execute code, modify the request, or end the request-response cycle.
**How Note-Bridge uses it:**
- `app.use(express.json())`: Parses incoming JSON payloads.
- `app.use(cors())`: Allows frontend cross-origin requests.
- `fetchUser.js`: Custom middleware that extracts the JWT from the `authToken` header, verifies it, and attaches the `userId` to `req.id`.
**Interview focus:** Explain the `next()` function and how `fetchUser` protects routes.

#### Async/Await and Error Handling
**Basic idea:** Modern JavaScript syntax for handling asynchronous promises synchronously without callback hell.
**How Note-Bridge uses it:** Every Express route handler and Mongoose query is asynchronous. Wrapped in `try/catch` blocks.
**Current limitation:** Repeating `try/catch` in every route is verbose. An `express-async-handler` wrapper would be a cleaner architectural choice.

### Database

#### Mongoose Schemas and Relationships
**Basic idea:** Mongoose provides a schema-based solution to model application data, enforcing structure in a NoSQL database.
**How Note-Bridge uses it:** Extensive use of `ObjectId` references. For example, `NoteSchema` has a `user: { type: mongoose.Schema.Types.ObjectId, ref: "user" }` field.
**Interview focus:** Understand how referencing works instead of embedding documents, which is ideal for scalable social feeds.
**Current limitation:** Some models like `social/commentSave.js` have fields `user` and `userId` that are duplicate or confusing. Clearer naming conventions (`authorId`, `postOwnerId`) would improve maintainability.

#### Query Filtering
**Basic idea:** Selecting specific fields from the database while hiding sensitive information.
**How Note-Bridge uses it:** In `auth.js`, queries use `.select("-password")` to ensure the password hash is never sent to the frontend.

### Authentication and Security

#### JWT (JSON Web Tokens)
**Basic idea:** A compact, URL-safe token used to securely transmit information between parties as a JSON object.
**How Note-Bridge uses it:** Created in `/api/auth/create` using `jwt.sign({ id: user.id }, JWTserect)`. Verified in `fetchUser` middleware using `jwt.verify()`.
**Interview focus:** Remember that JWT payloads are base64 encoded, **not encrypted**. Anyone can decode the payload, so never store sensitive data (like passwords) inside the token itself.
**Current limitation:** The JWTs in this project do not have an expiration time (`expiresIn`). If a token is stolen, it remains valid forever. Implementing access and refresh tokens is a recommended improvement.

#### Password Hashing (bcrypt)
**Basic idea:** Transforming a password into an unreadable string using a cryptographic algorithm and a random "salt" to defend against rainbow table attacks.
**How Note-Bridge uses it:** Uses `bcrypt.genSalt(10)` and `bcrypt.hash()` before saving the user. Uses `bcrypt.compare()` during login.

### WebSockets and Socket.IO

**Interview focus:** This is a crucial section. Be prepared to explain exactly why HTTP isn't enough.

**Basic idea:** HTTP is unidirectional and requires the client to request data (polling). WebSockets establish a persistent, bidirectional connection where the server can push data to the client instantly. Socket.IO is a library built on top of WebSockets that adds fallback support, reconnections, and room management.
**How Note-Bridge uses it:**
1. **Server Setup:** In `backend/index.js`, an `http.Server` is wrapped with `new Server(server)`.
2. **Connection Mapping:** An in-memory object `const users = {}` maps `userId` to `socket.id`.
3. **Client Connection:** Frontend connects and emits `socket.emit("userConnected", userId)`. Server receives this and maps `users[userId] = socket.id`.
4. **Targeted Emitting:** When a user likes a post, the server finds the post owner's socket ID: `const targetSocket = users[data.userAboutId]`. It then emits specifically to them using `io.to(targetSocket).emit("postLike", ...)`.

**Socket.IO Event Map**

| Event Name | Sender | Receiver | Purpose | Target |
| :--- | :--- | :--- | :--- | :--- |
| `userConnected` | Client | Server | Register user's active socket ID | Server only |
| `followReq` | Client | Server | Triggers follow request notification | Server only |
| `followReqStatus`| Server | Client | Notifies recipient of follow request | Single User |
| `postComment` | Client | Server | Triggers comment notification | Server only |
| `postComment` | Server | Client | Updates feed with new comment | Broadcast (All) |
| `UserpostComment`| Server | Client | Notifies post owner of comment | Single User |
| `postLike` | Server | Client | Notifies post owner of a like | Single User |

**Current limitation (Scalability):** The `const users = {}` mapping is stored in server memory. If this application was deployed to multiple servers behind a load balancer, a user might connect to Server A, but the "like" event might be processed by Server B. Server B won't have the user in its memory map.
**Solution:** Using the **Redis Adapter** for Socket.IO allows multiple Node.js instances to share socket events via a Redis Pub/Sub database.

### File Storage (Firebase)

**Basic idea:** Storing binary files (images, PDFs) in a database like MongoDB is expensive and impacts performance. Object storage solutions are optimized for this.
**How Note-Bridge uses it:** The React frontend uses the Firebase SDK (`firebase/savefile.js`) to `uploadBytes` to Firebase Storage. Firebase returns a download URL. This URL is then saved as a lightweight string inside the MongoDB `Note` document.
**Interview focus:** Storing metadata in MongoDB and the actual file in Firebase decouples concerns.
**Current limitation:** If the Firebase upload succeeds but the subsequent backend API call to MongoDB fails, an orphaned file is left in Firebase Storage. Implementing a transactional webhook or cleanup chron job is a recommended improvement.

### Gemini AI Integration

**Basic idea:** Using Large Language Models via API to generate content dynamically.
**How Note-Bridge uses it:** In `backend/routes/ai.js`, the `/summarize` endpoint accepts text, constructs a specific prompt requiring a summary and tags, and parses the response.
**Interview focus:** The API key is securely stored in the backend `.env` file, preventing exposure on the frontend. The backend handles string parsing using `.split('\n')`.
**Current limitation:** Parsing LLM text output manually is prone to errors if the model deviates from the format. A better approach is requesting structured JSON output (e.g., `response_mime_type: "application/json"`) supported by modern Gemini APIs.

---

## 5. API Reference

| Method | Endpoint | Auth | Purpose | Model Affected |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/create` | No | Register new user | User |
| POST | `/api/auth/login` | No | Authenticate user | User |
| POST | `/api/auth/getuser` | Yes | Fetch user dashboard info | User, Post, Like... |
| POST | `/api/notes/text/upload` | Yes | Create text note | Note |
| POST | `/api/notes/file/upload` | Yes | Save Firebase file metadata | Note |
| GET | `/api/notes/fetch` | Yes | Fetch user notes | Note |
| PUT | `/api/notes/delete` | Yes | Delete selected notes | Note |
| POST | `/api/folder/creat` | Yes | Create a directory folder | Folder |
| POST | `/api/social/post/file/upload` | Yes | Share note to social feed | Post |
| POST | `/api/social/post/like/submit`| Yes | Like or unlike a post | Like |
| POST | `/api/social/post/comment/post`| Yes | Comment on a post | Comment |
| POST | `/api/ai/summarize` | No | Generate Gemini AI summary | None |

---

## 6. Database Model Map

| Model | Important Fields | References | Main Feature |
| :--- | :--- | :--- | :--- |
| `User` | `email`, `password`, `profileimg` | None | Authentication |
| `Note` | `originalname`, `url`, `folderPath` | `User` | File Metadata |
| `Folder` | `name`, `folderPath` | `User` | Directory structure |
| `Post` | `type`, `folderPath` | `User`, `Note`, `Folder`, `About`| Social Feed |
| `Like` | `isLiked` | `User`, `About` | Social engagement |
| `Comment`| `comment` | `User`, `About` | Social engagement |
| `Follow` | `isaccept`, `isRejected` | `User` (x2) | Networking |
| `View` | `isreq`, `isRejected` | `User`, `About` | Privacy management |

**Relationships:**
The architecture centers around the `User`. Almost every model contains a reference to the `User` who created it. The social feed uses `Post`, which polymorphically links to either a `Note` (file) or a `Folder`. Interactions like `Like` and `Comment` tie back to the `About` model (metadata regarding a post).

---

## 7. Code-Quality and Architecture Review

### What the project does well
- Excellent separation of concerns between Firebase (object storage) and MongoDB (metadata).
- Seamless real-time UI integration using WebSockets alongside standard REST APIs.
- Modular route organization in the backend.

### Security concerns (P0)
- **JWT lacks expiration:** Tokens never expire. A stolen token grants permanent access. **Fix:** Add `{ expiresIn: "1h" }` to `jwt.sign`.
- **LocalStorage vulnerability:** Storing JWTs in `localStorage` exposes them to XSS. **Fix:** Store them in `HttpOnly` cookies.

### Scalability concerns (P1)
- **In-memory Socket mapping:** `const users = {}` in `index.js` breaks down completely if deployed across multiple servers. **Fix:** Utilize a Redis Pub/Sub adapter to sync socket connections globally.

### Database concerns (P2)
- **Sequential queries in loops:** In `/delete` routes and social upload routes, the backend uses `for` loops combined with `await Model.deleteOne()`. This runs queries sequentially, blocking execution. **Fix:** Utilize `Promise.all()` or MongoDB's `deleteMany()` with the `$in` operator for batch processing.
- **Connection pooling:** `connectToMongo()` is called inside individual route handlers (e.g., `index.js:53`, `auth.js:51`). This creates redundant database connections per request. **Fix:** Connect to MongoDB exactly once at server startup in `index.js` and rely on Mongoose's built-in connection pool.

### Architecture improvements (P3)
- **Gemini Parsing:** Using `.split('\n')` to parse AI output is fragile. **Fix:** Request JSON schema output from the API.

---

## 8. Interview Questions and Answers

### Project Overview
**Q: Explain the complete architecture of Note-Bridge.**
**A:** It's a MERN-stack application where the React frontend handles UI and Firebase file uploads. The Node/Express backend provides REST APIs for authentication and data management, storing metadata in MongoDB. A parallel Socket.IO server manages real-time notifications for social interactions.
**Follow-up:** Why use both MongoDB and Firebase?
**A:** MongoDB is highly efficient for querying relational metadata, but storing large binary files in a database severely impacts performance. Firebase Storage is purpose-built, optimized, and cheaper for holding binary objects.

### React and Frontend
**Q: How do you manage global state in this application?**
**A:** I used the React Context API to manage user authentication state, tokens, and notification counts. It provided a lightweight solution compared to Redux, which would have been over-engineering for this scope.
**Follow-up:** Why avoid creating socket connections inside React component renders?
**A:** Component renders occur frequently. If a socket is initialized inside the render body without a `useEffect`, it will spawn duplicate connections to the server on every state change, causing severe memory leaks.

### Express and REST APIs
**Q: How is a protected API route handled in Note-Bridge?**
**A:** Protected routes use a custom middleware called `fetchUser`. This middleware intercepts the request, reads the `authToken` header, verifies the JWT signature, and attaches the decoded user ID to the request object before passing control to the route logic.
**Follow-up:** What happens if the token is invalid?
**A:** The middleware catches the verification error and immediately returns a 401 Unauthorized status, preventing the main route logic from executing.

### WebSockets and Socket.IO
**Q: What happens after a user likes a post?**
**A:** The frontend sends a POST request to the API to save the like in MongoDB. Simultaneously, it emits a `postLike` socket event. The server receives this, looks up the post owner's socket ID in an in-memory dictionary, and emits the notification directly to them.
**Follow-up:** How would you support multiple servers?
**A:** The current in-memory dictionary won't scale across servers. I would integrate the Socket.IO Redis Adapter so that an event emitted on Server A is pushed to the Redis Pub/Sub channel, allowing Server B to deliver it to the client.

### AI Integration
**Q: How did you integrate the Gemini API?**
**A:** I created a backend Express route that accepts note text, constructs a strict prompt demanding a summary and tags, and calls the Google Generative AI SDK. The response is parsed and returned to the frontend.
**Follow-up:** How would you redesign the AI response parsing?
**A:** Instead of manually splitting strings by line breaks, I would configure the model to output strict JSON (`response_mime_type: "application/json"`), eliminating parsing errors.

---

## 9. Rapid Revision Section

### 15 Important Technical Terms
1. **JWT:** JSON Web Token, used for stateless authentication.
2. **bcrypt:** Cryptographic library to hash passwords.
3. **Mongoose:** Object Data Modeling (ODM) library for MongoDB.
4. **Middleware:** Functions executing between request and response in Express.
5. **WebSocket:** Persistent, bidirectional communication protocol.
6. **Socket.IO:** Wrapper for WebSockets handling fallbacks and reconnections.
7. **Firebase Storage:** Cloud object storage for binary files.
8. **Context API:** React's native solution for global state.
9. **CORS:** Cross-Origin Resource Sharing (allows frontend to ping backend).
10. **Prop Drilling:** Passing props down multiple component layers unnecessarily.
11. **REST:** Representational State Transfer, standard HTTP API architecture.
12. **NoSQL:** Non-relational databases like MongoDB.
13. **Vite:** Next-generation fast frontend build tool.
14. **Promise.all:** Executes multiple asynchronous operations concurrently.
15. **Multer:** Express middleware for handling multipart/form-data.

### 10 Mistakes to Avoid Saying in an Interview
1. Do not say "JWT encrypts data." It *encodes* data. It signs data, but does not hide it.
2. Do not claim the app handles millions of users (in-memory sockets prove otherwise).
3. Do not say WebSockets save data to the database; they only transit real-time events.
4. Do not confuse Firebase Client SDK with Firebase Admin SDK.
5. Do not say Redux was too hard; say Context API was better suited for the project scope.
6. Do not claim MongoDB is faster for storing images than Firebase.
7. Do not claim the application is 100% secure while storing JWTs in `localStorage`.
8. Do not say Socket.IO replaces HTTP requests. They work together.
9. Do not ignore error handling when explaining API calls.
10. Do not pretend you used tools listed in `package.json` that you didn't actually implement.

---

## 10. Honest Interview Positioning

To position this project honestly and impressively:
- **Acknowledge limitations proactively:** "Currently, my sockets are tracked in a memory object. If I were to deploy this behind a load balancer, I know I'd need to migrate to a Redis adapter."
- **Highlight security awareness:** "I used JWTs in local storage to build the MVP quickly, but I know for a strict production environment, implementing HttpOnly cookies is the standard to prevent XSS."
- **Focus on the integration challenge:** "The most interesting challenge wasn't just doing CRUD, but syncing standard HTTP requests for database operations with real-time Socket.IO events so the UI felt instantaneous."

---

## 11. Final Study Plan

- **Day 1: Architecture & Frontend:** Memorize the architecture diagram. Understand React Context API and why Vite was chosen.
- **Day 2: Backend & REST APIs:** Review Express routing, middleware execution flow, and CORS.
- **Day 3: Database & Authentication:** Master Mongoose referencing, JWT signature verification, and bcrypt hashing.
- **Day 4: Real-time Communication:** Thoroughly understand the Socket.IO lifecycle and the exact difference between `io.emit` and `io.to(id).emit`.
- **Day 5: Cloud Integration:** Review Firebase direct uploads vs backend metadata storage. Understand the Gemini AI prompt structure.
- **Day 6: Architecture Critiques:** Memorize the P0 and P1 code quality concerns (JWT expiration, database connection pooling).
- **Day 7: Mock Interview:** Practice the 30-second and 3-minute pitches aloud. Answer the 5 main interview questions without looking.
