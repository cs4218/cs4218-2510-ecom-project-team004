/**
 * Cart and Checkout Integration
 * The tests below are generated with help of GenAI.
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  act,
} from "@testing-library/react";
import { RouterProvider, createMemoryRouter, Outlet } from "react-router-dom";
import axios from "axios";

// Polyfill fetch/Request/Response/Headers for router navigation in tests
import "whatwg-fetch";
if (!globalThis.Request || !globalThis.Response || !globalThis.Headers) {
  // whatwg-fetch attaches these globals on import; this is just a safety check
  // eslint-disable-next-line no-undef
  globalThis.Request = globalThis.Request || Request;
  // eslint-disable-next-line no-undef
  globalThis.Response = globalThis.Response || Response;
  // eslint-disable-next-line no-undef
  globalThis.Headers = globalThis.Headers || Headers;
}

// matchMedia polyfill
if (globalThis.window !== undefined && !globalThis.window.matchMedia) {
  globalThis.window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
}

// Mock localStorage
let store = {};
globalThis.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
};

// 1) Axios mocks
jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({ data: { clientToken: "fake-token" } }),
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

// 2) toast mock
jest.mock("react-hot-toast", () => {
  const toast = Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  });
  return { __esModule: true, default: toast, Toaster: () => null };
});

// 3) Braintree DropIn mock
jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: (props) => {
    const React = require("react");
    React.useEffect(() => {
      if (props.onInstance) {
        props.onInstance({
          requestPaymentMethod: jest
            .fn()
            .mockResolvedValue({ nonce: "fake-nonce" }),
        });
      }
    }, []);
    return <div data-testid="dropin-mock" />;
  },
}));

// 4) Spy navigate
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  const navigateMock = jest.fn();
  globalThis.__navMock = navigateMock;
  return { ...actual, useNavigate: () => navigateMock };
});

// 5) App context mocks
jest.mock("../../../client/src/context/auth", () => {
  const React = require("react");
  const Ctx = React.createContext([{ token: null, user: null }, () => {}]);

  const useAuth = () => React.useContext(Ctx);

  const AuthProvider = ({ children }) => {
    const [auth, setAuth] = React.useState(
      globalThis.__authMock ?? { token: null, user: null }
    );
    // Optional: keep initial render in sync if tests set __authMock before render
    React.useEffect(() => {
      // no-op; tests can still set __authMock before render
    }, []);
    return <Ctx.Provider value={[auth, setAuth]}>{children}</Ctx.Provider>;
  };

  return { useAuth, AuthProvider };
});

jest.mock("../../../client/src/context/search", () => {
  const React = require("react");
  const Ctx = React.createContext([{ keyword: "" }, jest.fn()]);
  const SearchProvider = ({ children }) => (
    <Ctx.Provider value={[{ keyword: "" }, jest.fn()]}>{children}</Ctx.Provider>
  );
  return { useSearch: () => React.useContext(Ctx), SearchProvider };
});

jest.mock("../../../client/src/hooks/useCategory", () => ({
  __esModule: true,
  default: () => [],
}));

// Imports (after mocks)
const CartPage = require("../../../client/src/pages/CartPage").default;
const { CartProvider, useCart } = require("../../../client/src/context/cart");
const { SearchProvider } = require("../../../client/src/context/search");
const { AuthProvider } = require("../../../client/src/context/auth");
const Orders = require("../../../client/src/pages/user/Orders").default;

// Silence router warnings
let originalWarn;
beforeAll(() => {
  originalWarn = console.warn;
  jest.spyOn(console, "warn").mockImplementation((...args) => {
    const msg = String(args[0] ?? "");
    if (msg.includes("React Router Future Flag Warning")) return;
    return originalWarn(...args);
  });
});
afterAll(() => {
  console.warn.mockRestore();
});

// Helpers
const activeCartKey = () => {
  const userId = globalThis.__authMock?.user?._id;
  return userId ? `cart:${userId}` : "cart:guest";
};

const AddToCartButton = ({ item }) => {
  const [, setCart] = useCart();
  return (
    <button onClick={() => setCart((prev) => [...prev, { ...item }])}>
      ADD TO CART
    </button>
  );
};

const LoginAs = ({ user, token = "tok", label = "LOGIN" }) => {
  const [, setAuth] = require("../../../client/src/context/auth").useAuth();
  return (
    <button
      onClick={() => {
        setAuth({ token, user }); // update context (triggers re-render)
        globalThis.__authMock = { token, user }; // keep helper funcs in sync
      }}
      data-testid={`login-${user?._id || "guest"}`}
    >
      {label}
    </button>
  );
};

const renderWithProviders = (ui) => {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <SearchProvider>
            <AuthProvider>
              <CartProvider>{ui}</CartProvider>
            </AuthProvider>
          </SearchProvider>
        ),
      },
    ],
    {
      initialEntries: ["/"],
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );
  return render(<RouterProvider router={router} />);
};

// Helper to render CartPage at "/" and Orders at "/dashboard/user/orders"
const renderCartAndOrdersApp = () => {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <SearchProvider>
            <AuthProvider>
              <CartProvider>
                <div data-testid="app-root">
                  <Outlet />
                </div>
              </CartProvider>
            </AuthProvider>
          </SearchProvider>
        ),
        children: [
          { path: "/", element: <CartPage /> },
          { path: "/dashboard/user/orders", element: <Orders /> },
        ],
      },
    ],
    {
      initialEntries: ["/"],
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );
  return { ...render(<RouterProvider router={router} />), router };
};

// Tests
describe("Cart and Checkout Integration", () => {
  const sampleProduct = {
    _id: "prod1",
    name: "Sample Product",
    price: 100,
    quantity: 1,
  };
  const sampleProduct2 = {
    _id: "prod2",
    name: "Second Product",
    price: 25.5,
    quantity: 1,
  };

  beforeEach(() => {
    localStorage.clear();
    axios.get.mockClear();
    axios.post.mockClear();
    globalThis.__authMock = { token: null, user: null };
    if (globalThis.__navMock) globalThis.__navMock.mockReset();
  });

  test("guest cart merges into user cart on login and clears guest storage", async () => {
    const guestItem = { _id: "g1", name: "G1", price: 10, quantity: 1 };
    renderWithProviders(
      <>
        <AddToCartButton item={guestItem} />
        <AddToCartButton item={guestItem} />
        <LoginAs user={{ _id: "u1", name: "User1" }} label="LOGIN-AS-U1" />
        <CartPage />
      </>
    );

    // Start as guest, add two items
    expect(activeCartKey()).toBe("cart:guest");
    fireEvent.click(screen.getAllByText(/ADD TO CART/i)[0]);
    fireEvent.click(screen.getAllByText(/ADD TO CART/i)[1]);

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("cart:guest"))).toHaveLength(2)
    );

    // Login as user u1 (merge should happen)
    fireEvent.click(screen.getByTestId("login-u1"));

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("cart:guest")) || []).toHaveLength(
        0
      )
    );
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("cart:u1"))).toHaveLength(2)
    );

    // CartPage UI shows merged quantity for same _id
    await waitFor(() =>
      expect(screen.getByText(/Quantity:\s*2/i)).toBeInTheDocument()
    );
  });

  test("authenticated checkout posts to backend and clears cart + navigates", async () => {
    const user = { _id: "u2", name: "Tester", address: "123 Street" };
    globalThis.__authMock = { token: "tok", user };
    localStorage.setItem(
      `cart:${user._id}`,
      JSON.stringify([sampleProduct, sampleProduct2])
    );

    renderWithProviders(<CartPage />);

    // Token fetch and DropIn render
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token")
    );
    await screen.findByTestId("dropin-mock");

    // Button enabled with address
    const payBtn = await screen.findByRole("button", { name: /make payment/i });
    expect(payBtn).toBeEnabled();

    // Pay
    fireEvent.click(payBtn);

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        expect.objectContaining({
          nonce: "fake-nonce",
          cart: expect.any(Array),
        })
      )
    );

    // Cart cleared at the active per-user key
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem(`cart:${user._id}`)) || []
      ).toHaveLength(0)
    );
    expect(globalThis.__navMock).toHaveBeenCalledWith("/dashboard/user/orders");
  });

  test("payment failure shows error and does not clear cart or navigate", async () => {
    const user = { _id: "u3", name: "Tester", address: "123 Street" };
    globalThis.__authMock = { token: "tok", user };
    axios.post.mockRejectedValueOnce(new Error("Payment API failed"));
    localStorage.setItem(`cart:${user._id}`, JSON.stringify([sampleProduct]));

    renderWithProviders(<CartPage />);

    await screen.findByTestId("dropin-mock");
    const payBtn = await screen.findByRole("button", { name: /make payment/i });
    expect(payBtn).toBeEnabled();

    fireEvent.click(payBtn);

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        expect.any(Object)
      )
    );

    // Cart still intact, no navigation
    expect(
      JSON.parse(localStorage.getItem(`cart:${user._id}`)) || []
    ).toHaveLength(1);
    expect(globalThis.__navMock).not.toHaveBeenCalled();
  });

  test("unauthenticated: DropIn not rendered; login CTA works", async () => {
    renderWithProviders(<CartPage />);
    expect(screen.queryByTestId("dropin-mock")).toBeNull();

    const btn = screen.getByRole("button", {
      name: /please login to checkout/i,
    });
    fireEvent.click(btn);
    expect(globalThis.__navMock).toHaveBeenCalledWith("/login", {
      state: "/cart",
    });
  });

  test("authenticated without address: DropIn renders but Make Payment is disabled", async () => {
    const user = { _id: "u4", name: "NoAddr" }; // no address
    globalThis.__authMock = { token: "tok", user };
    localStorage.setItem(
      `cart:${user._id}`,
      JSON.stringify([{ _id: "p1", name: "P1", price: 10, quantity: 1 }])
    );

    renderWithProviders(<CartPage />);

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token")
    );
    await screen.findByTestId("dropin-mock");
    const payBtn = await screen.findByRole("button", { name: /make payment/i });
    expect(payBtn).toBeDisabled();
  });

  test("removing one item reduces merged quantity from 2 to 1", async () => {
    const p = { _id: "dup", name: "Dup", price: 5, quantity: 1 };
    localStorage.setItem(activeCartKey(), JSON.stringify([p, p]));
    renderWithProviders(<CartPage />);

    await waitFor(() =>
      expect(screen.getByText(/Quantity:\s*2/i)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() =>
      expect(screen.getByText(/Quantity:\s*1/i)).toBeInTheDocument()
    );
    expect(JSON.parse(localStorage.getItem(activeCartKey()))).toHaveLength(1);
  });

  test("cart context discards invalid items when loading from storage", async () => {
    // invalid item (missing numeric price or quantity)
    localStorage.setItem(
      activeCartKey(),
      JSON.stringify([{ _id: "x", name: "X", price: "NaN" }])
    );
    renderWithProviders(<CartPage />);

    await waitFor(() =>
      expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument()
    );
    expect(localStorage.getItem(activeCartKey())).toBe(JSON.stringify([]));
  });

  test("orders page shows per-line quantities matching merged cart after successful checkout", async () => {
    // Logged-in user with address so Make Payment is enabled
    const user = { _id: "u-qc", name: "Quant User", address: "123 Main" };
    globalThis.__authMock = { token: "tok", user };

    // Cart has duplicates that should merge into quantities: p1 x2, p2 x1
    const p1 = {
      _id: "p1",
      name: "P1",
      price: 10,
      quantity: 1,
      description: "d1",
    };
    const p2 = {
      _id: "p2",
      name: "P2",
      price: 5,
      quantity: 1,
      description: "d2",
    };
    localStorage.setItem(`cart:${user._id}`, JSON.stringify([p1, p1, p2]));

    // Mock axios calls in order:
    // 1) Braintree token fetch
    // 2) Orders fetch (after we navigate to /dashboard/user/orders)
    axios.get.mockImplementationOnce((url) => {
      expect(url).toBe("/api/v1/product/braintree/token");
      return Promise.resolve({ data: { clientToken: "fake-token" } });
    });
    axios.get.mockImplementationOnce((url) => {
      expect(url).toBe("/api/v1/auth/orders");
      // API returns normalized line items and summary
      return Promise.resolve({
        data: [
          {
            _id: "order-1",
            status: "Not Process",
            buyer: { name: user.name },
            createdAt: new Date().toISOString(),
            payment: { success: true },
            products: [
              {
                product: {
                  _id: "p1",
                  name: "P1",
                  description: "d1",
                  price: 10,
                },
                quantity: 2,
                price: 10,
              },
              {
                product: { _id: "p2", name: "P2", description: "d2", price: 5 },
                quantity: 1,
                price: 5,
              },
            ],
            summary: { totalUnits: 3, totalAmount: 25 },
          },
        ],
      });
    });

    // Payment resolves successfully
    axios.post.mockResolvedValueOnce({
      data: { ok: true, orderId: "order-1" },
    });

    // Render app with both routes
    const { router } = renderCartAndOrdersApp();

    // DropIn renders after token fetch
    await screen.findByTestId("dropin-mock");

    // CartPage header reflects merged total units (3)
    await waitFor(() =>
      expect(
        screen.getByText(/You Have\s*3\s*total items/i)
      ).toBeInTheDocument()
    );

    // Pay
    const payBtn = await screen.findByRole("button", { name: /make payment/i });
    expect(payBtn).toBeEnabled();
    fireEvent.click(payBtn);

    // Backend was called
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/braintree/payment",
        expect.objectContaining({
          nonce: "fake-nonce",
          cart: expect.any(Array),
        })
      )
    );

    // Manually navigate to Orders (wrap in act to avoid warnings)
    await act(async () => {
      await router.navigate("/dashboard/user/orders");
    });

    // Orders page shows per-line quantities consistent with merged cart
    await waitFor(() =>
      expect(screen.getByText(/All Orders/i)).toBeInTheDocument()
    );

    // Verify quantities for each line
    expect(screen.getByText(/Quantity:\s*2/i)).toBeInTheDocument(); // P1 x2
    expect(screen.getByText(/Quantity:\s*1/i)).toBeInTheDocument(); // P2 x1

    // Optional: verify buyer name and payment status appear within the orders table
    const [ordersTable] = screen.getAllByRole("table");
    expect(within(ordersTable).getByText(user.name)).toBeInTheDocument();
    expect(within(ordersTable).getByText(/Success/i)).toBeInTheDocument();
  });
});
