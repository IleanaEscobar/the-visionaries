const fs = require("fs");
const https = require("https");
const express = require("express");
const jwt = require("jsonwebtoken");      // <- needed
const socketIO = require("socket.io");    // <- for signaling WebRTC

const app = express();
app.use(express.json());

// DEV ONLY: replace with env variables in production
// need device key for arduino cam
const SECRET = process.env.JWT_SECRET || "dev-secret";
const DEVICE_KEY = process.env.DEVICE_KEY || "dev-device-key";

// HTTPS options
const options = {
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.crt")
};

// Create HTTPS server
const server = https.createServer(options, app);

// Attach Socket.IO for signaling
// In the future only allow frontend domain
const io = socketIO(server, {
  cors: { origin: "*" } // dev only NO PROD
});

// ===== LOGIN =====
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // DEV ONLY — replace with Firebase or DB
  if (username === "doctor" && password === "securepassword") {
    const token = jwt.sign({ role: "doctor" }, SECRET, { expiresIn: "15m" });
    return res.json({ token });
  }

  res.status(401).json({ error: "Unauthorized" });
});

// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

// ===== DEVICE AUTH =====
function deviceAuth(req, res, next) {
  if (req.headers["x-device-key"] !== DEVICE_KEY) {
    return res.sendStatus(401);
  }
  next();
}

// ===== FRAME UPLOAD =====
let latestFrame = null;
app.post("/frame", deviceAuth, (req, res) => {
  let data = [];
  req.on("data", chunk => data.push(chunk));
  req.on("end", () => {
    latestFrame = Buffer.concat(data);
    res.sendStatus(200);
  });
});

// ===== SOCKET.IO SIGNALLING (WebRTC) =====
io.on("connection", socket => {
  console.log("Client connected");

  // Listen for SDP offer from frontend
  socket.on("offer", (offer) => {
    // placeholder: handle WebRTC offer
    console.log("Received offer from client");
    // Send back answer (placeholder)
    socket.emit("answer", { type: "answer", sdp: "dummy-answer" });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ===== START SERVER =====
const PORT = 8443;
server.listen(PORT, () => {
  console.log(`Secure server running on https://localhost:${PORT}`);
});
