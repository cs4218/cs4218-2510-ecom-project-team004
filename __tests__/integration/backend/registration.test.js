import userModel from "../../../models/userModel";
import { registerController } from "../../../controllers/authController";
import { mongoose, mongoServer } from "../../setup.integration.backend";
import request from "supertest";
import app from "../../../server";

// Mock morgan to silence logs
jest.mock("morgan", () => () => (req, res, next) => next());

const testUser = {
  name: "registration tester",
  email: "registration@test.com",
  password: "pw",
  phone: "98765432",
  address: "123 ABC Street",
  answer: "testing",
};

// written with the help of AI
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("Registration", () => {
  beforeEach(async () => {
    // Set up clean state before tests
    await userModel.deleteMany({ email: testUser.email });
  });

  afterEach(async () => {
    // Clear created test user, if any
    await userModel.deleteMany({ email: testUser.email });

    jest.restoreAllMocks();
  });

  describe("controller <-> db, helper", () => {
    test("successful registration", async () => {
      const req = { body: testUser };
      const res = mockResponse();

      await registerController(req, res);

      // Verify user created with hashed password
      const user = await userModel.findOne({ email: testUser.email });
      expect(user).not.toBeNull(); // new user saved
      expect(user.password).not.toBe(testUser.password); // hashed password

      // Verify response - added with the help of AI in reviewing test code and asserting res.send call
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User Register Successfully",
          user: expect.objectContaining({ email: testUser.email }),
        })
      );
    });

    test("duplicate registration", async () => {
      const req = { body: testUser };
      const res = mockResponse();

      // Create user in database before test
      await new userModel(testUser).save();

      await registerController(req, res);

      // Verify only one matching user in database
      const users = await userModel.find({ email: testUser.email });
      expect(users).toHaveLength(1);

      // Verify res
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Already Register please login",
        })
      );
    });

    test("invalid registration with missing password", async () => {
      // Simulate invalid registration with missing info
      const req = { body: { ...testUser, password: "" } };
      const res = mockResponse();

      await registerController(req, res);

      // Verify user not created in database
      const user = await userModel.findOne({ email: testUser.email });
      expect(user).toBeNull();

      // Verify res
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Password is Required",
        })
      );
    });

    test("db unavailability", async () => {
      const logSpy = jest
        .spyOn(global.console, "log")
        .mockImplementation(() => {});
      const req = { body: testUser };
      const res = mockResponse();

      // Simulate database unavailability
      await mongoose.disconnect();

      await registerController(req, res);

      // Verify res
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error in Registration",
        })
      );
      expect(logSpy).toHaveBeenCalledTimes(1);

      // Reinstate connection to database
      await mongoose.connect(mongoServer.getUri());
    });
  });

  describe("api <-> controller", () => {
    test("successful registration", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      // Verify integrated effects
      const user = await userModel.findOne({ email: testUser.email });
      expect(user).not.toBeNull(); // new user saved
      expect(user.password).not.toBe(testUser.password); // hashed password

      // Verify response
      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: true,
          message: "User Register Successfully",
          user: expect.objectContaining({ email: testUser.email }),
        })
      );
    });

    test("duplicate registration", async () => {
      // Create user in database before test
      await new userModel(testUser).save();

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      // Verify res
      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Already Register please login",
        })
      );
    });

    test("invalid registration with missing password", async () => {
      // Simulate invalid registration with missing info
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...testUser, password: "" });

      // Verify res
      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: "Password is Required",
        })
      );
    });

    test("db unavailability", async () => {
      const logSpy = jest
        .spyOn(global.console, "log")
        .mockImplementation(() => {});

      // Simulate database unavailability
      await mongoose.disconnect();

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      // Verify res
      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Error in Registration",
        })
      );
      expect(logSpy).toHaveBeenCalledTimes(1);

      // Reinstate connection to database
      await mongoose.connect(mongoServer.getUri());
    });
  });
});
