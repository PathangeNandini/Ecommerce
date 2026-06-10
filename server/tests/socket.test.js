const { createServer } = require("http");
const { Server } = require("socket.io");
const { io: Client } = require("socket.io-client");

const createTestServer = () => {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    pingTimeout: 2000,
    pingInterval: 1000,
  });
  return { httpServer, io };
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("WebSocket Reconnection Tests", () => {
  let io, httpServer, port;
  const clients = [];

  beforeAll((done) => {
    const server = createTestServer();
    io = server.io;
    httpServer = server.httpServer;

    httpServer.listen(0, () => {
      port = httpServer.address().port;

      io.on("connection", (socket) => {
        socket.on("join:order", (orderId) => {
          socket.join(`order:${orderId}`);
        });
        socket.on("join:owner", () => {
          socket.join("owner:all");
        });
        socket.on("ping:test", (data) => {
          socket.emit("pong:test", data);
        });
      });

      done();
    });
  });

  afterAll((done) => {
    clients.forEach((c) => { if (c.connected) c.disconnect(); });
    io.close();
    httpServer.close(done);
  });

  const makeClient = (opts = {}) => {
    const c = new Client(`http://localhost:${port}`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 200,
      reconnectionDelayMax: 500,
      ...opts,
    });
    clients.push(c);
    return c;
  };

  // ── Test 1 — Basic connection ──────────────────────────
  test("client connects to server successfully", (done) => {
    const c = makeClient();
    c.on("connect", () => {
      expect(c.connected).toBe(true);
      c.disconnect();
      done();
    });
  });

  // ── Test 2 — Join order room ───────────────────────────
  test("client joins order room and receives order update", (done) => {
    const c = makeClient();
    const orderId = "test-order-123";

    c.on("connect", () => {
      c.emit("join:order", orderId);

      setTimeout(() => {
        c.on("order:preparing", (data) => {
          expect(data.orderId).toBe(orderId);
          expect(data.status).toBe("preparing");
          c.disconnect();
          done();
        });

        io.to(`order:${orderId}`).emit("order:preparing", {
          orderId,
          status: "preparing",
          updatedAt: new Date(),
        });
      }, 100);
    });
  });

  // ── Test 3 — Reconnection without losing payload ───────
  test("client reconnects and re-joins order room without losing payload", (done) => {
    const orderId = "reconnect-order-456";
    const c = makeClient();
    let connected = false;

    c.on("connect", () => {
      c.emit("join:order", orderId);

      if (!connected) {
        connected = true;
        // Force disconnect after joining
        setTimeout(() => {
          c.disconnect();
          // Reconnect after short delay
          setTimeout(() => {
            c.connect();
          }, 300);
        }, 200);
      }
    });

    c.on("reconnect", () => {
      c.emit("join:order", orderId);
    });

    // Also handle plain re-connect event
    c.on("connect", () => {
      if (connected) {
        c.emit("join:order", orderId);
      }
    });

    c.on("order:transit", (data) => {
      expect(data.orderId).toBe(orderId);
      expect(data.status).toBe("transit");
      c.disconnect();
      done();
    });

    // Emit after enough time for reconnect to complete
    setTimeout(() => {
      io.to(`order:${orderId}`).emit("order:transit", {
        orderId,
        status: "transit",
        updatedAt: new Date(),
      });
    }, 1000);
  }, 10000);

  // ── Test 4 — No payload loss after reconnect ───────────
  test("order status updates are not lost after reconnection", (done) => {
    const orderId = "payload-order-789";
    const c = makeClient();
    let firstConnect = true;

    c.on("connect", () => {
      c.emit("join:order", orderId);

      if (firstConnect) {
        firstConnect = false;
        setTimeout(() => {
          c.disconnect();
          setTimeout(() => c.connect(), 300);
        }, 200);
      }
    });

    c.on("order:delivered", (data) => {
      expect(data.status).toBe("delivered");
      c.disconnect();
      done();
    });

    setTimeout(() => {
      io.to(`order:${orderId}`).emit("order:delivered", {
        orderId,
        status: "delivered",
        updatedAt: new Date(),
      });
    }, 1000);
  }, 10000);

  // ── Test 5 — Multiple clients in same room ─────────────
  test("multiple clients in same order room all receive updates", (done) => {
    const orderId = "multi-client-order";
    let receivedCount = 0;
    const totalClients = 3;
    const roomClients = [];

    for (let i = 0; i < totalClients; i++) {
      const c = makeClient();
      roomClients.push(c);

      c.on("connect", () => {
        c.emit("join:order", orderId);
      });

      c.on("order:assigned", (data) => {
        expect(data.orderId).toBe(orderId);
        receivedCount++;
        if (receivedCount === totalClients) {
          roomClients.forEach((cl) => cl.disconnect());
          done();
        }
      });
    }

    setTimeout(() => {
      io.to(`order:${orderId}`).emit("order:assigned", {
        orderId,
        status: "assigned",
        updatedAt: new Date(),
      });
    }, 300);
  }, 10000);

  // ── Test 6 — Owner room receives new order ─────────────
  test("owner room receives order:placed event", (done) => {
    const c = makeClient();

    c.on("connect", () => {
      c.emit("join:owner");

      setTimeout(() => {
        c.on("order:placed", (data) => {
          expect(data.status).toBe("placed");
          expect(data.totalPrice).toBe(450);
          c.disconnect();
          done();
        });

        io.to("owner:all").emit("order:placed", {
          orderId: "new-order-001",
          status: "placed",
          totalPrice: 450,
          createdAt: new Date(),
        });
      }, 100);
    });
  });

  // ── Test 7 — Ping/pong echo ────────────────────────────
  test("server echoes ping:test back as pong:test with same payload", (done) => {
    const c = makeClient();
    const payload = { msg: "hello", ts: Date.now() };

    c.on("connect", () => {
      c.emit("ping:test", payload);
      c.on("pong:test", (data) => {
        expect(data.msg).toBe(payload.msg);
        expect(data.ts).toBe(payload.ts);
        c.disconnect();
        done();
      });
    });
  });
});