import categoryModel from "./categoryModel";
import mongoose from "mongoose";

describe("categoryModel Component", () => {
    afterAll(async () => {
        await mongoose.disconnect();
    });

    it("requires name", async () => {
        const doc = new categoryModel({ slug: "anything" });
        await expect(doc.validate()).rejects.toThrow(/`name` is required/);
    });

    it("lowercases slug", async () => {
        const doc = new categoryModel({ name: "Books", slug: "My-SLuG" });
        await doc.validate();
        expect(doc.slug).toBe("my-slug");
    });
});