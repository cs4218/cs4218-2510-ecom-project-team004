import { forgotPasswordController, loginController } from "../../controllers/authController";
import { hashPassword } from "../../helpers/authHelper";
import userModel from "../../models/userModel";
import { mongoose, mongoServer } from "../setup.integration";
import request from "supertest";
import app from "../../server";
import dotenv from "dotenv";

dotenv.config();

const testUser = {
    name: 'tester',
    email: 'tester@test.com',
    password: 'pw',
    phone: '98765432',
    address: '123 ABC Street',
    answer: 'testing',
}

// Mock morgan to silence logs
jest.mock('morgan', () => () => (req, res, next) => next());

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
}

describe('Login', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('controller <-> db, helper', () => {
        test('successful login', async () => {
            // Set up user in database before test
            const hashedPassword = await hashPassword(testUser.password);
            const user = await new userModel({ ...testUser, password: hashedPassword}).save();

            const req = { body: { email: testUser.email, password: testUser.password } };
            const res = mockResponse();

            await loginController(req,res);

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: true, 
                    message: 'login successfully', 
                    user: expect.objectContaining({ _id: user._id }),
                    token: expect.any(String),
                })
            );

            // Clean up 
            await userModel.deleteOne({ _id: user._id });
        })

        test('failed login with non-registered email', async () => {
            const req = { body: { email: testUser.email, password: testUser.password } };
            const res = mockResponse();

            await loginController(req,res);

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: 'Invalid email or password', 
                })
            );
        })

        test('failed login with wrong password', async () => {
            // Set up user in database before test
            const hashedPassword = await hashPassword(testUser.password);
            const user = await new userModel({ ...testUser, password: hashedPassword}).save();
            const req = { body: { email: testUser.email, password: 'wrong pw' } };
            const res = mockResponse();

            await loginController(req,res);

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: 'Invalid email or password', 
                })
            );

            // Clean up 
            await userModel.deleteOne({ _id: user._id });
        })

        test('missing info for login', async () => {
            const req = { body: { email: testUser.email, password: '' } };
            const res = mockResponse();

            await loginController(req,res);

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: 'Email and password are required', 
                })
            );
        })

        test('db unavailability', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
            const req = { body: { email: testUser.email, password: testUser.password } };
            const res = mockResponse();

            // Simulate database unavailability
            await mongoose.disconnect();

            await loginController(req,res);

            // Verify res
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: 'Error in login', 
                })
            );
            expect(logSpy).toHaveBeenCalledTimes(1);

            // Reinstate connection to database
            await mongoose.connect(mongoServer.getUri());
        })
    })

    describe('api <-> controller', () => {
        test('successful login', async () => {
            // Set up user in database before test
            const { email, password } = testUser;
            const hashedPassword = await hashPassword(password);
            const user = await new userModel({ ...testUser, password: hashedPassword}).save();

            const res = await request(app).post("/api/v1/auth/login").send({ email, password });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ 
                success: true, 
                message: 'login successfully', 
                user: { _id: user._id.toString() },
                token: expect.any(String),
            });

            // Clean up 
            await userModel.deleteOne({ _id: user._id });
        })

        test('failed login with non-registered email', async () => {
            const { email, password } = testUser;

            const res = await request(app).post("/api/v1/auth/login").send({ email, password });

            expect(res.status).toBe(401);
            expect(res.body).toMatchObject({ 
                success: false, 
                message: 'Invalid email or password', 
            });
        })

        test('failed login with wrong password', async () => {
            // Set up user in database before test
            const { email, password } = testUser;
            const hashedPassword = await hashPassword(password);
            const user = await new userModel({ ...testUser, password: hashedPassword}).save();

            const res = await request(app).post("/api/v1/auth/login").send({ email, password: 'wrong pw' });

            expect(res.status).toBe(401);
            expect(res.body).toMatchObject({ 
                success: false, 
                message: 'Invalid email or password', 
            });

            // Clean up 
            await userModel.deleteOne({ _id: user._id });
        })

        test('missing info for login', async () => {
            const { email } = testUser;

            const res = await request(app).post("/api/v1/auth/login").send({ email });

            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({ 
                success: false, 
                message: 'Email and password are required', 
            });
        })

        test('db unavailability', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
            const { email, password } = testUser;

            // Simulate database unavailability
            await mongoose.disconnect();
            
            const res = await request(app).post("/api/v1/auth/login").send({ email, password });

            // Verify res
            expect(res.status).toBe(500);
            expect(res.body).toMatchObject({ 
                success: false, 
                message: 'Error in login', 
            });
            expect(logSpy).toHaveBeenCalledTimes(1);

            // Reinstate connection to database
            await mongoose.connect(mongoServer.getUri());
        })
    })
})

describe('Forgot Password', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('controller <-> db, helper', () => {
        test('successful password reset', async () => {
            // Set up user in database before test
            const user = await new userModel(testUser).save();

            const { email, answer } = testUser
            const req = { body: { email, answer, newPassword: 'new password' } };
            const res = mockResponse();

            await forgotPasswordController(req,res);

            // Verify new password is hashed and saved in database
            const foundUser = await userModel.findById(user._id);
            expect(foundUser.password).not.toBe(req.body.newPassword);

            // Verify response
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: true, 
                    message: 'Password Reset Successfully',
                })
            );

            // Clean up 
            await userModel.deleteOne({ _id: user._id });
        })

        test('fail user verification', async () => {
            // Set up user in database before test
            const user = await new userModel(testUser).save();

            const { email } = testUser
            const req = { body: { email, answer: 'wrong answer', newPassword: 'new password' } };
            const res = mockResponse();

            await forgotPasswordController(req,res);

            // Verify response
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: 'Wrong Email Or Answer',
                })
            );

            // Clean up 
            await userModel.deleteOne({ _id: user._id });
        })

        test('missing info for password reset', async () => {
            const { email, answer } = testUser
            const req = { body: { email, answer, newPassword: '' } };
            const res = mockResponse();

            await forgotPasswordController(req,res);

            // Verify response
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    message: 'New Password is required',
                })
            );
        })

        test('db unavailability', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
            const { email, answer } = testUser
            const req = { body: { email, answer, newPassword: 'new password' } };
            const res = mockResponse();

            // Simulate database unavailability
            await mongoose.disconnect();

            await forgotPasswordController(req,res);

            // Verify res
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: 'Something went wrong', 
                })
            );
            expect(logSpy).toHaveBeenCalledTimes(1);

            // Reinstate connection to database
            await mongoose.connect(mongoServer.getUri());
        })
    })

    describe('api <-> controller', () => {
        test('successful password reset', async () => {
            // Set up user in database before test
            const user = await new userModel(testUser).save();
            
            const { email, answer } = testUser
            
            const res = await request(app)
                .post("/api/v1/auth/forgot-password")
                .send({ email, answer, newPassword: 'new password' });

            // Verify new password is hashed and saved in database
            const foundUser = await userModel.findById(user._id);
            expect(foundUser.password).not.toBe('new password');

            // Verify response
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ 
                success: true, 
                message: 'Password Reset Successfully',
            });

            // Clean up 
            await userModel.deleteOne({ _id: user._id });
        })

        test('fail user verification', async () => {
            // Set up user in database before test
            const user = await new userModel(testUser).save();

            const { email } = testUser
            
            const res = await request(app)
                .post("/api/v1/auth/forgot-password")
                .send({ email, answer: 'wrong answer', newPassword: 'new password' });

            // Verify response
            expect(res.status).toBe(404);
            expect(res.body).toMatchObject({ 
                success: false, 
                message: 'Wrong Email Or Answer',
            });

            // Clean up 
            await userModel.deleteOne({ _id: user._id });
        })

        test('missing info for password reset', async () => {
            const { email, answer } = testUser
            
            const res = await request(app)
                .post("/api/v1/auth/forgot-password")
                .send({ email, answer, newPassword: '' });

            // Verify response
            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({ 
                message: 'New Password is required',
            })
        })

        test('db unavailability', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
            const { email, answer } = testUser

            // Simulate database unavailability
            await mongoose.disconnect();

            const res = await request(app)
                .post("/api/v1/auth/forgot-password")
                .send({ email, answer, newPassword: 'new password' });

            // Verify res
            expect(res.status).toBe(500);
            expect(res.body).toMatchObject({ 
                success: false, 
                message: 'Something went wrong', 
            });
            expect(logSpy).toHaveBeenCalledTimes(1);

            // Reinstate connection to database
            await mongoose.connect(mongoServer.getUri());
        })
    })
})