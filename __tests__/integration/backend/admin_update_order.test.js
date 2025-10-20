import mongoose from "mongoose";
import { hashPassword } from "../../../helpers/authHelper";
import app from "../../../server";
import request from "supertest";
import userModel from "../../../models/userModel";
import orderModel from "../../../models/orderModel";

describe("Admins can view and update orders.", () => {
    let adminToken;
    let hashedPassword;
    let normal_user;

    beforeAll(async () => {
        hashedPassword = await hashPassword("Password123");
        const admin = await userModel.create({
            name: "Test Admin",
            email: "admin@test.com",
            password: hashedPassword,
            address: "123 ABC",
            phone: "81234567",
            answer: "Test Answer",
            role: 1
        })

        normal_user = await userModel.create({
            name: "Test User",
            email: "user@test.com",
            password: hashedPassword,
            address: "123 ABC",
            phone: "81234567",
            answer: "Test Answer",
            role: 1
        })

        const loginRes = await request(app).post("/api/v1/auth/login").send({
            email: "admin@test.com",
            password: "Password123"
        })

        adminToken = loginRes.body.token;
    })

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
    })

    test("Non-logged-in users cannot view orders", async () => {
        const res = await request(app).get("/api/v1/auth/all-orders");
        expect(res.statusCode).toBe(401);
    })

    test("Should allow admin to view all orders, view specific order, and edit specific order", async () => {
        const order = await orderModel.create({
            products: [],
            payment: {},
            buyer: normal_user._id,
            status: "Not Process"
        })

        let res = await request(app).get("/api/v1/auth/all-orders").set("Authorization", `${adminToken}`);
        expect(res.statusCode).toBe(200);
        // Check one order for this user.
        const ordersForTestUser = res.body.filter((order) => {
            return order.buyer._id == normal_user._id.toString();
        })

        expect(ordersForTestUser).toHaveLength(1);
        expect(ordersForTestUser[0].buyer._id).toEqual(normal_user._id.toString());
        expect(ordersForTestUser[0].status).toBe("Not Process");

        res = await request(app).put(`/api/v1/auth/order-status/${order._id}`).set("Authorization", `${adminToken}`).send({
            status: "Shipped"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
        expect(res.body.status).toBe("Shipped");
    })
})
