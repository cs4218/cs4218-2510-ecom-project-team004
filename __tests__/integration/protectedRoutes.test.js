import request from "supertest";
import app from "../../server";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import userModel from "../../models/userModel";
import { isAdmin } from "../../middlewares/authMiddleware";
import { mongoose, mongoServer } from "../setup.integration";

dotenv.config();

// Mock morgan to silence logs
jest.mock('morgan', () => () => (req, res, next) => next());

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
}

const testUser = {
    name: 'tester',
    email: 'tester@test.com',
    password: 'pw',
    phone: '98765432',
    address: '123 ABC Street',
    answer: 'testing',
}

// api <-> middleware
describe('Protected User Routes', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    test('user is signed in', async () => {
        // Set up user and token
        const user = await new userModel(testUser).save();
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        
        const res = await request(app)
            .get("/api/v1/auth/user-auth")
            .set('Authorization', token)

        // Verify res
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ ok: true });
        
        // Clean up
        await userModel.deleteOne({ _id: user._id });
    })

    test('not signed in', async () => {
        const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});

        const res = await request(app)
            .get("/api/v1/auth/user-auth");

        // Verify res
        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({ 
            success: false,
            error: expect.anything(),
            message: 'Unauthorized Access',
        });  
    })
})

describe('Protected Admin Routes', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    describe('middleware (isAdmin) <-> database', () => {
        test('user is signed in as admin', async () => {
            // Set up admin user and token
            const user = await new userModel({ ...testUser, role: 1 }).save();
            const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            // Mock req, res, next
            const req = { user: JWT.verify(token, process.env.JWT_SECRET) };
            const res = mockResponse();
            const next = jest.fn();

            await isAdmin(req, res, next);

            // Verify outcome
            expect(next).toHaveBeenCalledTimes(1);
            
            // Clean up
            await userModel.deleteOne({ _id: user._id });
        })

        test('user is signed in as non-admin', async () => {
            // Set up user and token
            const user = await new userModel({ ...testUser }).save();
            const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            // Mock req, res, next
            const req = { user: JWT.verify(token, process.env.JWT_SECRET) };
            const res = mockResponse();
            const next = jest.fn();

            await isAdmin(req, res, next);

            // Verify outcome
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Admin role required for access",
                })
            );
            
            // Clean up
            await userModel.deleteOne({ _id: user._id });
        })

        test('user is not signed in', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
            
            // Mock req, res, next
            const req = {};
            const res = mockResponse();
            const next = jest.fn();

            await isAdmin(req, res, next);

            // Verify outcome
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Error when authorizing user",
                    error: expect.anything(),
                })
            );
            expect(logSpy).toHaveBeenCalledTimes(1);
        })

        test('database unavailability', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
            
            // Set up admin user and token
            const user = await new userModel({ ...testUser, role: 1 }).save();
            const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            // Mock req, res, next
            const req = { user: JWT.verify(token, process.env.JWT_SECRET) };
            const res = mockResponse();
            const next = jest.fn();

            // Simulate database unavailability
            await mongoose.disconnect();

            await isAdmin(req, res, next);

            // Verify outcome
            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Error when authorizing user",
                    error: expect.anything(),
                })
            );
            expect(logSpy).toHaveBeenCalledTimes(1);

            // Reinstate connection to database
            await mongoose.connect(mongoServer.getUri());
            // Clean up
            await userModel.deleteOne({ _id: user._id });
        })
    })

    describe('api <-> middlewares (requireSignIn and isAdmin)', () => {
        test('user is signed in as admin', async () => {
            // Set up admin user and token
            const user = await new userModel({ ...testUser, role: 1 }).save();
            const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
            const res = await request(app)
                .get("/api/v1/auth/admin-auth")
                .set('Authorization', token);
    
            // Verify outcome
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ ok: true });
            
            // Clean up
            await userModel.deleteOne({ _id: user._id });
        })
    
        test('user is signed in as non-admin', async () => {
            // Set up non-admin user and token
            const user = await new userModel(testUser).save();
            const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
            const res = await request(app)
                .get("/api/v1/auth/admin-auth")
                .set('Authorization', token);
    
            // Verify outcome
            expect(res.status).toBe(403);
            expect(res.body).toMatchObject({ 
                success: false,
                message: 'Admin role required for access',
            });
            
            // Clean up
            await userModel.deleteOne({ _id: user._id });
        })
    
        test('user is not signed in', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});

            const res = await request(app)
                .get("/api/v1/auth/admin-auth")
    
            // Verify outcome
            expect(res.status).toBe(401);
            expect(res.body).toMatchObject({ 
                success: false,
                message: 'Unauthorized Access',
                error: expect.anything()
            });  
            expect(logSpy).toHaveBeenCalledTimes(1);
        })
    
        test('database unavailability', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
            
            // Set up admin user and token
            const user = await new userModel({ ...testUser, role: 1 }).save();
            const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
            // Simulate database unavailability
            await mongoose.disconnect();

            const res = await request(app)
                .get("/api/v1/auth/admin-auth")
                .set('Authorization', token);
    
            // Verify outcome
            expect(res.status).toBe(500);
            expect(res.body).toMatchObject({ 
                success: false,
                message: 'Error when authorizing user',
                error: expect.anything()
            });  
            expect(logSpy).toHaveBeenCalledTimes(1);

            // Reinstate connection to database
            await mongoose.connect(mongoServer.getUri());
            // Clean up
            await userModel.deleteOne({ _id: user._id });
        })
    })
})