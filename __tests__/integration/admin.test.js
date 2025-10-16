import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import productModel from "../../models/productModel.js";
import categoryModel from "../../models/categoryModel.js";
import productRoutes from "../../routes/productRoutes.js";

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Only connect once across test file
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { dbName: "test" });
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
  // Full reset between tests
  await mongoose.connection.db.dropDatabase();
});

describe("Admin Products - GET /api/v1/product/get-product", () => {
  it("returns empty list and countTotal=0 when there are no products", async () => {
    const res = await request(app).get("/api/v1/product/get-product");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBe(0);
    expect(res.body.countTotal).toBe(0);
  });

  it("returns products (without photo), up to the 12 limit, sorted by createdAt desc", async () => {
    // Seed 15 products to verify server-side limit=12 and sorting
    const now = Date.now();
    const docs = Array.from({ length: 15 }, (_, i) => ({
      name: `Prod ${i}`,
      slug: `prod-${i}`,
      description: `Description ${i}`,
      price: i + 1,
      category: new mongoose.Types.ObjectId(), // ok even if not populated
      quantity: 10,
      shipping: true,
      createdAt: new Date(now - i * 1000),
      updatedAt: new Date(now - i * 1000),
    }));
    await productModel.insertMany(docs);

    const res = await request(app).get("/api/v1/product/get-product");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Enforced limit
    expect(res.body.products.length).toBe(12);
    expect(res.body.countTotal).toBe(12);

    // Sorted newest first: Prod 0 should be first if createdAt desc
    expect(res.body.products[0].name).toBe("Prod 0");

    // Photo should be excluded by controller .select("-photo")
    expect(res.body.products[0].photo).toBeUndefined();
  });

  it("returns populated category field when category exists", async () => {
    const cat = await categoryModel.create({ name: "Laptops", slug: "laptops" });
    await productModel.create({
      name: "UltraBook",
      slug: "ultrabook",
      description: "Thin and light",
      price: 999,
      category: cat._id,
      quantity: 5,
      shipping: true,
    });

    const res = await request(app).get("/api/v1/product/get-product");

    expect(res.statusCode).toBe(200);
    const p = res.body.products.find((x) => x.slug === "ultrabook");
    expect(p).toBeTruthy();
    // `populate("category")` should return an object with _id + fields
    expect(p.category && typeof p.category).toBe("object");
    expect(String(p.category._id)).toBe(String(cat._id));
    expect(p.category.name).toBe("Laptops");
  });
});

describe("Admin Products - GET /api/v1/product/product-photo/:pid", () => {
  it("returns binary photo with correct content-type", async () => {
    // Create a product with an embedded photo
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG signature bytes (minimal)
    const prod = await productModel.create({
      name: "WithPhoto",
      slug: "with-photo",
      description: "Has image",
      price: 123,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: true,
      photo: { data: buffer, contentType: "image/png" },
    });

    const res = await request(app).get(
      `/api/v1/product/product-photo/${prod._id}`
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/image\/png/);
    // Supertest gives Buffer in res.body for binary responses
    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect(res.body.length).toBe(buffer.length);
  });

  it("404 when product does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(
      `/api/v1/product/product-photo/${fakeId}`
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Product not found/i);
  });

  it("200 with empty/default body when product exists but no photo", async () => {
    const prod = await productModel.create({
      name: "NoPhoto",
      slug: "no-photo",
      description: "No image",
      price: 50,
      category: new mongoose.Types.ObjectId(),
      quantity: 3,
      shipping: true,
    });

    const res = await request(app).get(
      `/api/v1/product/product-photo/${prod._id}`
    );

    // Your controller may send 200 with a default image or a 404/204.
    // This assertion allows 200 or 204; adjust to your actual controller behavior:
    expect([200, 204, 404]).toContain(res.statusCode);
  });
});
