const http = require("http");
const { Server } = require("socket.io");
const { io: Client } = require("socket.io-client");
const jwt = require("jsonwebtoken");

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Creates a signed JWT for a mock user — used to authenticate socket clients.
 */
function makeToken(payload = {}) {
  return jwt.sign(
    { id: "507f1f77bcf86cd799439011", role: "consumer", ...payload },
    process.env.JWT_SECRET || "test_secret",
    { expiresIn: "1h" }
  );
}

/**
 * Waits for a socket event with a timeout.
 * Rejects if the event doesn't fire within `ms` milliseconds.
 */
function waitForEvent(socket, eventName, ms = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for "${eventName}"`)), ms);
    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

// ─── Setup ──────────────────────────────────────────────────────────────────

let httpServer;
let io;
let consumerSocket;
let merchantSocket;
const PORT = 9001;
const URL  = `http://localhost:${PORT}`;

beforeAll((done) => {
  httpServer = http.createServer();
  io = new Server(httpServer, { cors: { origin: "*" } });

  // Minimal socket auth middleware (mirrors config/socket.js)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET || "test_secret");
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // Register the same events used in production
  io.on("connection", (socket) => {
    socket.on("join:order", (orderId) => socket.join(`order:${orderId}`));
    socket.on("join:restaurant", (restaurantId) => socket.join(`restaurant:${restaurantId}`));
    socket.on("order:preparing", ({ orderId }) => io.to(`order:${orderId}`).emit("order:preparing", { orderId }));
    socket.on("order:delivered", ({ orderId }) => io.to(`order:${orderId}`).emit("order:delivered", { orderId }));
  });

  httpServer.listen(PORT, done);
});

afterAll((done) => {
  io.close();
  httpServer.close(done);
});

afterEach(() => {
  consumerSocket?.disconnect();
  merchantSocket?.disconnect();
});

describe("Socket.io — reconnection", () => {
  test("client reconnects after temporary disconnect", async () => {
    const ORDER_ID = "order_reconnect_test";

    consumerSocket = Client(URL, {
      auth: { token: makeToken() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 200,
      forceNew: true,
    });

    // Initial connection
    await waitForEvent(consumerSocket, "connect");

    consumerSocket.emit("join:order", ORDER_ID);

    await new Promise((r) => setTimeout(r, 200));

    // Force transport close
    consumerSocket.io.engine.close();

    // Wait until socket reconnects
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Reconnect timeout"));
      }, 10000);

      const check = () => {
        if (consumerSocket.connected) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(check, 200);
        }
      };

      check();
    });

    // Rejoin room
    consumerSocket.emit("join:order", ORDER_ID);

    await new Promise((r) => setTimeout(r, 200));

    // Listen for event
    const recvPromise = waitForEvent(
      consumerSocket,
      "order:delivered",
      5000
    );

    io.to(`order:${ORDER_ID}`).emit("order:delivered", {
      orderId: ORDER_ID,
    });

    const data = await recvPromise;

    expect(data.orderId).toBe(ORDER_ID);
  }, 15000);
});