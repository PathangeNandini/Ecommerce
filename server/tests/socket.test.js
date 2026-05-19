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
function waitForEvent(socket, eventName, ms = 3000) {
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

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Socket.io — connection", () => {
  test("connects successfully with a valid JWT", (done) => {
    consumerSocket = Client(URL, { auth: { token: makeToken() } });
    consumerSocket.on("connect", done);
    consumerSocket.on("connect_error", (err) => done(err));
  });

  test("rejects connection with no token", (done) => {
    const bad = Client(URL, { auth: {} });
    bad.on("connect_error", (err) => {
      expect(err.message).toMatch(/No token/i);
      bad.disconnect();
      done();
    });
  });

  test("rejects connection with an invalid/expired token", (done) => {
    const bad = Client(URL, { auth: { token: "this.is.not.valid" } });
    bad.on("connect_error", (err) => {
      expect(err.message).toMatch(/Invalid token/i);
      bad.disconnect();
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Socket.io — join:order room", () => {
  const ORDER_ID = "order_abc123";

  test("consumer receives order:preparing after joining room", async () => {
    consumerSocket = Client(URL, { auth: { token: makeToken({ role: "consumer" }) } });
    merchantSocket = Client(URL, { auth: { token: makeToken({ role: "restaurant" }) } });

    await Promise.all([
      waitForEvent(consumerSocket, "connect"),
      waitForEvent(merchantSocket, "connect"),
    ]);

    // Consumer joins the order room
    consumerSocket.emit("join:order", ORDER_ID);
    // Give the server a tick to process the join
    await new Promise((r) => setTimeout(r, 100));

    // Merchant emits the status update
    const recvPromise = waitForEvent(consumerSocket, "order:preparing");
    merchantSocket.emit("order:preparing", { orderId: ORDER_ID });

    const data = await recvPromise;
    expect(data.orderId).toBe(ORDER_ID);
  });

  test("consumer receives order:delivered event", async () => {
    consumerSocket = Client(URL, { auth: { token: makeToken() } });
    await waitForEvent(consumerSocket, "connect");

    consumerSocket.emit("join:order", ORDER_ID);
    await new Promise((r) => setTimeout(r, 100));

    const recvPromise = waitForEvent(consumerSocket, "order:delivered");
    // Server itself emits (simulate controller calling io.to(...).emit)
    io.to(`order:${ORDER_ID}`).emit("order:delivered", { orderId: ORDER_ID });

    const data = await recvPromise;
    expect(data.orderId).toBe(ORDER_ID);
  });

  test("client NOT in the room does NOT receive events", (done) => {
    consumerSocket = Client(URL, { auth: { token: makeToken() } });

    consumerSocket.on("connect", () => {
      // Deliberately do NOT emit join:order
      consumerSocket.on("order:preparing", () => {
        done(new Error("Should not have received event without joining room"));
      });

      // Emit to a different room
      io.to("order:some_other_order").emit("order:preparing", { orderId: "some_other_order" });

      // Wait 500 ms — if no event fires, the test passes
      setTimeout(done, 500);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Socket.io — reconnection", () => {
  test("client reconnects after server-side disconnect without missing next event", async () => {
    const ORDER_ID = "order_reconnect_test";

    consumerSocket = Client(URL, {
      auth: { token: makeToken() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 200,
    });

    await waitForEvent(consumerSocket, "connect");
    consumerSocket.emit("join:order", ORDER_ID);
    await new Promise((r) => setTimeout(r, 100));

    // Force-disconnect the socket from the server side
    const serverSocket = [...io.sockets.sockets.values()].find(
      (s) => s.id === consumerSocket.id
    );
    serverSocket?.disconnect(true);

    // Wait for client to reconnect
    await waitForEvent(consumerSocket, "connect");

    // Rejoin the room after reconnect (mirrors useSocket.js behaviour)
    consumerSocket.emit("join:order", ORDER_ID);
    await new Promise((r) => setTimeout(r, 100));

    // Server emits an event — client must receive it
    const recvPromise = waitForEvent(consumerSocket, "order:delivered", 4000);
    io.to(`order:${ORDER_ID}`).emit("order:delivered", { orderId: ORDER_ID });

    const data = await recvPromise;
    expect(data.orderId).toBe(ORDER_ID);
  }, 10000);
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Socket.io — join:restaurant room", () => {
  test("merchant receives order:placed event after joining restaurant room", async () => {
    const RESTAURANT_ID = "rest_xyz789";

    merchantSocket = Client(URL, { auth: { token: makeToken({ role: "restaurant" }) } });
    await waitForEvent(merchantSocket, "connect");

    merchantSocket.emit("join:restaurant", RESTAURANT_ID);
    await new Promise((r) => setTimeout(r, 100));

    const recvPromise = waitForEvent(merchantSocket, "order:placed");
    io.to(`restaurant:${RESTAURANT_ID}`).emit("order:placed", {
      orderId: "order_new_001",
      items: [{ name: "Butter Chicken", quantity: 2 }],
      totalPrice: 340,
    });

    const data = await recvPromise;
    expect(data.orderId).toBe("order_new_001");
    expect(data.totalPrice).toBe(340);
  });
});
