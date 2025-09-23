import { updateProfileController, getOrdersController, getAllOrdersController, orderStatusController } from "./authController";
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";
import { hashPassword } from "../helpers/authHelper";

jest.mock("../models/userModel");
jest.mock("../models/orderModel");
jest.mock("jsonwebtoken");

jest.mock("../helpers/authHelper");

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
