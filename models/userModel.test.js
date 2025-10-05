import mongoose from "mongoose";
import userModel from "./userModel";

describe("User Model Schema", () => {
    it("should accept if all fields are correct", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        expect(user.validateSync()).toBeUndefined(); // Returns undefined if adheres to schema.
    })

    it("should not allow missing names", () => {
        const user = new userModel({
            email: "janedoe@example.com",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();
        
        expect(error.errors.name.message).toEqual("Path `name` is required.");
        expect(error.errors.name.kind).toEqual("required");
    })

    it("should not allow empty names", () => {
        const user = new userModel({
            name: "",
            email: "",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.name.message).toEqual("Path `name` is required.");
        expect(error.errors.name.kind).toEqual("required");
    })

    it("should not allow empty trimmed names", () => {
        const user = new userModel({
            name: " ",
            email: "",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.name.message).toEqual("Path `name` is required.");
        expect(error.errors.name.kind).toEqual("required");
    })

    it("should trim names correctly", () => {
        const user = new userModel({
            name: " Jane Doe ",
            email: "",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        user.validateSync();

        expect(user.name).toEqual("Jane Doe");
    })

    it("should not allow missing emails", () => {
        const user = new userModel({
            name: "Jane Doe",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.email.message).toEqual("Path `email` is required.");
        expect(error.errors.email.kind).toEqual("required");
    })

    it("should not allow empty emails", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.email.message).toEqual("Path `email` is required.");
        expect(error.errors.email.kind).toEqual("required");
    })

    it("should not allow missing passwords", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.password.message).toEqual("Path `password` is required.");
        expect(error.errors.password.kind).toEqual("required");
    })

    it("should not allow empty passwords", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "",
            phone: "81234567",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.password.message).toEqual("Path `password` is required.");
        expect(error.errors.password.kind).toEqual("required");
    })

    it("should not allow missing phone", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "abcdef",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.phone.message).toEqual("Path `phone` is required.");
        expect(error.errors.phone.kind).toEqual("required");
    })

    it("should not allow empty phone", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "abcdef",
            phone: "",
            address: "Singapore",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.phone.message).toEqual("Path `phone` is required.");
        expect(error.errors.phone.kind).toEqual("required");
    })

    it("should not allow missing address", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "abcdef",
            phone: "81234567",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.address.message).toEqual("Path `address` is required.");
        expect(error.errors.address.kind).toEqual("required");
    })

    it("should not allow empty address", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "abcdef",
            phone: "81234567",
            address: "",
            answer: "Green",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.address.message).toEqual("Path `address` is required.");
        expect(error.errors.address.kind).toEqual("required");
    })

    it("should not allow missing answer", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.answer.message).toEqual("Path `answer` is required.");
        expect(error.errors.answer.kind).toEqual("required");
    })

    it("should not allow empty answer", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: "",
            role: 0
        });

        const error = user.validateSync();

        expect(error.errors.answer.message).toEqual("Path `answer` is required.");
        expect(error.errors.answer.kind).toEqual("required");
    })

    it("should not role to 0 by default if not specified", () => {
        const user = new userModel({
            name: "Jane Doe",
            email: "janedoe@example.com",
            password: "abcdef",
            phone: "81234567",
            address: "Singapore",
            answer: ""
        });

        user.validateSync();

        expect(user.role).toEqual(0);
    })
})
