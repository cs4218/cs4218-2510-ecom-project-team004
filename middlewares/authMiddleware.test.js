import { getMockReq, getMockRes } from "@jest-mock/express";
import userModel from "../models/userModel.js";
import { isAdmin, requireSignIn } from "./authMiddleware.js";
import JWT from "jsonwebtoken";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

describe('Require Sign In', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should check signed in status and move to next middleware if successful', async () => {
        const req = getMockReq({ headers: {authorization: 'token'} });
        const { res, next } = getMockRes();
        JWT.verify.mockReturnValueOnce('decoded');

        await requireSignIn(req, res, next);

        expect(JWT.verify).toHaveBeenCalledTimes(1);    // should check if signed in
        expect(JWT.verify).toHaveBeenCalledWith('token', process.env.JWT_SECRET);
        expect(req).toHaveProperty('user');     // should attach decoded user info to req
        expect(next).toHaveBeenCalledTimes(1);  // should move to next middleware
    })

    it('should send unauthorized response if not signed in', async () => {
        const req = getMockReq({ headers: {} });
        const { res, next } = getMockRes();
        JWT.verify.mockImplementation(() => { throw 'Error verifying token' });
        const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});

        await requireSignIn(req, res, next);

        expect(JWT.verify).toHaveBeenCalledTimes(1);   // should check if signed in
        expect(req).not.toHaveProperty('user');        // should not have user info
        expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
        expect(logSpy).toHaveBeenCalledWith('Error verifying token');
        expect(res.status).toHaveBeenCalledTimes(1);  
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(401);  // should send unauthorized response
        expect(res.send).toHaveBeenCalledWith({ 
            success: false, 
            error: 'Error verifying token',
            message: 'Unauthorized Access' 
        });
    })
});

describe('Is Admin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should move to next middleware when user is admin', async () => {
        const req = getMockReq({ user: {_id: 'fakeId'} });
        const { res, next } = getMockRes();
        userModel.findById.mockResolvedValueOnce({ role: 1 });
        
        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledTimes(1);    // should check user
        expect(userModel.findById).toHaveBeenCalledWith('fakeId');
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should show forbidden response when user is not admin', async () => {
        const req = getMockReq({ user: {_id: 'fakeId'} });
        const { res, next } = getMockRes();
        userModel.findById.mockResolvedValueOnce({ role: 0 });
        
        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledTimes(1);    // should check user
        expect(userModel.findById).toHaveBeenCalledWith('fakeId');
        expect(res.status).toHaveBeenCalledTimes(1);  
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(403);  // should send forbidden response
        expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Admin role required for access' });
    });

    it('should show server error response on error', async () => {
        const req = getMockReq({ user: {_id: 'fakeId'} });
        const { res, next } = getMockRes();
        userModel.findById.mockRejectedValueOnce('Error when checking user');
        const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
        
        await isAdmin(req, res, next);

        expect(userModel.findById).toHaveBeenCalledTimes(1);    // should check user
        expect(userModel.findById).toHaveBeenCalledWith('fakeId');
        expect(logSpy).toHaveBeenCalledTimes(1);       // should send error to console
        expect(logSpy).toHaveBeenCalledWith('Error when checking user');
        expect(res.status).toHaveBeenCalledTimes(1);  
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);  // should send unauthorized response
        expect(res.send).toHaveBeenCalledWith({ 
            success: false, 
            error: 'Error when checking user',
            message: 'Error when authorizing user' 
        });
    });
})