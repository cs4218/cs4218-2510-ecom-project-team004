// productControllers.js (Payment Faature Tests)
// The tests below are generated with help from GenAI
import {
  braintreeTokenController,
  brainTreePaymentController,
} from "../controllers/productController";
import orderModel from "../models/orderModel";

jest.mock("braintree", () => {
  const mockGenerate = jest.fn();
  const mockSale = jest.fn();

  return {
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: { generate: mockGenerate },
      transaction: { sale: mockSale },
    })),
    Environment: { Sandbox: "sandbox" },
    __mockGenerate: mockGenerate,
    __mockSale: mockSale,
  };
});

const mockSave = jest.fn().mockResolvedValue({});
jest.mock("../models/orderModel", () => {
  return jest.fn().mockImplementation(() => ({ save: mockSave }));
});

import braintree from "braintree";

describe("Payment Controllers", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = { body: {}, user: { _id: "user123" } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Braintree Token Controller Tests
  test("should return token when clientToken.generate succeeds", async () => {
    // Arrange
    const fakeToken = { clientToken: "abc123" };
    braintree.__mockGenerate.mockImplementation((_, cb) => cb(null, fakeToken));

    // Act
    await braintreeTokenController(mockReq, mockRes);

    // Assert
    expect(braintree.__mockGenerate).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    );
    expect(mockRes.send).toHaveBeenCalledWith(fakeToken);
    expect(mockRes.status).not.toHaveBeenCalledWith(500);
  });

  test("should return 500 when clientToken.generate fails", async () => {
    // Arrange
    const fakeError = new Error("Failed to generate token");
    braintree.__mockGenerate.mockImplementation((_, cb) => cb(fakeError, null));

    // Act
    await braintreeTokenController(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Failed to generate token",
    });
  });

  test("should hit catch block when unexpected error occurs in token controller", async () => {
    // Arrange
    braintree.__mockGenerate.mockImplementation((_, cb) =>
      cb(new Error("Unexpected payment error"), null)
    );
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    await braintreeTokenController(mockReq, mockRes);

    // Assert
    expect(consoleSpy).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Failed to generate token",
    });
  });

  // BrainTree Payment Controller Tests
  test("should return 400 if cart is empty", async () => {
    // Arrange
    mockReq.body = { nonce: "test-nonce", cart: [] };

    // Act
    await brainTreePaymentController(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Cart cannot be empty",
    });
  });

  test("should return 400 if nonce is missing", async () => {
    // Arrange
    mockReq.body = { cart: [{ price: 50 }] };

    // Act
    await brainTreePaymentController(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Payment nonce required",
    });
  });

  test("should return 400 if any price is negative or invalid", async () => {
    // Arrange
    const testCases = [
      {
        cart: [{ price: -5 }, { price: 50 }],
        expected: { error: "Invalid price in cart" },
      },
      {
        cart: [{ price: "invalid" }],
        expected: { error: "Invalid price in cart" },
      },
    ];

    for (const { cart, expected } of testCases) {
      mockReq.body = { nonce: "test-nonce", cart };

      // Act
      await brainTreePaymentController(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith(expected);
    }
  });

  test("should process payment successfully and save order", async () => {
    // Arrange
    mockReq.body = {
      nonce: "test-nonce",
      cart: [{ price: 50 }, { price: 100 }],
    };
    const fakeResult = { success: true, transaction: { id: "txn123" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    // Act
    await brainTreePaymentController(mockReq, mockRes);

    // Assert
    expect(braintree.__mockSale).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: "150.00",
        paymentMethodNonce: "test-nonce",
      }),
      expect.any(Function)
    );
    expect(orderModel).toHaveBeenCalledWith({
      products: mockReq.body.cart,
      payment: fakeResult,
      buyer: mockReq.user._id,
    });
    expect(mockSave).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ ok: true });
  });

  test("should return 500 when transaction fails", async () => {
    // Arrange
    mockReq.body = { nonce: "test-nonce", cart: [{ price: 50 }] };
    const fakeError = new Error("Payment failed");
    braintree.__mockSale.mockImplementation((data, cb) => cb(fakeError, null));

    // Act
    await brainTreePaymentController(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ error: "Payment failed" });
  });

  test("should return 500 when transaction result.success is false", async () => {
    // Arrange
    mockReq.body = { nonce: "test-nonce", cart: [{ price: 50 }] };
    const fakeResult = { success: false, message: "Card declined" };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    // Act
    await brainTreePaymentController(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Transaction failed",
      details: fakeResult,
    });
  });

  test("should return 500 if saving order fails", async () => {
    // Arrange
    mockReq.body = { nonce: "test-nonce", cart: [{ price: 50 }] };
    const fakeResult = { success: true, transaction: { id: "txn123" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    const saveSpy = jest.fn().mockRejectedValue(new Error("DB failure"));
    orderModel.mockImplementation(() => ({ save: saveSpy }));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    await brainTreePaymentController(mockReq, mockRes);

    // Assert
    expect(saveSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Database error while saving order:",
      expect.any(Error)
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Failed to save order",
    });
  });

  test("should return 500 if unexpected error occurs", async () => {
    // Arrange
    mockReq.body = { nonce: "test-nonce", cart: [{ price: 50 }] };
    braintree.__mockSale.mockImplementation(() => {
      throw new Error("Unexpected top-level error");
    });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    await brainTreePaymentController(mockReq, mockRes);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Internal Server Error",
    });
  });

  test("should correctly handle floating point prices", async () => {
    // Arrange
    mockReq.body = {
      nonce: "test-nonce",
      cart: [{ price: 14.99 }, { price: 999.99 }],
    };
    const fakeResult = { success: true, transaction: { id: "txnFloat" } };
    braintree.__mockSale.mockImplementation((data, cb) => cb(null, fakeResult));

    // Act
    await brainTreePaymentController(mockReq, mockRes);

    // Assert
    const passedAmount = braintree.__mockSale.mock.calls[0][0].amount;
    expect(passedAmount).toBe("1014.98");
  });

  test("should handle boundary values for price", async () => {
    // Arrange
    const boundaryPrices = [0, 0.01, 9999999.99];
    for (const price of boundaryPrices) {
      mockReq.body = { nonce: "test-nonce", cart: [{ price }] };
      const fakeResult = { success: true, transaction: { id: "txnBoundary" } };
      braintree.__mockSale.mockImplementation((data, cb) =>
        cb(null, fakeResult)
      );

      // Act
      await brainTreePaymentController(mockReq, mockRes);

      // Assert
      expect(braintree.__mockSale).toHaveBeenCalledWith(
        expect.objectContaining({ amount: price.toFixed(2) }),
        expect.any(Function)
      );
    }
  });
});
