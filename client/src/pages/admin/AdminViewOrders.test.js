// The tests below are generated with help from GenAI
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";

jest.mock("axios");

jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "mock-token" }, jest.fn()]),
}));

jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu">Mock AdminMenu</div>
));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>
    <header data-testid="layout-header">Mock Layout Header</header>
    {children}
  </div>
));

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    Link: ({ children, ...props }) => (
      <a {...props} data-testid="mock-link">
        {children}
      </a>
    ),
    NavLink: ({ children, ...props }) => (
      <a {...props} data-testid="mock-navlink">
        {children}
      </a>
    ),
  };
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

describe("AdminOrders Component", () => {
  const mockOrders = [
    {
      _id: "order1",
      status: "Not Process",
      buyer: { name: "Alice" },
      createAt: "2025-09-17T10:00:00Z",
      payment: { success: true },
      products: [
        {
          _id: "prod1",
          name: "Product 1",
          description: "This is product 1 description",
          price: 100,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and displays orders correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    expect(screen.getByTestId("layout-header")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    const quantityCells = await screen.findAllByText("1");
    expect(quantityCells.length).toBeGreaterThan(0);
    expect(quantityCells[1]).toBeInTheDocument();
  });

  it("updates status when dropdown value changes", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    const dropdown = await screen.findByText("Not Process");
    expect(dropdown).toBeInTheDocument();

    fireEvent.mouseDown(dropdown);

    const shippedOption = await screen.findByText("Shipped");
    fireEvent.click(shippedOption);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/auth/order-status/order1",
        { status: "Shipped" }
      );
    });
  });

  it("does not fetch orders if auth token is missing", async () => {
    useAuth.mockReturnValueOnce([{}, jest.fn()]);

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  it("handles error when fetching orders fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    expect(screen.getByTestId("layout-header")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it("handles error when updating status fails", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockRejectedValueOnce(new Error("Update failed"));

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    const dropdown = await screen.findByText("Not Process");

    fireEvent.mouseDown(dropdown);
    fireEvent.click(await screen.findByText("Shipped"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/auth/order-status/order1",
        { status: "Shipped" }
      );
    });
  });

  it("renders 'Failed' when payment is unsuccessful", async () => {
    const failedOrder = {
      ...mockOrders[0],
      payment: { success: false },
    };

    axios.get.mockResolvedValueOnce({ data: [failedOrder] });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });
  });

  it("renders no orders when API returns empty array", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });
  });
});
