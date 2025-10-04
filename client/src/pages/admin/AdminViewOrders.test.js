// /pages/admin/AdminViewOrders.test.js (Admin View Orders Feature)
// The tests below are generated with help from GenAI
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
  success: jest.fn(),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "mock-token" }, jest.fn()]),
}));
jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu">Mock AdminMenu</div>
));
jest.mock("../../components/Layout", () => {
  const PropTypes = require("prop-types");

  const MockLayout = ({ children }) => (
    <div>
      <header data-testid="layout-header">Mock Layout Header</header>
      {children}
    </div>
  );

  MockLayout.propTypes = {
    children: PropTypes.node,
  };

  return MockLayout;
});
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(() => []),
}));
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("AdminOrders", () => {
  const mockOrders = [
    {
      _id: "order1",
      status: "Not Process",
      buyer: { name: "John Doe" },
      createdAt: new Date().toISOString(),
      payment: { success: true },
      products: [
        {
          _id: "prod1",
          name: "Product 1",
          description: "Description of product 1",
          price: 100,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ token: "fake-token" }]);
  });

  const renderComponent = () => render(<AdminOrders />);

  test("renders empty state when there are no orders", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: [] });

    // Act
    renderComponent();

    // Assert
    expect(await screen.findByText(/No orders available/i)).toBeInTheDocument();
  });

  test("fetches and displays orders successfully", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockOrders });

    // Act
    renderComponent();

    // Assert
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("All Orders")).toBeInTheDocument();

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Price: 100")).toBeInTheDocument();

    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  test("handles order fetch failure", async () => {
    // Arrange
    const error = new Error("Network Error");
    axios.get.mockRejectedValueOnce(error);
    const toast = require("react-hot-toast");
    toast.error = jest.fn();

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Act
    renderComponent();

    // Assert
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to fetch orders");
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    consoleSpy.mockRestore();
  });

  test("updates order status successfully", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockResolvedValueOnce({ data: { success: true } });
    const toast = require("react-hot-toast");
    toast.success = jest.fn();

    renderComponent();

    // Act
    const dropdown = await screen.findByText("Not Process");
    fireEvent.mouseDown(dropdown);

    const shippedOption = await screen.findByText("Shipped");
    fireEvent.click(shippedOption);

    // Assert
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/auth/order-status/order1",
        {
          status: "Shipped",
        }
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Order status updated");
    });
  });

  test("handles failure when updating order status", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockRejectedValueOnce(new Error("Update Failed"));
    const toast = require("react-hot-toast");
    toast.error = jest.fn();

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderComponent();

    // Act
    const dropdown = await screen.findByText("Not Process");
    fireEvent.mouseDown(dropdown);

    const cancelledOption = await screen.findByText("Cancelled");
    fireEvent.click(cancelledOption);

    // Assert
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/auth/order-status/order1",
        { status: "Cancelled" }
      );
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update order status");
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  test("does NOT fetch orders when auth token is missing", async () => {
    // Arrange
    useAuth.mockReturnValue([{}]); // No token
    const getSpy = jest.spyOn(axios, "get");

    // Act
    renderComponent();

    // Assert
    await waitFor(() => {
      expect(getSpy).not.toHaveBeenCalled();
    });
  });

  test("renders 'Failed' when payment.success is false", async () => {
    // Arrange
    const failedOrder = {
      ...mockOrders[0],
      payment: { success: false },
    };
    axios.get.mockResolvedValueOnce({ data: [failedOrder] });

    // Act
    renderComponent();

    // Assert
    expect(await screen.findByText("Failed")).toBeInTheDocument();
  });

  test("does NOT update status when orderId does not match", async () => {
    // Arrange
    const mockOrders = [
      {
        _id: "order1",
        status: "Not Process",
        buyer: { name: "John Doe" },
        createdAt: new Date().toISOString(),
        payment: { success: true },
        products: [],
      },
      {
        _id: "order2",
        status: "Processing",
        buyer: { name: "Jane Doe" },
        createdAt: new Date().toISOString(),
        payment: { success: false },
        products: [],
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrders });
    render(<AdminOrders />);

    // Wait for initial orders to render
    await screen.findByText("John Doe");
    await screen.findByText("Jane Doe");

    // Act
    // Open dropdown for order1
    const dropdown = await screen.findByText("Not Process");
    fireEvent.mouseDown(dropdown);
    const shippedOption = await screen.findByText("Shipped");
    fireEvent.click(shippedOption);

    // Simulate API success for updating order1
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    // Assert
    // Make sure order2's status remains unchanged
    await waitFor(() => {
      const processingElements = screen.getAllByText("Processing");
      expect(processingElements.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      const shippedElements = screen.getAllByText("Shipped");
      expect(shippedElements.length).toBeGreaterThan(0);
    });
  });
});
