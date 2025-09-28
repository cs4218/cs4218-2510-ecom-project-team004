// context/cart.js (Cart Management Feature)
// The tests below are generated with help from GenAI
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartProvider, useCart } from "../context/cart";

const TestComponent = () => {
  const [cart, setCart] = useCart();
  return (
    <div>
      <span data-testid="cart">{JSON.stringify(cart)}</span>
      <button
        onClick={() =>
          setCart([{ _id: "1", name: "Item", price: 10, quantity: 1 }])
        }
      >
        Add
      </button>
      <button onClick={() => setCart([])}>Clear</button>
    </div>
  );
};

describe("Cart Context", () => {
  beforeEach(() => {
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      };
    })();

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with empty cart when no localStorage data exists", () => {
    window.localStorage.getItem.mockReturnValueOnce(null);
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId("cart").textContent).toBe("[]");
    expect(window.localStorage.getItem).toHaveBeenCalledWith("cart");
  });

  it("initializes with existing valid cart data", () => {
    const mockCart = [
      { _id: "2", name: "Stored Item", price: 20, quantity: 1 },
    ];
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCart));
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId("cart").textContent).toContain("Stored Item");
  });

  it("handles invalid JSON gracefully and falls back to empty cart", () => {
    window.localStorage.getItem.mockReturnValueOnce("{invalid json}");
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId("cart").textContent).toBe("[]");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid cart JSON"),
      expect.any(SyntaxError)
    );
    consoleSpy.mockRestore();
  });

  it("updates cart when setCart is called", () => {
    window.localStorage.getItem.mockReturnValueOnce(null);
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByTestId("cart").textContent).toContain("Item");
  });

  it("clears the cart correctly", () => {
    window.localStorage.getItem.mockReturnValueOnce(null);
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByTestId("cart").textContent).toContain("Item");
    fireEvent.click(screen.getByText("Clear"));
    expect(screen.getByTestId("cart").textContent).toBe("[]");
  });

  it("only reads from localStorage once on mount", () => {
    const mockCart = [
      { _id: "10", name: "Initial Item", price: 30, quantity: 1 },
    ];
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCart));
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("cart").textContent).toContain("Initial Item");
  });

  it("handles an empty array stored in localStorage", () => {
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify([]));
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId("cart").textContent).toBe("[]");
  });

  it("handles large cart with 100 items", () => {
    const largeCart = Array.from({ length: 100 }, (_, i) => ({
      _id: `${i + 1}`,
      name: `Item ${i + 1}`,
      price: i + 1,
      quantity: 1,
    }));
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(largeCart));
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId("cart").textContent).toContain("Item 100");
  });

  it("filters out invalid items but keeps valid ones and logs warning", () => {
    const mixedCart = [
      { _id: "1", name: "Valid Item", price: 10, quantity: 1 }, // valid
      null, // invalid
      { bogusKey: "oops" }, // invalid
      123, // invalid
    ];

    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mixedCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const cartText = screen.getByTestId("cart").textContent;

    expect(cartText).toContain("Valid Item");
    expect(cartText).not.toContain("oops"); // invalid removed
    expect(cartText).not.toContain("123");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Invalid cart item removed:",
      null
    );
    consoleWarnSpy.mockRestore();
  });

  it("handles completely invalid data and resets to empty", () => {
    const invalidData = [{ bogusKey: "nope" }, 123, null];
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    window.localStorage.getItem.mockReturnValueOnce(
      JSON.stringify(invalidData)
    );

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("cart").textContent).toBe("[]");
    expect(consoleWarnSpy).toHaveBeenCalledTimes(4);
    consoleWarnSpy.mockRestore();
  });

  it("logs a warning and resets cart when localStorage contains non-array data", () => {
    const invalidNonArrayData = { id: "oops", name: "Not in array" };
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    window.localStorage.getItem.mockReturnValueOnce(
      JSON.stringify(invalidNonArrayData)
    );

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Cart data is not an array. Resetting to empty."
    );

    expect(screen.getByTestId("cart").textContent).toBe("[]");

    consoleWarnSpy.mockRestore();
  });
});
