import bcrypt from "bcrypt";
import { comparePassword, hashPassword } from "./authHelper";

jest.mock("bcrypt");

describe('Hash Password', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should hash password', async () => {
        const password = 'fakePassword';
        bcrypt.hash.mockResolvedValue('fakeHashedPassword');

        const hashedPassword = await hashPassword(password);

        expect(bcrypt.hash).toHaveBeenCalledTimes(1);   // should call hash function
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(hashedPassword).toBe('fakeHashedPassword');  // should return hashed password
    });

    it('should show error in console log', async () => {
        const logSpy = jest.spyOn(global.console, 'log');
        const password = 'fakePassword';
        bcrypt.hash.mockRejectedValue('Error when hashing password');

        await hashPassword(password);

        expect(bcrypt.hash).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith('Error when hashing password');
    });
});

describe('Compare Password', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should compare password with hashed password and output true if matched', async () => {
        bcrypt.compare.mockResolvedValue(true);

        const match = await comparePassword('password', 'hashedPassword');

        expect(bcrypt.compare).toHaveBeenCalledTimes(1);   // should call bcrypt.compare
        expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');  // should compare with correct arguments
        expect(match).toBe(true);  // should return true if comparison matches
    });

    it('should output false if password not matched', async () => {
        bcrypt.compare.mockResolvedValue(false);

        const match = await comparePassword('password', 'hashedPassword');

        expect(bcrypt.compare).toHaveBeenCalledTimes(1);   // should call bcrypt.compare
        expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');  // should compare with correct arguments
        expect(match).toBe(false);  // should return false if comparison matches
    });
})