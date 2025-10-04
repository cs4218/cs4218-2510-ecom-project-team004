// /pages/CartPage (Cart Management Feature)
// The tests below are generated with help from GenAI
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CartPage from "../pages/CartPage";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";

let mockDropInInstance = { requestPaymentMethod: jest.fn() };

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("braintree-web-drop-in-react", () => {
  const React = require("react");

  const MockDropIn = ({ onInstance }) => {
    React.useEffect(() => {
      if (mockDropInInstance) {
        onInstance(mockDropInInstance);
      }
    }, [onInstance]);

    return <div data-testid="mock-dropin">Mock DropIn</div>;
  };

  return {
    __esModule: true,
    default: MockDropIn,
  };
});
jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("./../components/Layout", () => ({ children }) => (
  <div>
    <header data-testid="layout-header">Mock Layout Header</header>
    {children}
  </div>
));

describe("CartPage", () => {
  let mockSetCart;
  let mockNavigate;

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockSetCart = jest.fn();
    mockNavigate = jest.fn();
    mockDropInInstance = {
      requestPaymentMethod: jest
        .fn()
        .mockResolvedValue({ nonce: "test-nonce" }),
    };

    useCart.mockReturnValue([
      [
        {
          _id: "1",
          name: "Item A",
          description: "Desc",
          price: 10,
        },
      ],
      mockSetCart,
    ]);

    useAuth.mockReturnValue([
      { token: "test-token", user: { name: "John", address: "123 Main St" } },
      jest.fn(),
    ]);

    useNavigate.mockReturnValue(mockNavigate);

    axios.get.mockResolvedValue({ data: { clientToken: "mock-client-token" } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithCart = async (cartItems) => {
    useCart.mockReturnValue([cartItems, mockSetCart]);
    let result;
    await act(async () => {
      result = render(<CartPage />);
    });
    return result;
  };

  test("renders empty cart message", async () => {
    await renderWithCart([]);
    await waitFor(async () => {
      expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
    });
  });

  test("renders single valid item", async () => {
    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    await waitFor(async () => {
      expect(screen.getByText("Item A")).toBeInTheDocument();
    });

    await waitFor(async () => {
      expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
    });
  });

  test("merges same ID and same details correctly", async () => {
    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    await waitFor(async () => {
      expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    });
  });

  test("handles same ID with different details as conflict", async () => {
    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
      { _id: "1", name: "Item B", price: 20, description: "Other" },
    ]);

    await waitFor(async () => {
      const items = screen.getAllByText(/Quantity: 1/);
      expect(items).toHaveLength(2);
    });
  });

  test("skips invalid cart item", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    await renderWithCart([{ name: "Invalid Item" }]); // Missing _id

    await waitFor(async () => {
      expect(warnSpy).toHaveBeenCalledWith(
        "Invalid cart item detected:",
        expect.any(Object)
      );
    });
  });

  test("remove one instance decreases quantity", async () => {
    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    await waitFor(async () => {
      expect(mockSetCart).toHaveBeenCalledWith([
        { _id: "1", name: "Item A", price: 10, description: "Desc" },
      ]);
    });
  });

  test("handles error when removing cart item", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockSetCart.mockImplementation(() => {
      throw new Error("Test remove error");
    });

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    const removeButton = screen.getByText("Remove");
    fireEvent.click(removeButton);

    await waitFor(async () => {
      expect(errorSpy).toHaveBeenCalledWith(
        "Error removing item:",
        expect.any(Error)
      );
    });

    errorSpy.mockRestore();
  });

  test("handles error when fetching payment token", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("Token fetch failed"));

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        "Error fetching payment token:",
        expect.any(Error)
      );
    });

    logSpy.mockRestore();
  });

  test("calculates total price correctly", async () => {
    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
      { _id: "2", name: "Item B", price: 20, description: "Desc" },
    ]);

    await waitFor(() => {
      expect(screen.getByText("Total: $40.00")).toBeInTheDocument();
    });
  });

  it("should return '$0.00' and log error when total price calculation fails", async () => {
    jest.spyOn(Number.prototype, "toLocaleString").mockImplementation(() => {
      throw new Error("Mock toLocaleString error");
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await renderWithCart([{ _id: "1", price: 10, userQuantity: 2 }]);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error calculating total price:",
        expect.any(Error)
      );
    });

    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();

    consoleSpy.mockRestore();
    Number.prototype.toLocaleString.mockRestore();
  });

  test("handles successful payment flow", async () => {
    mockDropInInstance.requestPaymentMethod.mockResolvedValueOnce({
      nonce: "test-nonce",
    });

    axios.post.mockResolvedValueOnce({ data: { success: true } });

    localStorage.setItem(
      "cart",
      JSON.stringify([{ _id: "1", name: "Item A", price: 10 }])
    );

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    await waitFor(() => {
      expect(screen.getByTestId("mock-dropin")).toBeInTheDocument();
    });

    const button = await screen.findByText(/make payment/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetCart).toHaveBeenCalledWith([]);
    });

    await waitFor(() => {
      expect(localStorage.getItem("cart")).toBeNull();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Payment Completed Successfully "
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    });
  });

  test("handles payment method failure gracefully", async () => {
    const mockError = new Error("Payment failed");

    mockDropInInstance.requestPaymentMethod.mockRejectedValueOnce(mockError);

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    await waitFor(() => {
      expect(screen.getByTestId("mock-dropin")).toBeInTheDocument();
    });

    const button = await screen.findByText(/make payment/i);

    fireEvent.click(button);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("Payment failed:", mockError);
    });

    await waitFor(() => {
      expect(mockSetCart).not.toHaveBeenCalledWith([]);
    });
  });

  test("renders DropIn when clientToken and cart are valid", async () => {
    axios.get.mockResolvedValue({ data: { clientToken: "mock-client-token" } });

    await renderWithCart([{ _id: "1", name: "Item A", price: 10 }]);

    await waitFor(() => {
      expect(screen.getByTestId("mock-dropin")).toBeInTheDocument();
    });
  });

  test("handles payment failure", async () => {
    axios.post.mockRejectedValue(new Error("Payment failed"));

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    const button = await screen.findByText(/make payment/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetCart).not.toHaveBeenCalledWith([]);
    });
  });

  test("shows toast error and does not clear cart or navigate on payment failure", async () => {
    mockDropInInstance.requestPaymentMethod.mockResolvedValueOnce({
      nonce: "fake-nonce",
    });

    axios.post.mockRejectedValueOnce(new Error("Payment API failed"));

    localStorage.setItem(
      "cart",
      JSON.stringify([{ _id: "1", name: "Item A", price: 10 }])
    );

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    const button = await screen.findByText(/Make Payment/i);

    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Payment failed. Please try again or check your details."
      );
    });

    expect(mockSetCart).not.toHaveBeenCalledWith([]);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem("cart")).not.toBeNull();
  });

  test("shows login message when user not authenticated", async () => {
    useAuth.mockReturnValue([{}]); // No token

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    await waitFor(() => {
      expect(
        screen.getByText(/Please login to checkout!/i)
      ).toBeInTheDocument();
    });
  });

  test("displays current address when user has address", async () => {
    useAuth.mockReturnValue([
      { token: "abc", user: { address: "123 Street" } },
      jest.fn(),
    ]);
    await renderWithCart([{ _id: "1", name: "Item A", price: 10 }]);

    expect(screen.getByText("Current Address")).toBeInTheDocument();
    expect(screen.getByText("123 Street")).toBeInTheDocument();
  });

  test("shows update address button when logged in but no address", async () => {
    useAuth.mockReturnValue([{ token: "abc", user: {} }, jest.fn()]);
    await renderWithCart([{ _id: "1", name: "Item A", price: 10 }]);

    const button = screen.getByText(/Update Address/i);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  test("shows login button when not authenticated", async () => {
    useAuth.mockReturnValue([{}, jest.fn()]);
    await renderWithCart([{ _id: "1", name: "Item A", price: 10 }]);

    const button = screen.getByRole("button", {
      name: /Please Login to checkout/i,
    });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/cart" });
  });

  test("renders conflicting items as separate cards with quantity 1 each", async () => {
    const item1 = { _id: "1", name: "Item A", price: 10, description: "Desc" };
    const item2 = { _id: "1", name: "Item B", price: 20, description: "Other" };

    await renderWithCart([item1, item2]);

    await waitFor(() => {
      const quantities = screen.getAllByText(/Quantity: 1/);
      expect(quantities.length).toBe(2);
    });

    const cards = screen
      .getAllByRole("img")
      .map((img) => img.closest(".row.card"));

    expect(cards.length).toBe(2);
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
  });

  test("Make Payment button disabled when instance is null", async () => {
    mockDropInInstance = null;

    axios.get.mockResolvedValueOnce({
      data: { clientToken: "mock-client-token" },
    });

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    await waitFor(() => {
      expect(screen.getByTestId("mock-dropin")).toBeInTheDocument();
    });

    const button = screen.getByText(/Make Payment/i);
    expect(button).toBeDisabled();
  });

  test("Make Payment button becomes disabled while payment is processing (loading)", async () => {
    let resolveRequest;
    mockDropInInstance.requestPaymentMethod = jest.fn().mockImplementation(
      () =>
        new Promise((res) => {
          resolveRequest = res;
        })
    );

    axios.get.mockResolvedValueOnce({
      data: { clientToken: "mock-client-token" },
    });
    axios.post.mockResolvedValueOnce({ data: {} });

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    const button = await screen.findByText(/Make Payment/i);

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    await act(async () => {
      resolveRequest({ nonce: "test-nonce" });
    });

    await waitFor(() => {
      expect(mockSetCart).toHaveBeenCalledWith([]);
    });
  });

  test("Make Payment button disabled when user has no address", async () => {
    useAuth.mockReturnValue([{ token: "abc", user: {} }, jest.fn()]);
    axios.get.mockResolvedValueOnce({
      data: { clientToken: "mock-client-token" },
    });

    await renderWithCart([
      { _id: "1", name: "Item A", price: 10, description: "Desc" },
    ]);

    const button = screen.getByText(/Make Payment/i);
    expect(button).toBeDisabled();
  });

  test("total price returns $0.00 for cart item with invalid price", async () => {
    await renderWithCart([{ _id: "1", name: "Item A", price: undefined }]);

    await waitFor(() => {
      expect(screen.getByText(/Total:\s*\$0\.00/)).toBeInTheDocument();
    });
  });
});
