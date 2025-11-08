// app.js
const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// serve static assets (public/chat.js, public/chat.css)
app.use(express.static(__dirname + '/public'));

// --------------------
// RESPONSE FUNCTIONS
// --------------------

// Responds with plain text
function respondText(req, res) {
  res.type('text').send('hi');
}

// Responds with JSON
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// Responds with transformed input
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Serves up the chat.html file
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

// Chat message receiver
function respondChat(req, res) {
  const { message } = req.query;
  if (message && message.trim() !== '') {
    chatEmitter.emit('message', message);
  }
  res.end();
}

// Server-Sent Events endpoint
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  const onMessage = (message) => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// --------------------
// ROUTES
// --------------------
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// --------------------
// START SERVER
// --------------------
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});