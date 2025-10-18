import mongoose from "mongoose";
import { hashPassword } from "../../helpers/authHelper";
import request from "supertest";
import userModel from "../../models/userModel";
import app from "../../server.js";
import {BraintreeGateway, Environment} from "braintree";

jest.mock("braintree", () => {
    return {
        BraintreeGateway: jest.fn().mockImplementation(() => ({
            clientToken: { generate: jest.fn() },
            transaction: { sale: jest.fn() }
        })),
        Environment: { Sandbox: "sandbox" }
    }
})

describe("Users can create and view their orders", () => {
    let userToken;
    let hashedPassword;
    let user;

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
        const res = await request(app).post("/api/v1/product/braintree/payment").set("Authorization", userToken);
        console.log(res.body);
    })
})
