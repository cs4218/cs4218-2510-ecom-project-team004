import mongoose from "mongoose";
import orderModel from "./orderModel";

describe("Order Model", () => {
    it("Should accept if all fields are correct", () => {
        const order = new orderModel({
            products: [],
            payment: {},
            buyer: null,
            status: "Processing"
        })

        expect(order.validateSync()).toBeUndefined();
    })

    it("Should set status to default value if not specified", () => {
        const order = new orderModel({
            products: [],
            payment: {},
            buyer: null,
        })

        expect(order.validateSync()).toBeUndefined();
        expect(order.status).toEqual("Not Process");
    })

    it("Should only allow status to be one of allowed values", () => {
        const order = new orderModel({
            products: [],
            payment: {},
            buyer: null,
            status: "NOT ACCEPTED VALUE"
        })

        const error = order.validateSync();
        expect(error.errors.status.message).toBeDefined();
    })

    it("Should allow status to be set to one of allowed values", () => {
        const order = new orderModel({
            products: [],
            payment: {},
            buyer: null,
            status: "NOT ACCEPTED VALUE"
        })

        order.status = "Shipped";

        expect(order.validateSync()).toBeUndefined();
    })
})
