import mongoose from "mongoose";
import connectDB from "./db";

jest.mock("mongoose");

describe('Database', () => {
    let logSpy;
    
    beforeEach(() => {
        jest.clearAllMocks();
        logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
    })

    afterEach(() => {
        jest.restoreAllMocks();
    })

    it('successful connection', async () => {
        mongoose.connect.mockResolvedValueOnce({ connection: { host: "fakeHost" }});

        const conn = await connectDB();

        expect(mongoose.connect).toHaveBeenCalledTimes(1);
        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('fakeHost'));
    })

    it('failed connection', async () => {
        mongoose.connect.mockRejectedValueOnce("error connecting to db");

        const conn = await connectDB();

        expect(mongoose.connect).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('error connecting to db'));
    })
})