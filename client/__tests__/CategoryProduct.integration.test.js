import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import CategoryProduct from "../src/pages/CategoryProduct";
import { CartProvider } from "../src/context/cart";
import { setupServer } from "msw/node";
import { rest } from "msw";
import toast from "react-hot-toast";

// NOTE: The test setup was written with the help of an LLM

// Mock toast
jest.mock("react-hot-toast");

// Mock Layout component to simplify testing
jest.mock("../src/components/Layout.js", () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock data
const mockCategory = {
  _id: "cat1",
  name: "Electronics",
  slug: "electronics",
};

const mockProducts = [
  {
    _id: "prod1",
    name: "Laptop",
    slug: "laptop",
    description: "A high-performance laptop suitable for gaming and professional work",
    price: 999.99,
  },
  {
    _id: "prod2",
    name: "Mouse",
    slug: "mouse",
    description: "Wireless mouse",
    price: 29.99,
  },
  {
    _id: "prod3",
    name: "Product Without Description",
    slug: "no-desc",
    description: null,
    price: 49.99,
  },
  {
    _id: "prod4",
    name: "Product Without Price",
    slug: "no-price",
    description: "This product has no price",
    price: null,
  },
];

// MSW Server Setup (v1 syntax)
const server = setupServer(
  rest.get("/api/v1/product/product-category/:slug", (req, res, ctx) => {
    const { slug } = req.params;

    if (slug === "electronics") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          category: mockCategory,
          products: mockProducts,
        })
      );
    }

    if (slug === "empty-category") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          category: { _id: "cat2", name: "Empty Category", slug: "empty-category" },
          products: [],
        })
      );
    }

    return res(
      ctx.status(404),
      ctx.json({ success: false, message: "Category not found" })
    );
  })
);

// Enable API mocking
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});
afterAll(() => server.close());

// Helper function to render component with all required providers
const renderWithProviders = (slug = "electronics") => {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={[`/category/${slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
          <Route path="/product/:slug" element={<div>Product Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </CartProvider>
  );
};

describe("CategoryProduct Component - Integration Tests", () => {
  // NOTE: The test below was written with the help of an LLM
  describe("Component Rendering & Data Fetching", () => {
    test("renders category page with products successfully", async () => {
      renderWithProviders();

      // Wait for API call and data to load
      await waitFor(() => {
        expect(screen.getByText("Category - Electronics")).toBeInTheDocument();
      });

      expect(screen.getByText("4 result found")).toBeInTheDocument();
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Mouse")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays correct number of product cards", async () => {
      renderWithProviders();

      await waitFor(() => {
        const cards = screen.getAllByRole("img");
        expect(cards).toHaveLength(4);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles empty category with no products", async () => {
      renderWithProviders("empty-category");

      await waitFor(() => {
        expect(screen.getByText("Category - Empty Category")).toBeInTheDocument();
      });

      expect(screen.getByText("0 result found")).toBeInTheDocument();
      
      // Verify no product cards are rendered
      expect(screen.queryByText("ADD TO CART")).not.toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles API error gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      server.use(
        rest.get("/api/v1/product/product-category/:slug", (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: "Server error" })
          );
        })
      );

      renderWithProviders();

      // Component logs the error object directly, not a string
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // Verify UI doesn't show products on error
      expect(screen.queryByText("Laptop")).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles network timeout", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      server.use(
        rest.get("/api/v1/product/product-category/:slug", (req, res, ctx) => {
          return res(
            ctx.delay(5000),
            ctx.status(500)
          );
        })
      );

      renderWithProviders();

      // Should eventually handle the timeout
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      }, { timeout: 6000 });

      consoleSpy.mockRestore();
    }, 10000); // Increase test timeout to 10 seconds
  });

  describe("Product Display & Formatting", () => {
    // NOTE: The test below was written with the help of an LLM
    test("formats product prices correctly", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("$999.99")).toBeInTheDocument();
      });

      expect(screen.getByText("$29.99")).toBeInTheDocument();
      expect(screen.getByText("$49.99")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles missing price gracefully", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Product Without Price")).toBeInTheDocument();
      });

      // Component uses p.price ?? 0, which displays as $0.00
      // Use a more flexible matcher to find the price
      await waitFor(() => {
        expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("truncates long descriptions correctly", async () => {
      renderWithProviders();

      await waitFor(() => {
        const description = screen.getByText(/A high-performance laptop/);
        expect(description.textContent).toMatch(/\.\.\.$/);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays short descriptions without truncation", async () => {
      renderWithProviders();

      await waitFor(() => {
        const description = screen.getByText("Wireless mouse");
        expect(description.textContent).toBe("Wireless mouse");
        expect(description.textContent).not.toMatch(/\.\.\.$/);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles missing description gracefully", async () => {
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Product Without Description")).toBeInTheDocument();
      });

      expect(screen.getByText("No description.")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("renders product images with correct src and alt attributes", async () => {
      renderWithProviders();

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images[0]).toHaveAttribute("src", "/api/v1/product/product-photo/prod1");
        expect(images[0]).toHaveAttribute("alt", "Laptop");
        expect(images[1]).toHaveAttribute("src", "/api/v1/product/product-photo/prod2");
        expect(images[1]).toHaveAttribute("alt", "Mouse");
      });
    });
  });

  describe("Navigation & Interaction", () => {
    // NOTE: The test below was written with the help of an LLM
    test("navigates to product detail page when 'More Details' is clicked", async () => {
      const user = userEvent;
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const moreDetailsButtons = screen.getAllByText("More Details");
      await user.click(moreDetailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Product Detail Page")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("all 'More Details' buttons are rendered and clickable", async () => {
      renderWithProviders();

      await waitFor(() => {
        const moreDetailsButtons = screen.getAllByText("More Details");
        expect(moreDetailsButtons).toHaveLength(4);
        
        // Verify all buttons are enabled
        moreDetailsButtons.forEach(button => {
          expect(button).not.toBeDisabled();
        });
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("navigates to correct product detail page for different products", async () => {
      const user = userEvent;
      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Mouse")).toBeInTheDocument();
      });

      const moreDetailsButtons = screen.getAllByText("More Details");
      await user.click(moreDetailsButtons[1]); // Click Mouse's More Details

      await waitFor(() => {
        expect(screen.getByText("Product Detail Page")).toBeInTheDocument();
      });
    });
  });

  describe("Cart Functionality", () => {
    beforeEach(() => {
      // Ensure cart starts empty for each test
      localStorage.clear();
      toast.success = jest.fn();
    });

    // NOTE: The test below was written with the help of an LLM
    test("adds product to cart when 'ADD TO CART' is clicked", async () => {
      const user = userEvent;

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await user.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("persists cart to localStorage with correct data structure", async () => {
      const user = userEvent;

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Mouse")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await user.click(addToCartButtons[1]);

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(1);
        expect(cartData[0]).toMatchObject({
          name: "Mouse",
          _id: "prod2",
          slug: "mouse",
          description: "Wireless mouse",
          price: 29.99,
        });
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("adds multiple different products to cart", async () => {
      const user = userEvent;

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");

      await user.click(addToCartButtons[0]); // Laptop
      await user.click(addToCartButtons[1]); // Mouse

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(2);
        expect(cartData[0]._id).toBe("prod1");
        expect(cartData[1]._id).toBe("prod2");
        expect(toast.success).toHaveBeenCalledTimes(2);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("adds same product multiple times (allows duplicates)", async () => {
      const user = userEvent;

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");

      await user.click(addToCartButtons[0]);
      await user.click(addToCartButtons[0]);

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(2);
        expect(cartData[0]._id).toBe("prod1");
        expect(cartData[1]._id).toBe("prod1");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("adds products with missing fields to cart", async () => {
      const user = userEvent;

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Product Without Price")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await user.click(addToCartButtons[3]); // Product Without Price

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(1);
        expect(cartData[0]._id).toBe("prod4");
        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles rapid clicks on add to cart button", async () => {
      const user = userEvent;

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");

      // Rapid clicks
      await user.click(addToCartButtons[0]);
      await user.click(addToCartButtons[0]);
      await user.click(addToCartButtons[0]);

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(3);
        expect(toast.success).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe("Cart Persistence & State Management", () => {
    // NOTE: The test below was written with the help of an LLM
    test("preserves existing cart items when adding new products", async () => {
      const existingCart = [
        {
          _id: "existing1",
          name: "Existing Product",
          price: 100,
          slug: "existing-product",
          description: "Existing product description",
        }
      ];
      localStorage.setItem("cart", JSON.stringify(existingCart));

      const user = userEvent;
      toast.success = jest.fn();

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await user.click(addToCartButtons[0]);

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(2);
        expect(cartData[0]._id).toBe("existing1");
        expect(cartData[1]._id).toBe("prod1");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles corrupted cart data in localStorage", async () => {
      localStorage.setItem("cart", "invalid json");
      
      const user = userEvent;
      toast.success = jest.fn();

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      
      // Should still be able to add to cart despite corrupted data
      await user.click(addToCartButtons[0]);

      // May need to handle gracefully - check your implementation
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe("URL Parameter Handling", () => {
    // NOTE: The test below was written with the help of an LLM
    test("fetches products when slug changes", async () => {
      const { unmount } = renderWithProviders("electronics");

      await waitFor(() => {
        expect(screen.getByText("Category - Electronics")).toBeInTheDocument();
      });

      unmount();

      renderWithProviders("empty-category");

      await waitFor(() => {
        expect(screen.getByText("Category - Empty Category")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles invalid category slug", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      renderWithProviders("invalid-category");

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // Verify no products are shown
      expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
      expect(screen.queryByText("ADD TO CART")).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles special characters in category slug", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      renderWithProviders("category-with-special-chars-123");

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases & Error Scenarios", () => {
    // NOTE: The test below was written with the help of an LLM
    test("handles products with all missing fields", async () => {
      server.use(
        rest.get("/api/v1/product/product-category/:slug", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              category: mockCategory,
              products: [
                {
                  _id: "prod-empty",
                  name: null,
                  slug: null,
                  description: null,
                  price: null,
                }
              ],
            })
          );
        })
      );

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("1 result found")).toBeInTheDocument();
      });

      // Should still render the card gracefully
      expect(screen.getByText("No description.")).toBeInTheDocument();
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles API returning malformed data", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      server.use(
        rest.get("/api/v1/product/product-category/:slug", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              // Missing category and products fields
            })
          );
        })
      );

      renderWithProviders();

      // Component handles undefined gracefully - no console.log is called
      // because there's no error, just missing data
      await waitFor(() => {
        // Verify the UI renders with defaults
        expect(screen.getByText("Category -")).toBeInTheDocument();
        // Use regex to match "result found" with flexible whitespace
        expect(screen.getByText(/result found/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test("renders correctly when category name contains special characters", async () => {
      server.use(
        rest.get("/api/v1/product/product-category/:slug", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              category: { _id: "cat3", name: "Electronics & Gadgets™", slug: "electronics-gadgets" },
              products: mockProducts,
            })
          );
        })
      );

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("Category - Electronics & Gadgets™")).toBeInTheDocument();
      });
    });

    test("handles extremely long product names", async () => {
      server.use(
        rest.get("/api/v1/product/product-category/:slug", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              category: mockCategory,
              products: [
                {
                  _id: "prod-long",
                  name: "A".repeat(500),
                  slug: "long-product",
                  description: "Description",
                  price: 99.99,
                }
              ],
            })
          );
        })
      );

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("A".repeat(500))).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles very large product lists", async () => {
      const manyProducts = Array.from({ length: 100 }, (_, i) => ({
        _id: `prod-${i}`,
        name: `Product ${i}`,
        slug: `product-${i}`,
        description: `Description ${i}`,
        price: (i + 1) * 10,
      }));

      server.use(
        rest.get("/api/v1/product/product-category/:slug", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              category: mockCategory,
              products: manyProducts,
            })
          );
        })
      );

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText("100 result found")).toBeInTheDocument();
      });

      expect(screen.getByText("Product 0")).toBeInTheDocument();
      expect(screen.getByText("Product 99")).toBeInTheDocument();
    });
  });
});