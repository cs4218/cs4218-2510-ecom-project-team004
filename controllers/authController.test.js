import { getMockReq, getMockRes } from "@jest-mock/express";
import { forgotPasswordController, loginController, registerController } from "./authController";
import userModel from "../models/userModel";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT, { sign } from "jsonwebtoken";

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
jest.mock('jsonwebtoken');

// Mock mongoose methods in userModel
const mockSave = jest.fn();

jest.mock('../models/userModel', () => {
  const mockUserModel = jest.fn().mockImplementation((userInfo) => ({
    save: mockSave
  }));
  mockUserModel.findOne = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  return mockUserModel;
});

describe('Register Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Incomplete Input', () => {
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
  
  describe('Process Registration', () => {
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
  
  describe('Error Handling', () => {
    it('should send message with 500 status when existing user check throws error', async () => {
      const req = getMockReq({ body: userInfo });
      userModel.findOne.mockRejectedValueOnce('Error in existing user check');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      await registerController(req, res);
      
      expect(userModel.findOne).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error in existing user check');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Error in Registration',
        error: 'Error in existing user check',
      });
    });
  
    it('should send message with 500 status when hashing password throws error', async () => {
      const req = getMockReq({ body: userInfo });
      hashPassword.mockRejectedValueOnce('Error when hashing password');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      await registerController(req, res);
      
      expect(hashPassword).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error when hashing password');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Error in Registration',
        error: 'Error when hashing password',
      });
    });
    
    it('should send message with 500 status when user creation throws error', async () => {
      const req = getMockReq({ body: userInfo });
      mockSave.mockRejectedValueOnce('Error in user creation');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      await registerController(req, res);
      
      expect(mockSave).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error in user creation');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Error in Registration',
        error: 'Error in user creation',
      });
    });
  })

})

describe('Login Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Incomplete Input', () => {
    it('should send message when email is empty', async () => {
      const req = getMockReq({ 
        body: { email: '' } 
      });
  
      await loginController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Invalid email or password' });
    });
  
    it('should send message when password is empty', async () => {
      const req = getMockReq({ 
        body: { email: userInfo.email, password: '' } 
      });
  
      await loginController(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Invalid email or password' });
    });
  
  })
  
  describe('Process Login', () => {
   it('should login user successfully', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          password: userInfo.password
        }
      });
      const user = {
        ...userInfo, 
        _id: 'fakeId',
        password: 'fakeHashedPassword',
        role: 0, 
      }
      userModel.findOne.mockResolvedValueOnce(user);
      comparePassword.mockResolvedValueOnce(true);
      JWT.sign.mockResolvedValueOnce('fakeToken');
  
      await loginController(req, res);
  
      expect(userModel.findOne).toHaveBeenCalledWith({ email: userInfo.email });  // should find user data
      expect(comparePassword).toHaveBeenCalledTimes(1); // should check password match
      expect(comparePassword).toHaveBeenCalledWith(userInfo.password, 'fakeHashedPassword');
      expect(JWT.sign).toHaveBeenCalledTimes(1);  // should sign token
      expect(JWT.sign).toHaveBeenCalledWith({ _id: 'fakeId' }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      expect(res.status).toHaveBeenCalledWith(200); // should send successful login response
      expect(res.send).toHaveBeenCalledWith({ 
        success: true, 
        message: 'login successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        token: 'fakeToken',
       });
    });
  
    it('should send message when email is not registered', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          password: userInfo.password
        }
      });
      userModel.findOne.mockResolvedValueOnce(null);
  
      await loginController(req, res);
  
      expect(userModel.findOne).toHaveBeenCalledWith({ email: userInfo.email });
      expect(res.status).toHaveBeenCalledWith(404); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Email is not registered',
        });
    });
  
    it('should send message when password does not match', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          password: userInfo.password
        }
      });
      userModel.findOne.mockResolvedValueOnce({ password: 'fakeHashedPassword' });
      comparePassword.mockResolvedValueOnce(false);
  
      await loginController(req, res);
  
      expect(userModel.findOne).toHaveBeenCalledWith({ email: userInfo.email });
      expect(comparePassword).toHaveBeenCalledTimes(1);
      expect(comparePassword).toHaveBeenCalledWith(userInfo.password, 'fakeHashedPassword');
      expect(res.status).toHaveBeenCalledWith(401); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Invalid Password',
        });
    });
  
  })
  
  describe('Error Handling', () => {
    it('should send message with 500 status when existing user check throws error', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          password: userInfo.password
        }
      });
      userModel.findOne.mockRejectedValueOnce('Error in finding user');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      await loginController(req, res);
      
      expect(userModel.findOne).toHaveBeenCalledWith({ email: userInfo.email }); 
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error in finding user');
      expect(res.status).toHaveBeenCalledWith(500); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Error in login',
        error: 'Error in finding user',
       });
    });
  
    it('should send message with 500 status when comparePassword throws error', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          password: userInfo.password
        }
      });
      userModel.findOne.mockResolvedValueOnce('fakeUser');
      comparePassword.mockRejectedValueOnce('Error when matching password');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      await loginController(req, res);
      
      expect(comparePassword).toHaveBeenCalledTimes(1); 
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error when matching password');
      expect(res.status).toHaveBeenCalledWith(500); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Error in login',
        error: 'Error when matching password',
       });
    });
  
    it('should send message with 500 status when jwt throws error', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          password: userInfo.password
        }
      });
      userModel.findOne.mockResolvedValueOnce('fakeUser');
      comparePassword.mockResolvedValueOnce(true);
      JWT.sign.mockRejectedValueOnce('Error when signing token');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      await loginController(req, res);
      
      expect(JWT.sign).toHaveBeenCalledTimes(1); 
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error when signing token');
      expect(res.status).toHaveBeenCalledWith(500); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Error in login',
        error: 'Error when signing token',
       });
    });
  
  })
})

describe('Forgot Password Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Incomplete Input', () => {
    it('should send message when email is empty', async () => {
      const req = getMockReq({ 
        body: { email: '' } 
      });

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Email is required' });
    });

    it('should send message when answer is empty', async () => {
      const req = getMockReq({ 
        body: { email: userInfo.email, answer: '' } 
      });

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'answer is required' });
    });

    it('should send message when password is empty', async () => {
      const req = getMockReq({ 
        body: { email: userInfo.email, answer: userInfo.answer, password: '' } 
      });

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'New Password is required' });
    });

  })

  describe('Process Password Reset', () => {
    it('should reset password successfully', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          answer: userInfo.answer,
          newPassword: userInfo.password
        }
      });
      const user = {
        ...userInfo, 
        _id: 'fakeId',
        password: 'fakeHashedPassword',
        role: 0, 
      }
      userModel.findOne.mockResolvedValueOnce(user);
      hashPassword.mockResolvedValueOnce('fakeNewHashedPassword');
      userModel.findByIdAndUpdate.mockResolvedValueOnce({});

      await forgotPasswordController(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: userInfo.email, answer: userInfo.answer });  // should find user data
      expect(hashPassword).toHaveBeenCalledTimes(1); // should hash new password 
      expect(hashPassword).toHaveBeenCalledWith(userInfo.password);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);  // should update user hashed password
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(user._id, { password: 'fakeNewHashedPassword' });
      expect(res.status).toHaveBeenCalledWith(200); // should send successful reset password response
      expect(res.send).toHaveBeenCalledWith({ 
        success: true, 
        message: 'Password Reset Successfully',
      });
    });

    it('should send message when no registered user found', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          answer: userInfo.answer,
          newPassword: userInfo.password
        }
      });
      userModel.findOne.mockResolvedValueOnce(null);

      await forgotPasswordController(req, res);

      expect(userModel.findOne).toHaveBeenCalledTimes(1);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: userInfo.email, answer: userInfo.answer });
      expect(res.status).toHaveBeenCalledWith(404); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Wrong Email Or Answer',
      });
    });

  })

  describe('Error Handling', () => {
    it('should send message on error when finding user', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          answer: userInfo.answer,
          newPassword: userInfo.password
        }
      });
      userModel.findOne.mockRejectedValueOnce('Error when finding user');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      await forgotPasswordController(req, res);
      
      expect(userModel.findOne).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error when finding user');
      expect(res.status).toHaveBeenCalledWith(500); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Something went wrong',
        error: 'Error when finding user',
      });
    });

    it('should send message on error when hashing password', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          answer: userInfo.answer,
          newPassword: userInfo.password
        }
      });
      const user = {
        ...userInfo, 
        _id: 'fakeId',
        password: 'fakeHashedPassword',
        role: 0, 
      }
      userModel.findOne.mockResolvedValueOnce(user);
      hashPassword.mockRejectedValueOnce('Error when hashing password');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      await forgotPasswordController(req, res);
      
      expect(hashPassword).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error when hashing password');
      expect(res.status).toHaveBeenCalledWith(500); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Something went wrong',
        error: 'Error when hashing password',
      });
    });

    it('should send message on error when updating user info', async () => {
      const req = getMockReq({ 
        body: {
          email: userInfo.email,
          answer: userInfo.answer,
          newPassword: userInfo.password
        }
      });
      const user = {
        ...userInfo, 
        _id: 'fakeId',
        password: 'fakeHashedPassword',
        role: 0, 
      }
      userModel.findOne.mockResolvedValueOnce(user);
      hashPassword.mockResolvedValueOnce('fakeNewHashedPassword');
      userModel.findByIdAndUpdate.mockRejectedValueOnce('Error when updating user info');
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      await forgotPasswordController(req, res);
      
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);  // should update user hashed password
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(user._id, { password: 'fakeNewHashedPassword' });
      expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
      expect(logSpy).toHaveBeenCalledWith('Error when updating user info');
      expect(res.status).toHaveBeenCalledWith(500); 
      expect(res.send).toHaveBeenCalledWith({ 
        success: false, 
        message: 'Something went wrong',
        error: 'Error when updating user info',
      });
    });

  })
})