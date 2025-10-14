/**
 * Braintree Payment API
 * The tests below are generated with help from GenAI
 */

import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import braintree from "braintree";

import productModel from "../../models/productModel.js";
import orderModel from "../../models/orderModel.js";
import productRoutes from "../../routes/productRoutes.js";

jest.mock("braintree", () => {
  const mockGenerate = jest.fn();
  const mockSale = jest.fn();

  return {
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: { generate: mockGenerate },
      transaction: { sale: mockSale },
    })),
    Environment: { Sandbox: "sandbox" },
    __mockGenerate: mockGenerate,
    __mockSale: mockSale,
  };
});

jest.mock("../../middlewares/authMiddleware.js", () => {
  const testUserId = "64f123abc456def789012345";
  return {
    requireSignIn: (req, res, next) => {
      req.user = { _id: testUserId };
      next();
    },
    isAdmin: (req, res, next) => {
      req.user.role = 0;
      next();
    },
    __testUserId: testUserId,
  };
});

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  app = express();
  app.use(bodyParser.json());
  app.use("/api/v1/product", productRoutes);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await productModel.deleteMany({});
  await orderModel.deleteMany({});
});

describe("Braintree Payment API Integration", () => {
  test("should generate token successfully", async () => {
    const fakeToken = { clientToken: "abc123" };
    braintree.__mockGenerate.mockImplementation((_, cb) => cb(null, fakeToken));

    const res = await request(app).get("/api/v1/product/braintree/token");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fakeToken);
    expect(braintree.__mockGenerate).toHaveBeenCalled();
  });

  test("should return 500 when token generation fails", async () => {
    braintree.__mockGenerate.mockImplementation((_, cb) =>
      cb(new Error("Token error"), null)
    );

    const res = await request(app).get("/api/v1/product/braintree/token");
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to generate token");
  });

  test("should return 400 when cart is empty", async () => {
    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({ nonce: "test-nonce", cart: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Cart cannot be empty");
  });

  test("should return 400 when nonce is missing", async () => {
    const fakeProduct = await productModel.create({
      name: "Test Product",
      slug: "test-product",
      description: "desc",
      price: 50,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({ cart: [{ _id: fakeProduct._id, price: fakeProduct.price }] });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Payment nonce required");
  });

  test("should process payment successfully and create order", async () => {
    const p1 = await productModel.create({
      name: "P1",
      slug: "p1",
      description: "desc",
      price: 50,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });
    const p2 = await productModel.create({
      name: "P2",
      slug: "p2",
      description: "desc",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const fakeResult = { success: true, transaction: { id: "txn123" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({
        nonce: "test-nonce",
        cart: [
          { _id: p1._id, price: p1.price },
          { _id: p2._id, price: p2.price },
        ],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(braintree.__mockSale).toHaveBeenCalledWith(
      expect.objectContaining({ amount: "150.00" }),
      expect.any(Function)
    );

    const orders = await orderModel.find({}).populate("products");
    expect(orders.length).toBe(1);
    expect(orders[0].products.length).toBe(2);
  });

  test("should handle floating point amounts correctly", async () => {
    const a = await productModel.create({
      name: "P1",
      slug: "p1",
      description: "desc",
      price: 14.99,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });
    const b = await productModel.create({
      name: "P2",
      slug: "p2",
      description: "desc",
      price: 999.99,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const fakeResult = { success: true, transaction: { id: "txnFloat" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({
        nonce: "test-nonce",
        cart: [
          { _id: a._id, price: a.price },
          { _id: b._id, price: b.price },
        ],
      });

    expect(res.statusCode).toBe(200);
    expect(braintree.__mockSale).toHaveBeenCalledWith(
      expect.objectContaining({ amount: "1014.98" }),
      expect.any(Function)
    );
  });

  test("should handle transaction failure gracefully", async () => {
    braintree.__mockSale.mockImplementation((data, cb) =>
      cb(new Error("Payment failed"), null)
    );

    const p = await productModel.create({
      name: "Fail Product",
      slug: "fail-product",
      description: "desc",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({ nonce: "test-nonce", cart: [{ _id: p._id, price: p.price }] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Payment failed");
    const orders = await orderModel.find({});
    expect(orders.length).toBe(0);
  });

  test("should not save order when transaction success = false", async () => {
    const p = await productModel.create({
      name: "Declined",
      slug: "declined",
      description: "desc",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const fakeResult = { success: false, message: "Card declined" };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({ nonce: "test-nonce", cart: [{ _id: p._id, price: p.price }] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Transaction failed");
    const orders = await orderModel.find({});
    expect(orders.length).toBe(0);
  });

  test("should handle DB save failure gracefully", async () => {
    const p = await productModel.create({
      name: "DB Fail",
      slug: "db-fail",
      description: "desc",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const fakeResult = { success: true, transaction: { id: "txnErr" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    jest
      .spyOn(orderModel.prototype, "save")
      .mockRejectedValueOnce(new Error("DB failure"));

    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({ nonce: "test-nonce", cart: [{ _id: p._id, price: p.price }] });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to save order");
  });

  test("should handle very large carts gracefully", async () => {
    const products = await productModel.insertMany(
      Array.from({ length: 300 }, (_, i) => ({
        name: `P${i}`,
        slug: `p${i}`,
        description: "desc",
        price: 1,
        category: new mongoose.Types.ObjectId(),
        quantity: 1,
        shipping: true,
      }))
    );

    const fakeResult = { success: true, transaction: { id: "txnLarge" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    const cart = products.map((p) => ({ _id: p._id, price: p.price }));
    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({ nonce: "test-nonce", cart });

    expect(res.statusCode).toBe(200);
    expect(braintree.__mockSale).toHaveBeenCalled();
  });

  test("should handle prices with many decimals", async () => {
    const p1 = await productModel.create({
      name: "Dec1",
      slug: "d1",
      description: "desc",
      price: 0.3333,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });
    const p2 = await productModel.create({
      name: "Dec2",
      slug: "d2",
      description: "desc",
      price: 19.9999,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const fakeResult = { success: true, transaction: { id: "txnDecimal" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({
        nonce: "test-nonce",
        cart: [
          { _id: p1._id, price: p1.price },
          { _id: p2._id, price: p2.price },
        ],
      });

    expect(res.statusCode).toBe(200);
    expect(braintree.__mockSale).toHaveBeenCalledWith(
      expect.objectContaining({ amount: "20.33" }),
      expect.any(Function)
    );
  });

  test("should handle concurrent payments without race conditions", async () => {
    const product = await productModel.create({
      name: "Concurrent",
      slug: "conc",
      description: "desc",
      price: 50,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const fakeResult = { success: true, transaction: { id: "txnConcurrent" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    const cart = [{ _id: product._id, price: product.price }];

    const promises = [
      request(app)
        .post("/api/v1/product/braintree/payment")
        .send({ nonce: "n", cart }),
      request(app)
        .post("/api/v1/product/braintree/payment")
        .send({ nonce: "n", cart }),
      request(app)
        .post("/api/v1/product/braintree/payment")
        .send({ nonce: "n", cart }),
    ];

    const results = await Promise.all(promises);
    results.forEach((r) => expect(r.statusCode).toBe(200));
  });

  test("should reject cart with missing price field", async () => {
    const fakeProduct = await productModel.create({
      name: "Broken",
      slug: "broken",
      description: "desc",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
    });

    const res = await request(app)
      .post("/api/v1/product/braintree/payment")
      .send({ nonce: "test-nonce", cart: [{ _id: fakeProduct._id }] });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid price in cart");
  });
});
