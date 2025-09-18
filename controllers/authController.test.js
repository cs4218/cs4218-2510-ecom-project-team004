import { registerController, loginController } from "./authController";
import userModel from "../models/userModel";

jest.mock("../models/userModel");

describe("Register Controller", () => {
    const mockReq = {
        body: {
            name: "ABCDEF",
            email: "abc@def.com",
            password: "PASSWORD",
            phone: "81234567",
            address: "123 ABC",
            answer: "ANSWER"
        }
    }

    let mockRes = {}

    beforeEach(() => {
        mockRes = {
            send: jest.fn(),
            status: jest.fn(() => mockRes) // To allow chaining.
        }
    })

    afterEach(() => {
        jest.resetAllMocks();
    })

    it("Should return an error when name is empty", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.name;

        await registerController(req, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({ message: "Name is Required" });
    })

    it("Should return an error when email is empty", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.email;

        await registerController(req, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({ message: "Email is Required" });
    })

    it("Should return an error when password is empty", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.password;

        await registerController(req, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({ message: "Password is Required" });
    })

    it("Should return an error when phone is empty", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.phone;

        await registerController(req, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
    })

    it("Should return an error when address is empty", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.address;

        await registerController(req, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({ message: "Address is Required" });
    })

    it("Should return an error when answer is empty", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.answer;

        await registerController(req, mockRes);

        expect(mockRes.send).toHaveBeenCalledWith({ message: "Answer is Required" });
    })

    it("Should return OK for successful registration", async () => {
        // Assumes no conflicting existing user.
        userModel.findOne.mockResolvedValue(null);

        await registerController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", true);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "User Register Successfully");
    }, 30000)

    it("Should return an error for duplicate registration", async () => {
        // Assumes no conflicting existing user.
        userModel.findOne.mockResolvedValue(mockReq.body);

        await registerController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Already Register please login");
    }, 30000)

    it("Should return an error when an error is thrown", async () => {
        userModel.findOne.mockImplementation(() => { throw new Error(); });

        await registerController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Error in Registeration");
    }, 30000)
})

describe("Login Controller", () => {
    let mockReq = {
        body: {
            email: "abc@def.com",
            password: "PASSWORD"
        }
    }
    let mockRes = {};

    beforeEach(() => {
        mockRes = {
            send: jest.fn(),
            status: jest.fn(() => mockRes)
        }
    })

    afterEach(() => {
        jest.resetAllMocks();
    })

    it("Should deny authentication if email is missing", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.email;

        await loginController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Invalid email or password");
    })

    it("Should deny authentication if password is missing", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.password;

        await loginController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Invalid email or password");
    })

    it("Should deny authentication if email is empty", async () => {
        const req = { body: { ...mockReq.body } };
        req.body.email = "";

        await loginController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Invalid email or password");
    })

    it("Should deny authentication if password is missing", async () => {
        const req = { body: { ...mockReq.body } };
        req.body.password =  "";

        await loginController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Invalid email or password");
    })

    it("Should deny authentication if email cannot be found", async () => {
        userModel.findOne.mockResolvedValue(null);

        await loginController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Email is not registered");
    })

    it("Should deny authentication if password does not match", async () => {
        const foundUser = { ...mockReq.body };
        foundUser.password = "WRONG PASSWORD";
        userModel.findOne.mockResolvedValue(foundUser);

        await loginController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Invalid Password");
    })
})
