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

  test("initializes with empty cart when no localStorage data exists", () => {
    // Arrange
    window.localStorage.getItem.mockReturnValueOnce(null);

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Assert
    expect(screen.getByTestId("cart").textContent).toBe("[]");
    expect(window.localStorage.getItem).toHaveBeenCalledWith("cart");
  });

  test("initializes with existing valid cart data", () => {
    // Arrange
    const mockCart = [
      { _id: "2", name: "Stored Item", price: 20, quantity: 1 },
    ];
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCart));

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Assert
    expect(screen.getByTestId("cart").textContent).toContain("Stored Item");
  });

  test("handles invalid JSON gracefully and falls back to empty cart", () => {
    // Arrange
    window.localStorage.getItem.mockReturnValueOnce("{invalid json}");
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Assert
    expect(screen.getByTestId("cart").textContent).toBe("[]");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid cart JSON"),
      expect.any(SyntaxError)
    );

    consoleSpy.mockRestore();
  });

  test("updates cart when setCart is called", () => {
    // Arrange
    window.localStorage.getItem.mockReturnValueOnce(null);

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    fireEvent.click(screen.getByText("Add"));

    // Assert
    expect(screen.getByTestId("cart").textContent).toContain("Item");
  });

  test("clears the cart correctly", () => {
    // Arrange
    window.localStorage.getItem.mockReturnValueOnce(null);

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByTestId("cart").textContent).toContain("Item");

    // Assert
    fireEvent.click(screen.getByText("Clear"));
    expect(screen.getByTestId("cart").textContent).toBe("[]");
  });

  test("only reads from localStorage once on mount", () => {
    // Arrange
    const mockCart = [
      { _id: "10", name: "Initial Item", price: 30, quantity: 1 },
    ];
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCart));

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Assert
    expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("cart").textContent).toContain("Initial Item");
  });

  test("handles an empty array stored in localStorage", () => {
    // Arrange
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify([]));

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Assert
    expect(screen.getByTestId("cart").textContent).toBe("[]");
  });

  test("handles large cart with 100 items", () => {
    // Arrange
    const largeCart = Array.from({ length: 100 }, (_, i) => ({
      _id: `${i + 1}`,
      name: `Item ${i + 1}`,
      price: i + 1,
      quantity: 1,
    }));
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(largeCart));

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Assert
    expect(screen.getByTestId("cart").textContent).toContain("Item 100");
  });

  test("filters out invalid items but keeps valid ones and logs warning", () => {
    // Arrange
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

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const cartText = screen.getByTestId("cart").textContent;

    // Assert
    expect(cartText).toContain("Valid Item");
    expect(cartText).not.toContain("oops"); // invalid removed
    expect(cartText).not.toContain("123");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Invalid cart item removed:",
      null
    );

    consoleWarnSpy.mockRestore();
  });

  test("handles completely invalid data and resets to empty", () => {
    // Arrange
    const invalidData = [{ bogusKey: "nope" }, 123, null];
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    window.localStorage.getItem.mockReturnValueOnce(
      JSON.stringify(invalidData)
    );

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Assert
    expect(screen.getByTestId("cart").textContent).toBe("[]");
    expect(consoleWarnSpy).toHaveBeenCalledTimes(4);
    consoleWarnSpy.mockRestore();
  });

  test("logs a warning and resets cart when localStorage contains non-array data", () => {
    //Arrange
    const invalidNonArrayData = { id: "oops", name: "Not in array" };
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    window.localStorage.getItem.mockReturnValueOnce(
      JSON.stringify(invalidNonArrayData)
    );

    // Act
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Cart data is not an array. Resetting to empty."
    );
    expect(screen.getByTestId("cart").textContent).toBe("[]");

    consoleWarnSpy.mockRestore();
  });
});
