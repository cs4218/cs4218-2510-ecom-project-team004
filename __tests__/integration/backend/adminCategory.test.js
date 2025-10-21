import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { hashPassword } from "../../../helpers/authHelper.js";
import userModel from "../../../models/userModel.js";
import categoryModel from "../../../models/categoryModel.js";
import app from "../../../server.js";

let mongod;
let adminToken;

describe("Admin Category Integration Testing", () => {
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
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        if (mongod) await mongod.stop();
    });

    it("should create category: 201", async () => {
        const res = await request(app)
            .post("/api/v1/category/create-category")
            .set("Authorization", adminToken)
            .send({ name: "Electronics" });

        expect(res.statusCode).toBe(201);
        expect(res.body?.success).toBe(true);
        expect(res.body?.category?.name).toBe("Electronics");
        expect(res.body?.category?.slug).toBe("electronics");
    });

    it("should return 400 when name is missing", async () => {
        const res = await request(app)
            .post("/api/v1/category/create-category")
            .set("Authorization", adminToken)
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body?.message?.toLowerCase()).toContain("name is required");
    });

    it("should not create duplicate categories", async () => {
        await categoryModel.create({ name: "Electronics", slug: "electronics" });

        const res = await request(app)
            .post("/api/v1/category/create-category")
            .set("Authorization", adminToken)
            .send({ name: "Electronics" });

        expect(res.statusCode).toBe(200);
        expect(res.body?.success).toBe(true);
        const count = await categoryModel.countDocuments({ name: "Electronics" });
        expect(count).toBe(1);
    });

    it("should trim and hyphenate slug correctly: 201", async () => {
        const res = await request(app)
            .post("/api/v1/category/create-category")
            .set("Authorization", adminToken)
            .send({ name: "   Home   Appliances  " });

        expect(res.statusCode).toBe(201);
        expect(res.body?.success).toBe(true);
        expect(res.body?.category?.slug).toBe("home-appliances");
    });

    it("should list all categories: 200", async () => {
        await categoryModel.create({ name: "A", slug: "a" });
        await categoryModel.create({ name: "B", slug: "b" });

        const res = await request(app)
            .get("/api/v1/category/get-category")
            .set("Authorization", adminToken);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body?.category)).toBe(true);
        expect(res.body.category).toHaveLength(2);
    });

    it("should get single category by slug: 200", async () => {
        await categoryModel.create({ name: "Gaming", slug: "gaming" });

        const res = await request(app)
            .get("/api/v1/category/single-category/gaming")
            .set("Authorization", adminToken);

        expect(res.statusCode).toBe(200);
        expect(res.body?.category?.slug).toBe("gaming");
    });

    it("should return 200 with null category for unknown slug", async () => {
        const res = await request(app)
            .get("/api/v1/category/single-category/not-found")
            .set("Authorization", adminToken);

        expect(res.statusCode).toBe(200);
        expect(res.body?.category).toBeNull();
    });

    it("should update category name and slug: 200", async () => {
        const cat = await categoryModel.create({ name: "Old", slug: "old" });

        const res = await request(app)
            .put(`/api/v1/category/update-category/${cat._id}`)
            .set("Authorization", adminToken)
            .send({ name: "New Name" });

        expect(res.statusCode).toBe(200);
        expect(res.body?.category?.name).toBe("New Name");
        expect(res.body?.category?.slug).toBe("new-name");
    });

    it("should return 500 when updating with missing name", async () => {
        const cat = await categoryModel.create({ name: "Old", slug: "old" });

        const res = await request(app)
            .put(`/api/v1/category/update-category/${cat._id}`)
            .set("Authorization", adminToken)
            .send({});

        expect(res.statusCode).toBe(500);
        expect(res.body?.success).toBe(false);
    });

    it("should return 500 when updating with invalid ObjectId", async () => {
        const res = await request(app)
            .put("/api/v1/category/update-category/not-valid-id")
            .set("Authorization", adminToken)
            .send({ name: "Invalid" });

        expect(res.statusCode).toBe(500);
        expect(res.body?.success).toBe(false);
    });

    it("should return 200 and null category when updating non-existent ID", async () => {
        const id = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/v1/category/update-category/${id}`)
            .set("Authorization", adminToken)
            .send({ name: "Nothing" });

        expect(res.statusCode).toBe(200);
        expect(res.body?.category).toBeNull();
    });

    it("should delete category: 200", async () => {
        const cat = await categoryModel.create({ name: "ToDelete", slug: "todelete" });

        const res = await request(app)
            .delete(`/api/v1/category/delete-category/${cat._id}`)
            .set("Authorization", adminToken);

        expect(res.statusCode).toBe(200);
        expect(res.body?.success).toBe(true);

        const remaining = await categoryModel.countDocuments({});
        expect(remaining).toBe(0);
    });

    it("should return 500 when deleting with invalid ObjectId", async () => {
        const res = await request(app)
            .delete("/api/v1/category/delete-category/not-valid-id")
            .set("Authorization", adminToken);

        expect(res.statusCode).toBe(500);
        expect(res.body?.success).toBe(false);
    });

    it("should return 200 and success:true when deleting non-existent but valid ObjectId", async () => {
        const id = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/v1/category/delete-category/${id}`)
            .set("Authorization", adminToken);

        expect(res.statusCode).toBe(200);
        expect(res.body?.success).toBe(true);
    });
});