import { registerController } from "./authController";

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

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
    }

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
})
