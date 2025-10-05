import { forgotPasswordController, loginController, registerController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController } from "./authController";
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT, { sign } from "jsonwebtoken";

jest.mock('../models/userModel', () => {
  const mockUserModel = jest.fn().mockImplementation((userInfo) => ({
    save: mockSave
  }));
  mockUserModel.findById = jest.fn();
  mockUserModel.findOne = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  return mockUserModel;
});

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

    const mockRes = {
        send: jest.fn(),
        status: jest.fn(() => mockRes) // To allow chaining.
    }

    afterEach(() => {
        jest.clearAllMocks();
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

    const mockRes = {
        json: jest.fn(),
        status: jest.fn(() => mockRes),
        send: jest.fn()
    }

    const mockOrders = [ ]

    beforeEach(() => {
        mockOrderModel = {
            find: jest.fn(() => ({
                populate: jest.fn(() => ({
                    populate: jest.fn(() => mockOrders)
                }))
            })),
        }
    })

    afterEach(() => {
        jest.clearAllMocks();
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

    const mockRes = {
        json: jest.fn(),
        status: jest.fn(() => mockRes),
        send: jest.fn()
    }

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

    })

    afterEach(() => {
        jest.clearAllMocks();
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

    const mockRes = {
        json: jest.fn(),
        status: jest.fn(() => mockRes),
        send: jest.fn()
    }

    afterEach(() => {
        jest.clearAllMocks();
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
console.log("RES!");
console.log(res);

// Mock mongoose methods in userModel
const mockSave = jest.fn();

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
