import React from "react";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import HomePage from "../src/pages/HomePage";
import { CartProvider } from "../src/context/cart";
import { setupServer } from "msw/node";
import { rest } from "msw";
import toast from "react-hot-toast";
import axios from 'axios';

// NOTE: The test setup was written with the help of an LLM

// Mock toast
jest.mock("react-hot-toast");

// Mock Layout component
jest.mock("../src/components/Layout", () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout">
        <h1>{title}</h1>
        {children}
      </div>
    );
  };
});

// Mock data
const mockCategories = [
  { _id: "cat1", name: "Electronics" },
  { _id: "cat2", name: "Clothing" },
  { _id: "cat3", name: "Books" },
];

const mockProductsPage1 = [
  {
    _id: "prod1",
    name: "Laptop",
    price: 999.99,
    description: "A high-performance laptop suitable for gaming and professional work with many features",
    slug: "laptop",
  },
  {
    _id: "prod2",
    name: "T-Shirt",
    price: 19.99,
    description: "Comfortable cotton t-shirt",
    slug: "t-shirt",
  },
];

const mockProductsPage2 = [
  {
    _id: "prod3",
    name: "Book",
    price: 12.99,
    description: "Interesting novel",
    slug: "book",
  },
];

const mockFilteredProducts = [
  {
    _id: "prod4",
    name: "Smartphone",
    price: 299.99,
    description: "Latest smartphone with advanced features",
    slug: "smartphone",
  },
];

// MSW Server Setup
const server = setupServer(
  rest.get("/api/v1/category/get-category", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        category: mockCategories,
      })
    );
  }),

  rest.get("/api/v1/product/product-count", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        total: 3,
      })
    );
  }),

  rest.get("/api/v1/product/product-list/:page", (req, res, ctx) => {
    const { page } = req.params;

    if (page === "1") {
      return res(
        ctx.status(200),
        ctx.json({
          products: mockProductsPage1,
        })
      );
    }

    if (page === "2") {
      return res(
        ctx.status(200),
        ctx.json({
          products: mockProductsPage2,
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        products: [],
      })
    );
  }),

  rest.post("/api/v1/product/product-filters", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        products: mockFilteredProducts,
      })
    );
  }),

  rest.get("/api/v1/product/product-photo/:id", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({})
    );
  })
);

// Enable API mocking
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  jest.clearAllMocks();
});
afterAll(() => server.close());

// Helper function to render component with all required providers
const renderWithProviders = () => {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<div>Product Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </CartProvider>
  );
};

// Helper function to find Ant Design checkboxes and radios
const getCheckboxByLabel = (label) => {
  return screen.getByLabelText(label);
};

const getRadioByLabel = (label) => {
  return screen.getByLabelText(label);
};

describe("HomePage Component - Integration Tests", () => {
  describe("Initial Load & Data Fetching", () => {
    // NOTE: The test below was written with the help of an LLM
    test("renders homepage successfully with initial data", async () => {
      await act(async () => {
        renderWithProviders();
      });

      // Wait for banner to load
      await waitFor(() => {
        expect(screen.getByAltText("bannerimage")).toBeInTheDocument();
      });

      // Check if categories are loaded
      await waitFor(() => {
        expect(screen.getByText("Filter By Category")).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Clothing")).toBeInTheDocument();
        expect(screen.getByText("Books")).toBeInTheDocument();
      });

      // Check if products are loaded
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      });

      // Check if price filters are displayed - using actual text from your DOM
      expect(screen.getByText("Filter By Price")).toBeInTheDocument();

      // Use the actual price ranges from your component output
      const actualPriceRanges = [
        "$0 to 19",
        "$20 to 39",
        "$40 to 59",
        "$60 to 79",
        "$80 to 99",
        "$100 or more"
      ];

      actualPriceRanges.forEach(price => {
        expect(screen.getByText(price)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays reset filters button", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("RESET FILTERS")).toBeInTheDocument();
      });
    });
  });

  describe("Product Display & Formatting", () => {
    // NOTE: The test below was written with the help of an LLM
    test("formats product prices correctly", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("$999.99")).toBeInTheDocument();
        expect(screen.getByText("$19.99")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("truncates long product descriptions", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        // Look for the truncated description
        expect(screen.getByText(/A high-performance laptop suitable for gaming and profession\.\.\./)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays short descriptions without truncation", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Comfortable cotton t-shirt")).toBeInTheDocument();
      });
    });
  });

  describe("Category Filtering", () => {
    // NOTE: The test below was written with the help of an LLM
    test("filters products by category when checkbox is checked", async () => {
      const user = userEvent;

      await act(async () => {
        renderWithProviders();
      });

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
      });

      // Find and click Electronics checkbox using the actual label text
      const electronicsCheckbox = getCheckboxByLabel("Electronics");
      await act(async () => {
        await user.click(electronicsCheckbox);
      });

      // Should show filtered products
      await waitFor(() => {
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("removes category filter when checkbox is unchecked", async () => {
      const user = userEvent;

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
      });

      const electronicsCheckbox = getCheckboxByLabel("Electronics");

      // Check the checkbox
      await act(async () => {
        await user.click(electronicsCheckbox);
      });

      await waitFor(() => {
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
      });

      // Uncheck the checkbox
      await act(async () => {
        await user.click(electronicsCheckbox);
      });

      // Should show all products again
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      });
    });
  });

  describe("Price Filtering", () => {
    // NOTE: The test below was written with the help of an LLM
    test("filters products by price range when radio button is selected", async () => {
      const user = userEvent;

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("$20 to 39")).toBeInTheDocument();
      });

      // Select price range using the actual label
      const priceRadio = getRadioByLabel("$20 to 39");
      await act(async () => {
        await user.click(priceRadio);
      });

      // Should show filtered products
      await waitFor(() => {
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
      });
    });
  });

  describe("Load More Functionality", () => {
    // NOTE: The test below was written with the help of an LLM
    test("loads more products when load more button is clicked", async () => {
      const user = userEvent;

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      // Click load more button
      const loadMoreButton = screen.getByText("Loadmore");
      await act(async () => {
        await user.click(loadMoreButton);
      });

      // Should eventually display products from both pages
      await waitFor(() => {
        expect(screen.getByText("Book")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    // NOTE: The test below was written with the help of an LLM
    test("hides load more button when all products are loaded", async () => {
      // Mock API to return only 2 products total
      server.use(
        rest.get("/api/v1/product/product-count", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              total: 2,
            })
          );
        })
      );

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        // Load more button should not be present since we have all products
        expect(screen.queryByText("Loadmore")).not.toBeInTheDocument();
      });
    });
  });

  describe("Product Interactions", () => {
    // NOTE: The test below was written with the help of an LLM
    test("navigates to product details when 'More Details' is clicked", async () => {
      const user = userEvent;

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const moreDetailsButtons = screen.getAllByText("More Details");
      await act(async () => {
        await user.click(moreDetailsButtons[0]);
      });

      // Should navigate to product detail page
      await waitFor(() => {
        expect(screen.getByText("Product Detail Page")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("adds product to cart when 'ADD TO CART' is clicked", async () => {
      const user = userEvent;
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => {
        await user.click(addToCartButtons[0]);
      });

      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
  });

  describe("Reset Filters", () => {
    // NOTE: The test below was written with the help of an LLM
    test("resets all filters when reset button is clicked", async () => {
      const user = userEvent;

      // Mock window.location.reload
      const originalLocation = window.location;
      delete window.location;
      window.location = { reload: jest.fn() };

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("RESET FILTERS")).toBeInTheDocument();
      });

      const resetButton = screen.getByText("RESET FILTERS");
      await act(async () => {
        await user.click(resetButton);
      });

      expect(window.location.reload).toHaveBeenCalled();

      // Restore window.location
      window.location = originalLocation;
    });
  });

  describe("Combined Filters", () => {
    // NOTE: The test below was written with the help of an LLM
    test("applies both category and price filters together", async () => {
      const user = userEvent;

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("$20 to 39")).toBeInTheDocument();
      });

      // Apply category filter
      const electronicsCheckbox = getCheckboxByLabel("Electronics");
      await act(async () => {
        await user.click(electronicsCheckbox);
      });

      // Apply price filter
      const priceRadio = getRadioByLabel("$20 to 39");
      await act(async () => {
        await user.click(priceRadio);
      });

      // Should show filtered products
      await waitFor(() => {
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    // NOTE: The test below was written with the help of an LLM
    test("handles API errors gracefully for categories", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      server.use(
        rest.get("/api/v1/category/get-category", (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: "Server error" })
          );
        })
      );

      await act(async () => {
        renderWithProviders();
      });

      // Component should still render without crashing
      await waitFor(() => {
        expect(screen.getByText("All Products")).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles API errors gracefully for products", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      server.use(
        rest.get("/api/v1/product/product-list/1", (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: "Server error" })
          );
        })
      );

      await act(async () => {
        renderWithProviders();
      });

      // Component should still render without crashing
      await waitFor(() => {
        expect(screen.getByText("All Products")).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    // NOTE: The test below was written with the help of an LLM
    test("handles products with missing description", async () => {
      server.use(
        rest.get("/api/v1/product/product-list/1", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              products: [
                {
                  _id: "prod5",
                  name: "Mystery Product",
                  price: 49.99,
                  description: null,
                  slug: "mystery-product",
                },
              ],
            })
          );
        })
      );

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("No description.")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles products with missing price", async () => {
      server.use(
        rest.get("/api/v1/product/product-list/1", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              products: [
                {
                  _id: "prod6",
                  name: "Free Product",
                  price: null,
                  description: "Free item",
                  slug: "free-product",
                },
              ],
            })
          );
        })
      );

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("$0.00")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("works correctly with existing cart items", async () => {
      const existingCart = [
        {
          _id: "existing1",
          name: "Existing Product",
          price: 100,
          description: "Existing item",
          slug: "existing-product",
        },
      ];
      localStorage.setItem("cart", JSON.stringify(existingCart));

      const user = userEvent;
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => {
        await user.click(addToCartButtons[0]);
      });

      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
  });

  describe("Prices Duplicate ID Detection", () => {
  // NOTE: The test below was written with the help of an LLM
    test("should fail when Prices array has duplicate _id values", async () => {
      // Import the ACTUAL Prices array to test the real data
      const { Prices } = require('../src/components/Prices');

      // This is the key test that WILL FAIL with the current Prices.js
      const ids = Prices.map(p => p._id);
      const uniqueIds = [...new Set(ids)];

      // This assertion WILL FAIL because of duplicate _id: 4
      expect(ids.length).toBe(uniqueIds.length);

      // Optional: Show which IDs are duplicates
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.log('DUPLICATE IDs FOUND:', duplicateIds);
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test("should detect React duplicate key warnings for Prices rendering", async () => {
      // Spy on console.error to catch React's duplicate key warning
      const consoleErrorSpy = jest.spyOn(console, 'error');

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Filter By Price")).toBeInTheDocument();
      });

      // Check if React logged any duplicate key warnings
      const duplicateKeyWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call[0] && typeof call[0] === 'string' &&
        (call[0].includes('duplicate key') || call[0].includes('same key'))
      );


      if (duplicateKeyWarnings.length > 0) {
        console.log('REACT DUPLICATE KEY WARNINGS:', duplicateKeyWarnings);
      }

      consoleErrorSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test("should verify all price ranges are uniquely selectable", async () => {
      const user = userEvent;

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Filter By Price")).toBeInTheDocument();
      });

      const priceRanges = [
        "$0 to 19",
        "$20 to 39",
        "$40 to 59",
        "$60 to 79",
        "$80 to 99",
        "$100 or more"
      ];

      // Test that each price range can be individually selected
      for (const priceRange of priceRanges) {
        const radio = getRadioByLabel(priceRange);

        // If duplicate keys caused rendering issues, this might throw
        expect(radio).toBeInTheDocument();

        await act(async () => {
          await user.click(radio);
        });

        // Verify it got selected
        await waitFor(() => {
          expect(radio).toBeChecked();
        });
      }
    });

    // NOTE: The test below was written with the help of an LLM
    test("should have correct Price array structure for filtering", () => {
      // Import the actual Prices array
      const { Prices } = require('../src/components/Prices');

      // Test that will FAIL with current Prices.js
      Prices.forEach((price, index) => {
        // Each price should have unique _id
        const otherPrices = Prices.filter((_, i) => i !== index);
        const hasDuplicate = otherPrices.some(p => p._id === price._id);

        // This will FAIL for the duplicate _id: 4
        expect(hasDuplicate).toBe(false);
      });
    });
  });
});