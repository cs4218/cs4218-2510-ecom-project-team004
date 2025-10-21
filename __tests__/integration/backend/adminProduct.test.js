import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { hashPassword } from "../../../helpers/authHelper.js";
import userModel from "../../../models/userModel.js";
import categoryModel from "../../../models/categoryModel.js";
import app from "../../../server.js";
import productModel from "../../../models/productModel.js";

let mongod;
let adminToken;

jest.setTimeout(30000);

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongod.getUri();

    const pwd = await hashPassword("Password123");
    await userModel.create({
        name: "Test Admin",
        email: "admin@test.com",
        password: pwd,
        address: "123 ABC",
        phone: "81234567",
        answer: "Test Answer",
        role: 1,
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "admin@test.com",
        password: "Password123",
    });
    expect(loginRes.statusCode).toBe(200);
    adminToken = loginRes.body.token;
});

afterEach(async () => {
    await categoryModel.deleteMany({});
    await productModel.deleteMany({});
});

afterAll(async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.dropDatabase().catch(() => { });
        }
    } finally {
        await mongoose.disconnect().catch(() => { });
        if (mongod) {
            await mongod.stop();
        }
    }
});

describe("Admin Create Product Integration Testing", () => {
    const makeBuffer = (n) => Buffer.alloc(n, 0xaa);

    it("should create a product WITHOUT photo: 201", async () => {
        const cat = await categoryModel.create({ name: "Phones", slug: "phones" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "iPhone 15")
            .field("description", "Latest model")
            .field("price", "1299")
            .field("quantity", "5")
            .field("category", cat._id.toString())
            .field("shipping", "1");

        expect(res.statusCode).toBe(201);
        expect(res.body?.success).toBe(true);
        expect(res.body?.products?.slug).toBe("iphone-15");
    });

    it("should create a product WITH photo: 201", async () => {
        const cat = await categoryModel.create({ name: "Laptops", slug: "laptops" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "MacBook Pro")
            .field("description", "M-series")
            .field("price", "1999")
            .field("quantity", "3")
            .field("category", cat._id.toString())
            .field("shipping", "0")
            .attach("photo", makeBuffer(10_000), "photo.jpg");

        expect(res.statusCode).toBe(201);
        expect(res.body?.success).toBe(true);
        expect(res.body?.products?.slug).toBe("macbook-pro");
    });

    it("should reject photo > 1MB: 400", async () => {
        const cat = await categoryModel.create({ name: "Monitors", slug: "monitors" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "UltraSharp")
            .field("description", "27-inch")
            .field("price", "299")
            .field("quantity", "2")
            .field("category", cat._id.toString())
            .field("shipping", "1")
            .attach("photo", makeBuffer(1_000_001), "big.jpg");

        expect(res.statusCode).toBe(400);
        expect((res.body?.error || "").toLowerCase()).toContain("photo");
    });

    it("should require name: 400", async () => {
        const cat = await categoryModel.create({ name: "Audio", slug: "audio" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("description", "desc")
            .field("price", "100")
            .field("quantity", "1")
            .field("category", cat._id.toString())
            .field("shipping", "1");

        expect(res.statusCode).toBe(400);
        expect((res.body?.error || "").toLowerCase()).toContain("name");
    });

    it("should require description: 400", async () => {
        const cat = await categoryModel.create({ name: "Accessories", slug: "accessories" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Phone Case")
            .field("price", "25")
            .field("quantity", "10")
            .field("category", cat._id.toString())
            .field("shipping", "0");

        expect(res.statusCode).toBe(400);
        expect((res.body?.error || "").toLowerCase()).toContain("description");
    });

    it("should require price: 400", async () => {
        const cat = await categoryModel.create({ name: "Cameras", slug: "cameras" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Mirrorless X")
            .field("description", "APS-C")
            .field("quantity", "3")
            .field("category", cat._id.toString())
            .field("shipping", "1");

        expect(res.statusCode).toBe(400);
        expect((res.body?.error || "").toLowerCase()).toContain("price");
    });

    it("should require category: 400", async () => {
        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Orphaned")
            .field("description", "No category")
            .field("price", "10")
            .field("quantity", "1")
            .field("shipping", "1");

        expect(res.statusCode).toBe(400);
        expect((res.body?.error || "").toLowerCase()).toContain("category");
    });

    it("should require quantity: 400", async () => {
        const cat = await categoryModel.create({ name: "Storage", slug: "storage" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "SSD")
            .field("description", "Fast")
            .field("price", "150")
            .field("category", cat._id.toString())
            .field("shipping", "1");

        expect(res.statusCode).toBe(400);
        expect((res.body?.error || "").toLowerCase()).toContain("quantity");
    });

    it("should return 500 for invalid category ObjectId", async () => {
        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Bad Cat Ref")
            .field("description", "desc")
            .field("price", "100")
            .field("quantity", "1")
            .field("category", "not-a-valid-objectid")
            .field("shipping", "1");

        expect(res.statusCode).toBe(500);
    });

    it("should return 500 for non-numeric price", async () => {
        const cat = await categoryModel.create({ name: "Keyboards", slug: "keyboards" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Mech KB")
            .field("description", "Tactile")
            .field("price", "abc")
            .field("quantity", "2")
            .field("category", cat._id.toString())
            .field("shipping", "1");

        expect(res.statusCode).toBe(500);
    });

    it("should return 500 for duplicate slug", async () => {
        const cat = await categoryModel.create({ name: "Mice", slug: "mice" });

        const res1 = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "G502")
            .field("description", "Hero")
            .field("price", "60")
            .field("quantity", "4")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(res1.statusCode).toBe(201);

        const res2 = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "G502")
            .field("description", "Another")
            .field("price", "70")
            .field("quantity", "1")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(res2.statusCode).toBe(500);
    });

    it("should return 401 without Authorization token", async () => {
        const cat = await categoryModel.create({ name: "Tablets", slug: "tablets" });

        const res = await request(app)
            .post("/api/v1/product/create-product")
            // no .set("Authorization", adminToken)
            .field("name", "iPad")
            .field("description", "Air")
            .field("price", "899")
            .field("quantity", "5")
            .field("category", cat._id.toString())
            .field("shipping", "1");

        expect(res.statusCode).toBe(401);
    });
});

describe("Admin Update Product Integration Testing", () => {
    const makeBuffer = (n) => Buffer.alloc(n, 0xbb);

    it("should update product fields (no photo) and lowercase slug: 200", async () => {
        const catA = await categoryModel.create({ name: "Consoles", slug: "consoles" });
        const catB = await categoryModel.create({ name: "Handhelds", slug: "handhelds" });

        const createRes = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Nintendo Switch")
            .field("description", "v1")
            .field("price", "299")
            .field("quantity", "10")
            .field("category", catA._id.toString())
            .field("shipping", "1");
        expect(createRes.statusCode).toBe(201);

        const pid = createRes.body.products._id;

        const updateRes = await request(app)
            .put(`/api/v1/product/update-product/${pid}`)
            .set("Authorization", adminToken)
            .field("name", "Nintendo SWITCH OLED")
            .field("description", "v2")
            .field("price", "349")
            .field("quantity", "7")
            .field("category", catB._id.toString())
            .field("shipping", "0");

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body?.success).toBe(true);
        const p = updateRes.body.products;
        expect(p.name).toBe("Nintendo SWITCH OLED");
        expect(p.description).toBe("v2");
        expect(p.price).toBe(349);
        expect(p.quantity).toBe(7);
        expect(p.slug).toBe("nintendo-switch-oled");
        expect(p.category.toString()).toBe(catB._id.toString());
    });

    it("should update product WITH new photo: 200", async () => {
        const cat = await categoryModel.create({ name: "VR", slug: "vr" });

        const createRes = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Quest 3")
            .field("description", "Meta VR")
            .field("price", "499")
            .field("quantity", "8")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(createRes.statusCode).toBe(201);

        const pid = createRes.body.products._id;

        const updateRes = await request(app)
            .put(`/api/v1/product/update-product/${pid}`)
            .set("Authorization", adminToken)
            .field("name", "Quest 3")
            .field("description", "Meta VR (2023)")
            .field("price", "499")
            .field("quantity", "9")
            .field("category", cat._id.toString())
            .field("shipping", "1")
            .attach("photo", makeBuffer(50_000), "q3.jpg");
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body?.success).toBe(true);

        const photoRes = await request(app).get(`/api/v1/product/product-photo/${pid}`);
        expect(photoRes.statusCode).toBe(200);
        expect(photoRes.headers["content-type"]).toBeTruthy();
    });

    it("should reject update when missing name: 400", async () => {
        const cat = await categoryModel.create({ name: "PC", slug: "pc" });

        const createRes = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "RTX 5090")
            .field("description", "GPU")
            .field("price", "1999")
            .field("quantity", "2")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(createRes.statusCode).toBe(201);

        const pid = createRes.body.products._id;

        const updateRes = await request(app)
            .put(`/api/v1/product/update-product/${pid}`)
            .set("Authorization", adminToken)
            // missing name
            .field("description", "GPU+")
            .field("price", "1999")
            .field("quantity", "2")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(updateRes.statusCode).toBe(400);
        expect((updateRes.body?.error || "").toLowerCase()).toContain("name");
    });

    it("should reject update when photo > 1MB: 400", async () => {
        const cat = await categoryModel.create({ name: "Audio", slug: "audio" });

        const createRes = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "AirPods Pro")
            .field("description", "ANC")
            .field("price", "249")
            .field("quantity", "6")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(createRes.statusCode).toBe(201);

        const pid = createRes.body.products._id;

        const updateRes = await request(app)
            .put(`/api/v1/product/update-product/${pid}`)
            .set("Authorization", adminToken)
            .field("name", "AirPods Pro 2")
            .field("description", "ANC 2nd gen")
            .field("price", "249")
            .field("quantity", "6")
            .field("category", cat._id.toString())
            .field("shipping", "1")
            .attach("photo", makeBuffer(1_000_001), "big.jpg");
        expect(updateRes.statusCode).toBe(400);
        expect((updateRes.body?.error || "").toLowerCase()).toContain("photo");
    });

    it("should return 404 when updating non-existent but valid ObjectId", async () => {
        const cat = await categoryModel.create({ name: "Smart Home", slug: "smart-home" });
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .put(`/api/v1/product/update-product/${fakeId}`)
            .set("Authorization", adminToken)
            .field("name", "Nest Protect")
            .field("description", "Smoke + CO")
            .field("price", "119")
            .field("quantity", "3")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(res.statusCode).toBe(404);
    });

    it("should return 500 for invalid product ObjectId in URL", async () => {
        const cat = await categoryModel.create({ name: "Wearables", slug: "wearables" });

        const res = await request(app)
            .put(`/api/v1/product/update-product/not-a-valid-id`)
            .set("Authorization", adminToken)
            .field("name", "Apple Watch")
            .field("description", "Series 10")
            .field("price", "399")
            .field("quantity", "5")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(res.statusCode).toBe(500);
    });

    it("should fail with duplicate slug on update: 500", async () => {
        const cat = await categoryModel.create({ name: "Phones", slug: "phones" });

        // Create A
        const a = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Pixel 9")
            .field("description", "A")
            .field("price", "799")
            .field("quantity", "5")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(a.statusCode).toBe(201);

        // Create B
        const b = await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Galaxy S25")
            .field("description", "B")
            .field("price", "999")
            .field("quantity", "5")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(b.statusCode).toBe(201);

        const bId = b.body.products._id;

        const upd = await request(app)
            .put(`/api/v1/product/update-product/${bId}`)
            .set("Authorization", adminToken)
            .field("name", "Pixel 9")
            .field("description", "B+")
            .field("price", "999")
            .field("quantity", "5")
            .field("category", cat._id.toString())
            .field("shipping", "1");
        expect(upd.statusCode).toBe(500);
    });
});

describe("Admin View Products Integration Test", () => {
    const makeBuffer = (n) => Buffer.alloc(n, 0xcc);

    const seedProducts = async (n, { withPhotos = false, categorySlug = "default-cat" } = {}) => {
        const cat = await categoryModel.create({ name: categorySlug, slug: categorySlug });
        const created = [];
        for (let i = 0; i < n; i++) {
            const name = `Prod ${i + 1}`;
            let reqb = request(app)
                .post("/api/v1/product/create-product")
                .set("Authorization", adminToken)
                .field("name", name)
                .field("description", `Desc ${i + 1}`)
                .field("price", String(100 + i))
                .field("quantity", String(1 + (i % 5)))
                .field("category", cat._id.toString())
                .field("shipping", String(i % 2));
            if (withPhotos) {
                reqb = reqb.attach("photo", makeBuffer(10_000), `p${i + 1}.jpg`);
            }
            const res = await reqb;
            expect(res.statusCode).toBe(201);
            created.push(res.body.products);
        }
        return { cat, created };
    };

    it("should list products (GET /get-product) without photos, sorted desc, limited to 12: 200", async () => {
        // Create 15 products to test the 12-item limit
        const { created } = await seedProducts(15, { withPhotos: false, categorySlug: "list-cat" });

        const res = await request(app).get("/api/v1/product/get-product");
        expect(res.statusCode).toBe(200);
        expect(res.body?.success).toBe(true);
        expect(Array.isArray(res.body?.products)).toBe(true);

        // limit 12
        expect(res.body.products.length).toBe(12);

        for (const p of res.body.products) {
            expect(p.photo).toBeUndefined();
        }

        const newestName = "Prod 15";
        expect(res.body.products[0].name).toBe(newestName);
        expect(res.body.countTotal).toBe(12);
        expect((res.body.message || "").toLowerCase()).toContain("all products");
    });

    it("should get single product by slug (GET /get-product/:slug): 200", async () => {
        const { created } = await seedProducts(1, { categorySlug: "single-cat" });
        const prod = created[0];

        const res = await request(app).get(`/api/v1/product/get-product/${prod.slug}`);
        expect(res.statusCode).toBe(200);
        expect(res.body?.success).toBe(true);
        expect(res.body?.product?.slug).toBe(prod.slug);
        expect(res.body?.product?.category?._id).toBeTruthy();
    });

    it("should return 404 for unknown product slug", async () => {
        const res = await request(app).get("/api/v1/product/get-product/no-such-slug");
        expect(res.statusCode).toBe(404);
        expect(res.body?.success).toBe(false);
    });

    it("should return product photo for items with photo: 200", async () => {
        const { created } = await seedProducts(1, { withPhotos: true, categorySlug: "photo-cat" });
        const prod = created[0];

        const res = await request(app).get(`/api/v1/product/product-photo/${prod._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.headers["content-type"]).toBeTruthy();
    });

    it("should return 404 photo not found when product has no photo", async () => {
        const { created } = await seedProducts(1, { withPhotos: false, categorySlug: "no-photo-cat" });
        const prod = created[0];

        const res = await request(app).get(`/api/v1/product/product-photo/${prod._id}`);
        expect(res.statusCode).toBe(404);
        expect((res.body?.message || "").toLowerCase()).toContain("photo not found");
    });

    it("should paginate (GET /product-list/:page) with perPage=6: 200", async () => {
        await seedProducts(13, { withPhotos: false, categorySlug: "page-cat" });

        const page1 = await request(app).get("/api/v1/product/product-list/1");
        expect(page1.statusCode).toBe(200);
        expect(Array.isArray(page1.body?.products)).toBe(true);
        expect(page1.body.products.length).toBe(6);
        expect(page1.body.currentPage).toBe(1);
        expect(page1.body.totalProducts).toBe(13);
        expect(page1.body.totalPages).toBe(Math.ceil(13 / 6));

        const page2 = await request(app).get("/api/v1/product/product-list/2");
        expect(page2.statusCode).toBe(200);
        expect(page2.body.products.length).toBe(6);
        expect(page2.body.currentPage).toBe(2);

        const page3 = await request(app).get("/api/v1/product/product-list/3");
        expect(page3.statusCode).toBe(200);
        expect(page3.body.products.length).toBe(1);
        expect(page3.body.currentPage).toBe(3);
    });

    it("should reject invalid page number (<= 0): 400", async () => {
        const res = await request(app).get("/api/v1/product/product-list/0");
        expect(res.statusCode).toBe(400);
        expect((res.body?.message || "").toLowerCase()).toContain("invalid page number");
    });

    it("should return product count (GET /product-count): 200", async () => {
        await seedProducts(5, { withPhotos: false, categorySlug: "count-cat" });
        const res = await request(app).get("/api/v1/product/product-count");
        expect(res.statusCode).toBe(200);
        expect(res.body?.success).toBe(true);
        expect(typeof res.body?.total).toBe("number");
        expect(res.body.total).toBeGreaterThanOrEqual(5);
    });

    it("should filter by category and price range (POST /product-filters): 200", async () => {
        const { cat } = await seedProducts(3, { categorySlug: "filter-cat" });
        const res = await request(app)
            .post("/api/v1/product/product-filters")
            .send({ checked: [cat._id.toString()], radio: [101, 102] });
        expect(res.statusCode).toBe(200);
        expect(res.body?.success).toBe(true);
        expect(Array.isArray(res.body?.products)).toBe(true);
        expect(res.body.products.length).toBe(2);
    });

    it("should get products by category slug (GET /product-category/:slug): 200", async () => {
        const slug = "by-cat";
        const { cat } = await seedProducts(2, { categorySlug: slug });
        const other = await categoryModel.create({ name: "other", slug: "other" });
        await request(app)
            .post("/api/v1/product/create-product")
            .set("Authorization", adminToken)
            .field("name", "Other Prod")
            .field("description", "x")
            .field("price", "10")
            .field("quantity", "1")
            .field("category", other._id.toString())
            .field("shipping", "1")
            .attach("photo", makeBuffer(10_000), "o.jpg");

        const res = await request(app).get(`/api/v1/product/product-category/${slug}`);
        expect(res.statusCode).toBe(200);
        expect(res.body?.success).toBe(true);
        expect(res.body?.category?.slug).toBe(slug);
        expect(Array.isArray(res.body?.products)).toBe(true);
        expect(res.body.products.length).toBe(2);
        expect(res.body.products[0]?.category?._id).toBe(cat._id.toString());
    });

    it("should 404 when category slug not found for product-category route", async () => {
        const res = await request(app).get(`/api/v1/product/product-category/does-not-exist`);
        expect(res.statusCode).toBe(404);
        expect((res.body?.message || "").toLowerCase()).toContain("category not found");
    });
});
