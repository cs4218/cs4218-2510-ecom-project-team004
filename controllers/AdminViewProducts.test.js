// The tests below are generated with help from GenAI
import {
  createProductController,
  deleteProductController,
  updateProductController,
} from "../controllers/productController.js";
import productModel from "../models/productModel.js";
import fs from "fs";
import slugify from "slugify";

jest.mock("../models/productModel.js");
jest.mock("fs");
jest.mock("slugify", () => jest.fn(() => "mock-slug"));
jest.mock("braintree", () => {
  return {
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      transaction: {
        sale: jest.fn(),
      },
    })),
    Environment: {
      Sandbox: "Sandbox",
    },
  };
});

describe("Product Controller (Admin) - unit tests", () => {
  let mockReq;
  let mockRes;
  let saveMock;

  beforeEach(() => {
    mockReq = {
      params: { pid: "123" },
      fields: {
        name: "Test Product",
        description: "Test Description",
        price: 100,
        category: "Test Category",
        quantity: 10,
        shipping: 1,
      },
      files: {
        photo: {
          size: 500000,
          path: "/tmp/photo.jpg",
          type: "image/jpeg",
        },
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    saveMock = jest.fn();

    jest.clearAllMocks();
  });

  // Create Product
  describe("createProductController", () => {
    it("should return error when name is missing", async () => {
      mockReq.fields = {
        description: "desc",
        price: 10,
        category: "cat",
        quantity: 5,
      };
      await createProductController(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Name is Required" });
    });

    it("should return error when description is missing", async () => {
      mockReq.fields = {
        name: "Test",
        price: 10,
        category: "cat",
        quantity: 5,
      };
      await createProductController(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Description is Required",
      });
    });

    it("should return error when price is missing", async () => {
      mockReq.fields = {
        name: "Test",
        description: "desc",
        category: "cat",
        quantity: 5,
      };
      await createProductController(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Price is Required" });
    });

    it("should return error when category is missing", async () => {
      mockReq.fields = {
        name: "Test",
        description: "desc",
        price: 10,
        quantity: 5,
      };
      await createProductController(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Category is Required",
      });
    });

    it("should return error when quantity is missing", async () => {
      mockReq.fields = {
        name: "Test",
        description: "desc",
        price: 10,
        category: "cat",
      };
      await createProductController(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Quantity is Required",
      });
    });

    it("should return error when photo is too large", async () => {
      mockReq.fields = {
        name: "Test",
        description: "desc",
        price: 10,
        category: "cat",
        quantity: 5,
      };
      mockReq.files.photo = { size: 2000000 };
      await createProductController(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
    });

    it("should create product successfully with photo", async () => {
      mockReq.fields = {
        name: "Test",
        description: "desc",
        price: 10,
        category: "cat",
        quantity: 5,
      };
      mockReq.files.photo = { size: 500, path: "test-path", type: "image/png" };

      fs.readFileSync.mockReturnValue(Buffer.from("fake-image"));

      const saveMock = jest.fn();
      productModel.mockImplementation(() => ({
        save: saveMock,
        photo: {},
      }));

      await createProductController(mockReq, mockRes);

      expect(fs.readFileSync).toHaveBeenCalledWith("test-path");
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product Created Successfully",
        })
      );
    });

    it("should create product successfully without photo", async () => {
      const reqWithoutPhoto = {
        fields: {
          name: "Test Product",
          description: "Product description",
          price: 100,
          category: "Electronics",
          quantity: 10,
          shipping: true,
        },
        files: {},
      };

      productModel.mockReturnValue({
        save: saveMock,
        photo: {},
      });

      await createProductController(reqWithoutPhoto, mockRes);

      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product Created Successfully",
          products: expect.any(Object),
        })
      );
    });

    it("should handle error in catch block when create product fails", async () => {
      mockReq.fields = {
        name: "Test",
        description: "desc",
        price: 10,
        category: "cat",
        quantity: 5,
      };
      productModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error("DB Error")),
        photo: {},
      }));

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error in crearing product",
        })
      );
    });
  });

  // Update Product
  describe("updateProductController", () => {
    it("should update product successfully with photo", async () => {
      fs.readFileSync.mockReturnValue("mocked-photo-data");
      slugify.mockReturnValue("test-product");

      productModel.findByIdAndUpdate.mockResolvedValue({
        photo: {},
        save: saveMock,
      });

      await updateProductController(mockReq, mockRes);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        expect.objectContaining({
          name: "Test Product",
          slug: "test-product",
        }),
        { new: true }
      );

      expect(fs.readFileSync).toHaveBeenCalledWith("/tmp/photo.jpg");
      expect(saveMock).toHaveBeenCalled();

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product Updated Successfully",
          products: expect.any(Object),
        })
      );
    });

    it("should update product successfully without photo", async () => {
      const reqWithoutPhoto = {
        params: { pid: "123" },
        fields: {
          name: "Updated Product",
          description: "Updated description",
          price: 150,
          category: "Electronics",
          quantity: 5,
          shipping: false,
        },
        files: {},
      };

      productModel.findByIdAndUpdate.mockResolvedValue({
        photo: {},
        save: saveMock,
      });

      await updateProductController(reqWithoutPhoto, mockRes);

      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product Updated Successfully",
          products: expect.any(Object),
        })
      );
    });

    it("should return error if photo size > 1MB", async () => {
      mockReq.files.photo.size = 2000000; // exceed 1MB

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
    });

    it("should handle missing name validation error", async () => {
      mockReq.fields.name = "";

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Name is Required",
      });
    });

    it("should handle missing description validation error", async () => {
      mockReq.fields.description = "";

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Description is Required",
      });
    });

    it("should handle missing price validation error", async () => {
      mockReq.fields.price = "";

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Price is Required",
      });
    });

    it("should handle missing category validation error", async () => {
      mockReq.fields.category = "";

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Category is Required",
      });
    });

    it("should handle missing quantity validation error", async () => {
      mockReq.fields.quantity = "";

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Quantity is Required",
      });
    });

    it("should handle error in catch block", async () => {
      productModel.findByIdAndUpdate.mockRejectedValue(new Error("DB Error"));

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error in Updte product",
        })
      );
    });
  });

  // Delete Product
  describe("deleteProductController", () => {
    it("should delete product successfully", async () => {
      productModel.findByIdAndDelete.mockReturnValue({
        select: jest.fn().mockResolvedValue(true),
      });

      await deleteProductController(mockReq, mockRes);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Deleted successfully",
      });
    });

    it("should handle error in catch block when delete fails", async () => {
      productModel.findByIdAndDelete.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("DB Error")),
      });

      await deleteProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error while deleting product",
        })
      );
    });
  });
});
