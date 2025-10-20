import mongoose from "mongoose";
import { hashPassword } from "../../../helpers/authHelper.js";
import request from "supertest";
import userModel from "../../../models/userModel.js";
import productModel from "../../../models/productModel.js";
import categoryModel from "../../../models/categoryModel.js";
import app from "../../../server.js";
import {BraintreeGateway, Environment} from "braintree";
import braintree from "braintree";

jest.mock("braintree", () => {
    const mockSale = jest.fn();
    return {
        BraintreeGateway: jest.fn().mockImplementation(() => ({
            clientToken: { generate: jest.fn() },
            transaction: { sale: mockSale }
        })),
        Environment: { Sandbox: "sandbox" },
        mockSale: mockSale
    }
})

describe("Users can create and view their orders", () => {
    let userToken;
    let hashedPassword;
    let user;
    let testCategory;

    let testProduct1;
    let testProduct2;

    beforeAll(async () => {
        hashedPassword = await hashPassword("Password123");

        user = await userModel.create({
            name: "Test User",
            email: "user@test.com",
            password: hashedPassword,
            address: "123 ABC",
            phone: "81234567",
            answer: "Test Answer",
            role: 1
        })

        testCategory = await categoryModel.create({
            name: "Test Category",
            slug: "test-category"
        })

        testProduct1 = await productModel.create({
            name: "Test 1",
            slug: "test-1",
            description: "Test Description 1",
            price: 100,
            category: testCategory._id,
            quantity: 1,
            shipping: false
        })

        testProduct2 = await productModel.create({
            name: "Test 2",
            slug: "test-2",
            description: "Test Description 2",
            price: 200,
            category: testCategory._id,
            quantity: 2,
            shipping: true
        })

        const loginRes = await request(app).post("/api/v1/auth/login").send({
            email: "user@test.com",
            password: "Password123"
        })

        userToken = loginRes.body.token;
    })

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
    })

    test("Logged out users cannot create any orders.", async() => {
        const res = await request(app).post("/api/v1/product/braintree/payment");
        expect(res.statusCode).toBe(401);
    })

    test("Logged out users cannot view their orders.", async() => {
        const res = await request(app).get("/api/v1/auth/orders");
        expect(res.statusCode).toBe(401);
    })

    test("User can create and view an order.", async () => {
        const fakeResult = { success: true }
        braintree.mockSale.mockImplementation((data, callback) => callback(null, fakeResult));

        // Create an order with testProduct1 and testProduct2.
        const res = await request(app).post("/api/v1/product/braintree/payment").set("Authorization", userToken).send({
            nonce: "123",
            cart: [ testProduct1, testProduct2 ].map((p) => ({ _id: p._id, price: p.price }))
        });
        
        expect(braintree.mockSale).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(res.body.ok).toBe(true);

        // View order as user.
        const res2 = await request(app).get("/api/v1/auth/orders").set("Authorization", userToken);

        expect(res2.statusCode).toBe(200);
        expect(res2.body).toHaveLength(1);
        expect(res2.body[0].products).toHaveLength(2);
        expect(res2.body[0].products[0]._id).toBe(testProduct1._id.toString());
        expect(res2.body[0].products[1]._id).toBe(testProduct2._id.toString());
        expect(res2.body[0].buyer._id).toBe(user._id.toString());
    }, 30000)
})
