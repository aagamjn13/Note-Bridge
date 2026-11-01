const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

// Load environment variables for testing
process.env.JWT_MESSAGE = process.env.JWT_MESSAGE || 'test-secret-key-12345678901234567890';
process.env.PORT = '0'; // Let OS choose free port

const { app } = require('../index');

let testServer;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    testServer = http.createServer(app);
    testServer.listen(0, '127.0.0.1', () => {
      const port = testServer.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (testServer) {
    await new Promise((resolve) => testServer.close(resolve));
  }
});

test('GET /health returns 200 with status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
  assert.ok(data.timestamp);
});

test('GET / returns 200 welcome message', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.strictEqual(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('Note-Bridge Backend API'));
});

test('POST /api/ai/summarize without token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Some note text' }),
  });
  assert.strictEqual(res.status, 401);
  const data = await res.json();
  assert.strictEqual(data.error, true);
});

test('GET /api/notes/fetch without token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/notes/fetch`);
  assert.strictEqual(res.status, 401);
});

test('PUT /api/folder/fetch without token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/folder/fetch`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: 'someid', folderPath: 'MainSection' }),
  });
  assert.strictEqual(res.status, 401);
});
