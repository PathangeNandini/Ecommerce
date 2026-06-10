const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

describe("MongoDB Index Optimization (explain() plans)", () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ── Test 1 — 2dsphere index on Restaurant ─────────────
  test("Restaurant geoNear query uses 2dsphere index, not COLLSCAN", async () => {
    const result = await mongoose.connection
      .collection("restaurants")
      .find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [80.2707, 13.0827] },
            $maxDistance: 5000,
          },
        },
      })
      .explain("executionStats");

    const stage = result.executionStats.executionStages;
    const stageStr = JSON.stringify(stage);

    // Must use GEO_NEAR_2DSPHERE or IXSCAN — never COLLSCAN
    expect(stageStr).not.toMatch(/COLLSCAN/);
    expect(stageStr).toMatch(/GEO_NEAR_2DSPHERE|2dsphere|IXSCAN/);

    console.log("✅ Restaurant geo query stage:", stage.stage);
  }, 15000);

  // ── Test 2 — Order lookup by userId uses index ─────────
  test("Order query by userId uses IXSCAN not COLLSCAN", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const result = await mongoose.connection
      .collection("orders")
      .find({ userId: fakeId })
      .explain("executionStats");

    const stage = result.executionStats.executionStages;
    const stageStr = JSON.stringify(stage);

    expect(stageStr).not.toMatch(/COLLSCAN/);
    console.log("✅ Order userId query stage:", stage.stage);
    console.log("   Docs examined:", result.executionStats.totalDocsExamined);
    console.log("   Keys examined:", result.executionStats.totalKeysExamined);
  }, 15000);

  // ── Test 3 — Order lookup by restaurantId uses index ───
  test("Order query by restaurantId uses IXSCAN not COLLSCAN", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const result = await mongoose.connection
      .collection("orders")
      .find({ restaurantId: fakeId })
      .explain("executionStats");

    const stage = result.executionStats.executionStages;
    const stageStr = JSON.stringify(stage);

    expect(stageStr).not.toMatch(/COLLSCAN/);
    console.log("✅ Order restaurantId query stage:", stage.stage);
  }, 15000);

  // ── Test 4 — Order lookup by courierId uses index ──────
  test("Order query by courierId uses IXSCAN not COLLSCAN", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const result = await mongoose.connection
      .collection("orders")
      .find({ courierId: fakeId })
      .explain("executionStats");

    const stage = result.executionStats.executionStages;
    const stageStr = JSON.stringify(stage);

    expect(stageStr).not.toMatch(/COLLSCAN/);
    console.log("✅ Order courierId query stage:", stage.stage);
  }, 15000);

  // ── Test 5 — Review lookup by restaurantId uses index ──
  test("Review query by restaurantId uses IXSCAN not COLLSCAN", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const result = await mongoose.connection
      .collection("reviews")
      .find({ restaurantId: fakeId })
      .explain("executionStats");

    const stage = result.executionStats.executionStages;
    const stageStr = JSON.stringify(stage);

    expect(stageStr).not.toMatch(/COLLSCAN/);
    console.log("✅ Review restaurantId query stage:", stage.stage);
  }, 15000);

  // ── Test 6 — Reservation lookup by userId uses index ───
  test("Reservation query by userId uses IXSCAN not COLLSCAN", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const result = await mongoose.connection
      .collection("reservations")
      .find({ userId: fakeId })
      .explain("executionStats");

    const stage = result.executionStats.executionStages;
    const stageStr = JSON.stringify(stage);

    expect(stageStr).not.toMatch(/COLLSCAN/);
    console.log("✅ Reservation userId query stage:", stage.stage);
  }, 15000);
});