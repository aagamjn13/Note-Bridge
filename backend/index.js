const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/+$/, '') : '*';
const allowedOrigins = clientUrl === '*' ? '*' : [clientUrl, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'authToken', 'Content-Type'],
  },
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Connect to MongoDB with retry logic
async function connectToMongo(retries = 5, delayMs = 2000) {
  const mongoUri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/note-bridge';
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB successfully');
      return;
    } catch (err) {
      console.warn(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// Health check endpoints for Render and monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Import route handlers
const Auth = require('./routes/auth');
const Notes = require('./routes/notes');
const Folder = require('./routes/folder');
const Post = require('./routes/social/post');
const notification = require('./routes/notification/notification');
const AI = require('./routes/ai');

app.use('/api/auth', Auth);
app.use('/api/notes', Notes);
app.use('/api/folder', Folder);
app.use('/api/social', Post);
app.use('/api/notification', notification);
app.use('/api/ai', AI);

// Import models for Socket.IO event processing
const User = require('./models/auth');
const Follow = require('./models/social/followReq');

// Users object to store all users' socket IDs with their user IDs
const users = {};

io.on('connection', (socket) => {
  // Connect user and save user ID and socket ID
  socket.on('userConnected', (userId) => {
    if (userId) {
      users[userId] = socket.id;
      io.to(socket.id).emit('userConnected', { id: userId, message: 'connected' });
    }
  });

  // Socket for follow request
  socket.on('followReq', async (data) => {
    try {
      const follow = await Follow.findById(data.id);
      const user = await User.findById(data.userId).select('-password');
      const followingSocketId = users[data.followingId];
      if (followingSocketId) {
        io.to(followingSocketId).emit('followReqStatus', { user, notification: follow, message: 'sent you follow request' });
      }
    } catch (err) {
      console.error('Socket followReq error:', err.message);
    }
  });

  // Socket for comment
  socket.on('postComment', async (data) => {
    try {
      const user = await User.findById(data.userId).select('-password');
      const userId = users[data.userAboutId];
      io.emit('postComment', { user, notification: data.newComment, message: 'commented on your post' });
      if (data.userId !== data.userAboutId && userId) {
        io.to(userId).emit('UserpostComment', { user, notification: data.newComment, message: 'commented on your post' });
      }
    } catch (err) {
      console.error('Socket postComment error:', err.message);
    }
  });

  // Socket for view request
  socket.on('viewReq', async (data) => {
    try {
      const user = await User.findById(data.userId).select('-password');
      const targetSocketId = users[data.userAboutId];
      if (targetSocketId) {
        io.to(targetSocketId).emit('viewReq', { user, notification: data.req, message: 'wants to see your post' });
      }
    } catch (err) {
      console.error('Socket viewReq error:', err.message);
    }
  });

  // Socket for likes
  socket.on('postLike', async (data) => {
    try {
      if (data.userId !== data.userAboutId) {
        const user = await User.findById(data.userId).select('-password');
        const targetSocketId = users[data.userAboutId];
        if (targetSocketId) {
          io.to(targetSocketId).emit('postLike', { user, notification: data.newLike, message: 'liked your post' });
        }
      }
    } catch (err) {
      console.error('Socket postLike error:', err.message);
    }
  });

  // Socket to delete like
  socket.on('deleteLike', async (data) => {
    try {
      if (data.userId !== data.userAboutId) {
        const user = await User.findById(data.userId).select('-password');
        const targetSocketId = users[data.userAboutId];
        if (targetSocketId) {
          io.to(targetSocketId).emit('deleteLike', { user, id: data.id, type: 'delete' });
        }
      }
    } catch (err) {
      console.error('Socket deleteLike error:', err.message);
    }
  });

  // Socket to delete follow request
  socket.on('deletefollowReq', async (data) => {
    try {
      const user = await User.findById(data.userId).select('-password');
      const followingSocketId = users[data.followingId];
      if (followingSocketId) {
        io.to(followingSocketId).emit('deletefollowReq', { user, id: data.id, type: 'delete' });
      }
    } catch (err) {
      console.error('Socket deletefollowReq error:', err.message);
    }
  });

  // Socket to delete view request
  socket.on('deleteviewReq', async (data) => {
    try {
      const user = await User.findById(data.userId).select('-password');
      const targetSocketId = users[data.userAboutId];
      if (targetSocketId) {
        io.to(targetSocketId).emit('deleteviewReq', { user, id: data.id, type: 'delete' });
      }
    } catch (err) {
      console.error('Socket deleteviewReq error:', err.message);
    }
  });

  // Socket for accepting requests
  socket.on('acceptReq', async (data) => {
    try {
      const user = await User.findById(data.followingId).select('-password');
      const followerSocketId = users[data.followerId];
      if (followerSocketId) {
        io.to(followerSocketId).emit('acceptReq', { user, reqAccept: data.reqAccept, message: 'request accepted' });
      }
    } catch (err) {
      console.error('Socket acceptReq error:', err.message);
    }
  });

  // Socket for denying requests
  socket.on('denyReq', async (data) => {
    try {
      const user = await User.findById(data.followingId).select('-password');
      const followerSocketId = users[data.followerId];
      if (followerSocketId) {
        io.to(followerSocketId).emit('denyReq', { user, reqDenied: data.reqDenied, message: 'request denied' });
      }
    } catch (err) {
      console.error('Socket denyReq error:', err.message);
    }
  });

  // Socket disconnect
  socket.on('disconnect', () => {
    for (const [uid, sid] of Object.entries(users)) {
      if (sid === socket.id) {
        delete users[uid];
        break;
      }
    }
  });
});

app.get('/', (req, res) => {
  res.send('Note-Bridge Backend API is running!');
});

const port = process.env.PORT || 5000;
const host = '0.0.0.0';

async function start() {
  await connectToMongo();
  server.listen(port, host, () => {
    console.log(`Note-Bridge server running on http://${host}:${port}`);
  });
}

// Only start the server when run directly (not when required by tests)
if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

module.exports = { app, server, connectToMongo };
