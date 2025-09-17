import { getMockReq, getMockRes } from "@jest-mock/express";
import { registerController } from "./authController";
import userModel from "../models/userModel";
import { hashPassword } from "../helpers/authHelper";

// template for req.body
const userInfo = {
  name: 'John Doe',
  email: 'test@example.com',
  password: 'password123',
  phone: '1234567890',
  address: '123 Street',
  answer: 'Football',
}

const { res } = getMockRes();

jest.mock('../helpers/authHelper');

// Mock mongoose methods in userModel
const mockSave = jest.fn();

jest.mock('../models/userModel', () => {
  const mockFindOne = jest.fn();
  const mockUserModel = jest.fn().mockImplementation((userInfo) => ({
    save: mockSave
  }));
  mockUserModel.findOne = mockFindOne;
  return mockUserModel;
});


describe('Register Controller - Incomplete Input', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send message when name is empty', async () => {
    const req = getMockReq({ 
      body: {
        ...userInfo, 
        name: '' 
      } 
    });

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: 'Name is Required' });
  });

  it('should send message when email is empty', async () => {
    const req = getMockReq({ 
      body: {
        ...userInfo, 
        email: '' 
      } 
    });

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: 'Email is Required' });
  });
  
  it('should send message when password is empty', async () => {
    const req = getMockReq({ 
      body: {
        ...userInfo, 
        password: '' 
      } 
    });

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: 'Password is Required' });
  });

  it('should send message when phone no is empty', async () => {
    const req = getMockReq({ 
      body: {
        ...userInfo, 
        phone: '' 
      } 
    });

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: 'Phone no is Required' });
  });

  it('should send message when address is empty', async () => {
    const req = getMockReq({ 
      body: {
        ...userInfo, 
        address: '' 
      } 
    });

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: 'Address is Required' });
  });

  it('should send message when answer is empty', async () => {
    const req = getMockReq({ 
      body: {
        ...userInfo, 
        answer: '' 
      } 
    });

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: 'Answer is Required' });
  });

})

describe('Register Controller - Process Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send message when already registered', async () => {
    const req = getMockReq({ body: userInfo });
    const { email } = userInfo;
    userModel.findOne.mockResolvedValueOnce(userInfo);

    await registerController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email });
    expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Already Register please login' });
  });

  it('should hash password and create user for new registration', async () => {
    const req = getMockReq({ body: userInfo });
    const { email, password } = userInfo;
    userModel.findOne.mockResolvedValueOnce(null);
    hashPassword.mockResolvedValueOnce('fakeHashedPassword');

    await registerController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email });
    expect(hashPassword).toHaveBeenCalledWith(password);
    expect(userModel).toHaveBeenCalledWith({ ...userInfo, password: 'fakeHashedPassword' });
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('should send message with 201 status when successfully registered', async () => {
    const req = getMockReq({ body: userInfo });
    userModel.findOne.mockResolvedValueOnce(null);

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({ success: true, message: 'User Register Successfully' });
  });

})

describe('Register Controller - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send message with 500 status when existing user check throws error', async () => {
    const req = getMockReq({ body: userInfo });
    userModel.findOne.mockRejectedValueOnce();

    await registerController(req, res);

    expect(userModel.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Error in Registration' });
  });

  it('should send message with 500 status when hashing password throws error', async () => {
    const req = getMockReq({ body: userInfo });
    hashPassword.mockRejectedValueOnce();
    
    await registerController(req, res);
    
    expect(hashPassword).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Error in Registration' });
  });
  
  it('should send message with 500 status when user creation throws error', async () => {
    const req = getMockReq({ body: userInfo });
    mockSave.mockRejectedValueOnce();

    await registerController(req, res);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Error in Registration' });
  });
})