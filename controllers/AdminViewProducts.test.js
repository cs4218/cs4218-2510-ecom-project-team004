// The tests below are generated with help from GenAI
import {
  createProductController,
  deleteProductController,
  updateProductController,
  safeReadPhoto,
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

describe("Product Controller", () => {
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

  test("should return null if photo path is missing in safeReadPhoto", async () => {
    // Arrange
    const photoWithoutPath = { size: 500, type: "image/jpeg" }; // no path provided

    // Act
    const result = safeReadPhoto(photoWithoutPath);

    // Assert
    expect(result).toBeNull();
  });

  // Create Product
  describe("createProductController", () => {
    test("should return error when name is missing", async () => {
      // Arrange
      mockReq.fields = {
        description: "desc",
        price: 10,
        category: "cat",
        quantity: 5,
      };

      // Act
      await createProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Name is required" });
    });

    test("should return error when description is missing", async () => {
      // Arrange
      mockReq.fields = {
        name: "Test",
        price: 10,
        category: "cat",
        quantity: 5,
      };

      // Act
      await createProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Description is required",
      });
    });

    test("should return error when price is missing", async () => {
      // Arrange
      mockReq.fields = {
        name: "Test",
        description: "desc",
        category: "cat",
        quantity: 5,
      };

      // Act
      await createProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Price is required" });
    });

    test("should return error when category is missing", async () => {
      // Arrange
      mockReq.fields = {
        name: "Test",
        description: "desc",
        price: 10,
        quantity: 5,
      };

      // Act
      await createProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Category is required",
      });
    });

    test("should return error when quantity is missing", async () => {
      // Arrange
      mockReq.fields = {
        name: "Test",
        description: "desc",
        price: 10,
        category: "cat",
      };

      // Act
      await createProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Quantity is required",
      });
    });

    test("should return error when photo is too large", async () => {
      // Arrange
      mockReq.fields = {
        name: "Test",
        description: "desc",
        price: 10,
        category: "cat",
        quantity: 5,
      };

      mockReq.files.photo = { size: 2000000 };

      // Act
      await createProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Photo is required and should be less then 1MB",
      });
    });

    test("should handle fs.readFileSync failure", async () => {
      // Arrange
      fs.readFileSync.mockImplementation(() => {
        throw new Error("FS Error");
      });
      const reqWithPhoto = {
        fields: {
          name: "Test Product",
          description: "desc",
          price: 10,
          category: "cat",
          quantity: 5,
        },
        files: {
          photo: { size: 500, path: "bad-path", type: "image/jpeg" },
        },
      };
      productModel.mockImplementation(() => ({
        save: jest.fn(),
        photo: {},
      }));

      // Act
      await createProductController(reqWithPhoto, mockRes);

      // Assert
      // fs error is logged but product still created
      expect(fs.readFileSync).toHaveBeenCalledWith("bad-path");
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test("should create product successfully with photo", async () => {
      // Arrange
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

      // Act
      await createProductController(mockReq, mockRes);

      // Assert
      expect(fs.readFileSync).toHaveBeenCalledWith("test-path");
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product created successfully",
        })
      );
    });

    test("should create product successfully without photo", async () => {
      // Arrange
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

      // Act
      await createProductController(reqWithoutPhoto, mockRes);

      // Assert
      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product created successfully",
          products: expect.any(Object),
        })
      );
    });

    test("should handle error in catch block when create product fails", async () => {
      // Arrange
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

      // Act
      await createProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error in creating product",
        })
      );
    });
  });

  // Update Product
  describe("updateProductController", () => {
    test("should NOT assign products.photo when safeReadPhoto returns null", async () => {
      // Arrange
      const reqWithBadPhoto = {
        params: { pid: "123" },
        fields: {
          name: "Updated Product",
          description: "Updated description",
          price: 150,
          category: "Electronics",
          quantity: 5,
          shipping: false,
        },
        files: {
          // Missing `path` triggers safeReadPhoto to return null
          photo: { size: 500, type: "image/png" },
        },
      };

      const mockProduct = {
        photo: {}, // initial photo is empty
        save: jest.fn(),
      };

      productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);

      // Act
      await updateProductController(reqWithBadPhoto, mockRes);

      // Assert
      expect(mockProduct.photo).toEqual({}); // photo remains unchanged
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product updated successfully",
          products: expect.any(Object),
        })
      );
    });

    test("should update product successfully with photo", async () => {
      // Arrange
      fs.readFileSync.mockReturnValue("mocked-photo-data");
      slugify.mockReturnValue("test-product");
      productModel.findByIdAndUpdate.mockResolvedValue({
        photo: {},
        save: saveMock,
      });

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
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

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product updated successfully",
          products: expect.any(Object),
        })
      );
    });

    test("should update product successfully without photo", async () => {
      // Arrange
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

      // Act
      await updateProductController(reqWithoutPhoto, mockRes);

      // Assert
      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Product updated successfully",
          products: expect.any(Object),
        })
      );
    });

    test("should return error if photo size > 1MB", async () => {
      // Arrange
      mockReq.files.photo.size = 2000000; // exceed 1MB

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Photo is required and should be less then 1MB",
      });
    });

    test("should handle missing name validation error", async () => {
      // Arrange
      mockReq.fields.name = "";

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Name is required",
      });
    });

    test("should handle missing description validation error", async () => {
      // Arrange
      mockReq.fields.description = "";

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Description is required",
      });
    });

    test("should handle missing price validation error", async () => {
      // Arrange
      mockReq.fields.price = "";

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Price is required",
      });
    });

    test("should handle missing category validation error", async () => {
      // Arrange
      mockReq.fields.category = "";

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Category is required",
      });
    });

    test("should handle missing quantity validation error", async () => {
      // Arrange
      mockReq.fields.quantity = "";

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Quantity is required",
      });
    });

    test("should handle error in catch block", async () => {
      // Arrange
      productModel.findByIdAndUpdate.mockRejectedValue(new Error("DB Error"));

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error in updating product",
        })
      );
    });

    test("should return 404 when updating a non-existent product", async () => {
      // Arrange
      productModel.findByIdAndUpdate.mockResolvedValue(null); // simulate not found

      // Act
      await updateProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Product not found",
      });
    });
  });

  // Delete Product
  describe("deleteProductController", () => {
    test("should delete product successfully", async () => {
      // Arrange
      productModel.findByIdAndDelete.mockReturnValue({
        select: jest.fn().mockResolvedValue(true),
      });

      // Act
      await deleteProductController(mockReq, mockRes);

      // Assert
      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "Product deleted successfully",
      });
    });

    test("should handle error in catch block when delete fails", async () => {
      // Arrange
      productModel.findByIdAndDelete.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("DB Error")),
      });

      // Act
      await deleteProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error while deleting product",
        })
      );
    });

    test("should return 404 when deleting a non-existent product", async () => {
      // Arrange
      productModel.findByIdAndDelete.mockReturnValue({
        select: jest.fn().mockResolvedValue(null), // simulate not found
      });

      // Act
      await deleteProductController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Product not found",
      });
    });
  });
});
