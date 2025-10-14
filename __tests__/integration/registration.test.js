import userModel from "../../models/userModel";
import { registerController } from "../../controllers/authController";
import { mongoose, mongoServer } from "../setup.integration";

const testUser = {
    name: 'registration tester',
    email: 'registration@test.com',
    password: 'pw',
    phone: '98765432',
    address: '123 ABC Street',
    answer: 'testing',
}

// written with the help of AI
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
}

describe('Registration', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('controller <-> db, helper', () => { 
        test('successful registration', async () => {
            const req = { body: testUser };
            const res = mockResponse();

            await registerController(req,res);

            // Verify integrated effects
            const user = await userModel.findOne({ email: testUser.email });
            expect(user).not.toBeNull();    // new user saved
            expect(user.password).not.toBe(testUser.password);  // hashed password

            // Verify response - added with the help of AI to review test code and verify res.send call
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: true, 
                    message: 'User Register Successfully', 
                    user: expect.objectContaining({ email: testUser.email }),
                })
            );
        })
        
        test('duplicate registration', async () => {
            const req = { body: testUser };
            const res = mockResponse();
            
            // Create user in database before test
            await new userModel(testUser);

            await registerController(req,res);            

            // Verify res
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: 'Already Register please login', 
                })
            );
            // Verify only one matching user in database
            const users = await userModel.find({ email: testUser.email });
            expect(users).toHaveLength(1);
        })

        test('db unavailability', async () => {
            const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
            const req = { body: testUser };
            const res = mockResponse();

            // Simulate database unavailability
            await mongoose.disconnect();

            await registerController(req,res);

            // Verify res
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: 'Error in Registration', 
                })
            );
            expect(logSpy).toHaveBeenCalledTimes(1);

            // Reinstate connection to database
            await mongoose.connect(mongoServer.getUri());
        })
    })

    describe.skip('api <-> controller', () => {        
        test('successful registration', async () => {
            // Verify res
        })

        test('duplicate registration', async () => {
            // Verify res
        })

        test('invalid request', async () => {
            // Verify res
        })
    })
})
