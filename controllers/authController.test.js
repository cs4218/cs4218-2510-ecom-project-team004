import { registerController, loginController, forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController } from "./authController";
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT from "jsonwebtoken";

jest.mock("../models/userModel");
jest.mock("../models/orderModel");
jest.mock("jsonwebtoken");

jest.mock("../helpers/authHelper");

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

        comparePassword.mockResolvedValue(false);

        await loginController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Invalid Password");
    })

    it("Should authenticate successfully if email and password matches", async () => {
        const foundUser = { ...mockReq.body };
        userModel.findOne.mockResolvedValue(foundUser);

        comparePassword.mockResolvedValue(true);

        await loginController(mockReq, mockRes);

        expect(JWT.sign).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", true);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "login successfully");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("user");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("token");
    })

    it("Should report an error if an error is reached", async () => {
        userModel.findOne.mockImplementation(() => { throw new Error(); });

        await loginController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Error in login");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("error");
    })
})

describe("Forgot Password Controller", () => {
    const mockReq = {
        body: {
            email: "abc@def.com",
            answer: "ANSWER",
            newPassword: "NEW PASWORD"
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

    it("Should return an error if email is missing", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.email;

        await forgotPasswordController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Email is required");
    })

    it("Should return an error if answer is missing", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.answer;

        await forgotPasswordController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Answer is required");
    })

    it("Should return an error if new password is missing", async () => {
        const req = { body: { ...mockReq.body } };
        delete req.body.newPassword;

        await forgotPasswordController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "New Password is required");
    })

    it("Should return an error if no user is found", async () => {
        userModel.findOne.mockResolvedValue(null);

        await forgotPasswordController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Wrong Email Or Answer");
    })

    it("Should update the uesr profile if authentication succeeds", async () => {
        userModel.findOne.mockResolvedValue(mockReq.body);

        await forgotPasswordController(mockReq, mockRes);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", true);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Password Reset Successfully");
    })

    it("Should report an error when an error is encountered", async () => {
        userModel.findOne.mockImplementation(() => { throw new Error(); });
        await forgotPasswordController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Something went wrong");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("error");
    })
})

describe("Update Profile Controller", () => {
    const mockReq = {
        body: {
            name: "ABCDEF",
            email: "abc@def.com",
            password: "PASSWORD",
            phone: "81234567",
            address: "123 ABC"
        },
        user: {
            _id: "123"
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

    it("Should return an error if password is 5 characters", async () => {
        const req = { body: { ...mockReq.body }, user: { ...mockReq.user } };
        req.body.password = "12345";

        await updateProfileController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Passsword is required and 6 character long");
    })

    it("Should update fields successfully if password is 6 characters", async () => {
        const req = { body: { ...mockReq.body }, user: { ...mockReq.user } };
        req.body.password = "123456";

        userModel.findById.mockResolvedValue(mockReq.body);
        hashPassword.mockResolvedValue("HASHED PASSWORD");

        await updateProfileController(req, mockRes);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
        expect(userModel.findByIdAndUpdate.mock.calls[0][0]).toEqual(req.user._id);
        expect(userModel.findByIdAndUpdate.mock.calls[0][1]).toHaveProperty("name", mockReq.body.name);
        expect(userModel.findByIdAndUpdate.mock.calls[0][1]).toHaveProperty("password", "HASHED PASSWORD");
        expect(userModel.findByIdAndUpdate.mock.calls[0][1]).toHaveProperty("phone", mockReq.body.phone);
        expect(userModel.findByIdAndUpdate.mock.calls[0][1]).toHaveProperty("address", mockReq.body.address);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", true);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Profile Updated Successfully");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("updatedUser");
    })

    it("Should update fields successfully if password is 7 characters", async () => {
        const req = { body: { ...mockReq.body }, user: { ...mockReq.user } };
        req.body.password = "1234567";

        userModel.findById.mockResolvedValue(mockReq.body);
        hashPassword.mockResolvedValue("HASHED PASSWORD");

        await updateProfileController(req, mockRes);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
        expect(userModel.findByIdAndUpdate.mock.calls[0][0]).toEqual(req.user._id);
        expect(userModel.findByIdAndUpdate.mock.calls[0][1]).toHaveProperty("name", mockReq.body.name);
        expect(userModel.findByIdAndUpdate.mock.calls[0][1]).toHaveProperty("password", "HASHED PASSWORD");
        expect(userModel.findByIdAndUpdate.mock.calls[0][1]).toHaveProperty("phone", mockReq.body.phone);
        expect(userModel.findByIdAndUpdate.mock.calls[0][1]).toHaveProperty("address", mockReq.body.address);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", true);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Profile Updated Successfully");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("updatedUser");
    })

    it("Should report an error when an error is received", async () => {
        const req = { body: { ...mockReq.body }, user: { ...mockReq.user } };
        req.body.password = "123456";

        userModel.findById.mockImplementation(() => { throw new Error(); });

        await updateProfileController(req, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Error While Updating Profile");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("error");
    })
})

describe("Get Orders Controller", () => {
    let mockOrderModel = { }
    const mockReq = {
        user: {
            _id: "123"
        }
    }

    let mockRes = {}

    const mockOrders = [ ]

    beforeEach(() => {
        mockOrderModel = {
            find: jest.fn(() => ({
                populate: jest.fn(() => ({
                    populate: jest.fn(() => mockOrders)
                }))
            })),
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn(() => mockRes),
            send: jest.fn()
        }
    })

    afterEach(() => {
        jest.resetAllMocks();
    })

    it("Should return the user's orders", async () => {
        orderModel.find = mockOrderModel.find;

        await getOrdersController(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(mockOrders);
    })

    it("Should report an error when an error is encountered", async () => {
        orderModel.find.mockImplementation(() => { throw new Error(); });

        await getOrdersController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Error While Getting Orders");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("error");
    })
})

describe("Get All Orders Controller", () => {
    let mockOrderModel = { }
    const mockReq = {}

    let mockRes = {}

    const mockOrders = [ ]

    beforeEach(() => {
        mockOrderModel = {
            find: jest.fn(() => ({
                populate: jest.fn(() => ({
                    populate: jest.fn(() => ({
                        sort: jest.fn(() => mockOrders)
                    }))
                }))
            })),
        }

        mockRes = {
            json: jest.fn(),
            status: jest.fn(() => mockRes),
            send: jest.fn()
        }
    })

    afterEach(() => {
        jest.resetAllMocks();
    })

    it("Should return the user's orders", async () => {
        orderModel.find = mockOrderModel.find;

        await getAllOrdersController(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(mockOrders);
    })

    it("Should report an error when an error is encountered", async () => {
        orderModel.find.mockImplementation(() => { throw new Error(); });

        await getAllOrdersController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Error While Getting Orders");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("error");
    })
})

describe("Order Status Controller", () => {
    let mockOrderModel = { }
    const mockReq = {
        params: {
            orderId: "123"
        },
        body: {
            status: "STATUS"
        }
    }

    let mockRes = {}

    beforeEach(() => {
        mockRes = {
            json: jest.fn(),
            status: jest.fn(() => mockRes),
            send: jest.fn()
        }
    })

    afterEach(() => {
        jest.resetAllMocks();
    })

    it("Should return the list of orders after status is updated", async () => {
        const mockOrders = [ { _id: "123", products: [], buyer: {}, status: "NEW STATUS" } ];
        orderModel.findByIdAndUpdate.mockResolvedValue(mockOrders);

        await orderStatusController(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(mockOrders);
    })

    it("Should report an error when an error is encountered", async () => {
        orderModel.findByIdAndUpdate.mockImplementation(() => { throw new Error(); });

        await orderStatusController(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("success", false);
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("message", "Error While Updating Order");
        expect(mockRes.send.mock.calls[0][0]).toHaveProperty("error");
    })
})
