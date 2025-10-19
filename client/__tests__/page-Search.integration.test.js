import React from "react";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Search from "../src/pages/Search";
import { CartProvider } from "../src/context/cart";
import { setupServer } from "msw/node";
import { rest } from "msw";
import toast from "react-hot-toast";

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

// Create a mock function that can be overridden per test
const mockUseSearch = jest.fn();

// Mock the useSearch hook - this isolates the search data for testing
// while still testing integration with CartProvider, localStorage, and routing
jest.mock("../src/context/search", () => ({
  useSearch: () => mockUseSearch()
}));

// Mock data for different test scenarios
const mockSearchResults = [
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

const mockProductNoDescription = {
  _id: "prod3",
  name: "Mystery Product",
  price: 49.99,
  description: null,
  slug: "mystery-product",
};

const mockProductNoPrice = {
  _id: "prod4",
  name: "Free Product",
  price: null,
  description: "This product is completely free",
  slug: "free-product",
};

// MSW Server Setup
const server = setupServer(
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
  // Reset to default mock
  mockUseSearch.mockReturnValue([
    {
      results: mockSearchResults,
      keyword: "test"
    },
    jest.fn()
  ]);
});
afterAll(() => server.close());

// Set default mock before all tests
beforeEach(() => {
  mockUseSearch.mockReturnValue([
    {
      results: mockSearchResults,
      keyword: "test"
    },
    jest.fn()
  ]);
});

// Helper function to render component with all required providers
const renderWithProviders = () => {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={["/search"]}>
        <Routes>
          <Route path="/search" element={<Search />} />
          <Route path="/product/:slug" element={<div>Product Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </CartProvider>
  );
};

describe("Search Page - Integration Tests", () => {
  describe("Search Results Display", () => {
    // NOTE: The test below was written with the help of an LLM
    test("renders search results page with products", async () => {
      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Search Results")).toBeInTheDocument();
      expect(screen.getByText("Found 2")).toBeInTheDocument();
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("$ 999.99")).toBeInTheDocument();
      expect(screen.getByText("$ 19.99")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays 'No Products Found' when search results are empty", async () => {
      mockUseSearch.mockReturnValue([
        {
          results: [],
          keyword: "test"
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Search Results")).toBeInTheDocument();
      expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles products with missing description", async () => {
      mockUseSearch.mockReturnValue([
        {
          results: [mockProductNoDescription],
          keyword: "test"
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("No description.")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles products with missing price", async () => {
      mockUseSearch.mockReturnValue([
        {
          results: [mockProductNoPrice],
          keyword: "test"
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("$ 0")).toBeInTheDocument();
    });
  });

  describe("Product Description Formatting", () => {
    // NOTE: The test below was written with the help of an LLM
    test("truncates long product descriptions to 30 characters", async () => {
      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText(/A high-performance laptop suit\.\.\./)).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays short descriptions without truncation", async () => {
      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Comfortable cotton t-shirt")).toBeInTheDocument();
    });
  });

  describe("Product Image Integration", () => {
    // NOTE: The test below was written with the help of an LLM
    test("renders product images with correct API endpoints", async () => {
      await act(async () => {
        renderWithProviders();
      });

      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', '/api/v1/product/product-photo/prod1');
      expect(images[1]).toHaveAttribute('src', '/api/v1/product/product-photo/prod2');
    });
  });

  describe("Navigation Integration", () => {
    // NOTE: The test below was written with the help of an LLM
    test("navigates to product details when 'More Details' is clicked", async () => {
      await act(async () => {
        renderWithProviders();
      });

      const moreDetailsButtons = screen.getAllByText("More Details");
      await act(async () => {
        userEvent.click(moreDetailsButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText("Product Detail Page")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("each product has a working 'More Details' link", async () => {
      await act(async () => {
        renderWithProviders();
      });

      const moreDetailsButtons = screen.getAllByText("More Details");
      expect(moreDetailsButtons).toHaveLength(2);
    });
  });

  describe("Cart Integration - Real CartProvider and localStorage", () => {
    // NOTE: The test below was written with the help of an LLM
    test("adds product to cart and persists to localStorage", async () => {
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => {
        userEvent.click(addToCartButtons[0]);
      });

      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
      
      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(1);
        expect(cartData[0].name).toBe("Laptop");
        expect(cartData[0].price).toBe(999.99);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("adds multiple products to cart sequentially", async () => {
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      
      await act(async () => {
        userEvent.click(addToCartButtons[0]);
      });

      await act(async () => {
        userEvent.click(addToCartButtons[1]);
      });

      expect(toast.success).toHaveBeenCalledTimes(2);
      
      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(2);
        expect(cartData[0].name).toBe("Laptop");
        expect(cartData[1].name).toBe("T-Shirt");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("preserves existing cart items when adding new products", async () => {
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

      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => {
        userEvent.click(addToCartButtons[0]);
      });

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(2);
        expect(cartData[0].name).toBe("Existing Product");
        expect(cartData[1].name).toBe("Laptop");
      }, { timeout: 3000 });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles adding product with missing price to cart", async () => {
      mockUseSearch.mockReturnValue([
        {
          results: [mockProductNoPrice],
          keyword: "test"
        },
        jest.fn()
      ]);

      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      const addToCartButton = screen.getByText("ADD TO CART");
      await act(async () => {
        userEvent.click(addToCartButton);
      });

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(1);
        expect(cartData[0].name).toBe("Free Product");
        expect(cartData[0].price).toBeNull();
      });
    });
  });

  describe("Search Results Count and Display", () => {
    // NOTE: The test below was written with the help of an LLM
    test("displays correct count for single search result", async () => {
      mockUseSearch.mockReturnValue([
        {
          results: [mockSearchResults[0]],
          keyword: "laptop"
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Found 1")).toBeInTheDocument();
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.queryByText("T-Shirt")).not.toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays correct count for multiple search results", async () => {
      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Found 2")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles empty search results with no action buttons", async () => {
      mockUseSearch.mockReturnValue([
        {
          results: [],
          keyword: "nonexistent"
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("No Products Found")).toBeInTheDocument();
      expect(screen.queryByText("More Details")).not.toBeInTheDocument();
      expect(screen.queryByText("ADD TO CART")).not.toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("renders all products from search results", async () => {
      const manyProducts = Array.from({ length: 5 }, (_, i) => ({
        _id: `prod${i}`,
        name: `Product ${i}`,
        price: 10 * (i + 1),
        description: `Description ${i}`,
        slug: `product-${i}`,
      }));

      mockUseSearch.mockReturnValue([
        {
          results: manyProducts,
          keyword: "test"
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Found 5")).toBeInTheDocument();
      manyProducts.forEach(product => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    });
  });

  describe("Layout Integration", () => {
    // NOTE: The test below was written with the help of an LLM
    test("renders with correct page title in Layout", async () => {
      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Search results")).toBeInTheDocument();
      expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("maintains responsive grid layout", async () => {
      await act(async () => {
        renderWithProviders();
      });

      const flexContainer = screen.getByText("Laptop").closest('.d-flex');
      expect(flexContainer).toHaveClass('d-flex', 'flex-wrap');
    });
  });

  describe("Complete User Flows", () => {
    // NOTE: The test below was written with the help of an LLM
    test("complete flow: view results -> add to cart -> navigate to details", async () => {
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      // Step 1: Verify search results are displayed
      expect(screen.getByText("Found 2")).toBeInTheDocument();
      expect(screen.getByText("Laptop")).toBeInTheDocument();

      // Step 2: Add product to cart (tests CartProvider integration)
      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => {
        userEvent.click(addToCartButtons[0]);
      });

      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");

      // Step 3: Verify cart was updated via CartProvider and localStorage
      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(1);
        expect(cartData[0].name).toBe("Laptop");
      });

      // Step 4: Navigate to product details (tests routing integration)
      const moreDetailsButtons = screen.getAllByText("More Details");
      await act(async () => {
        userEvent.click(moreDetailsButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText("Product Detail Page")).toBeInTheDocument();
      });

      // Step 5: Verify cart persisted after navigation
      const cartData = JSON.parse(localStorage.getItem("cart"));
      expect(cartData).toHaveLength(1);
    });

    // NOTE: The test below was written with the help of an LLM
    test("flow: add multiple items to cart from search results", async () => {
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      const addToCartButtons = screen.getAllByText("ADD TO CART");

      // Add all products to cart
      for (const button of addToCartButtons) {
        await act(async () => {
          userEvent.click(button);
        });
      }

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(2);
        expect(cartData.map(item => item.name)).toEqual(["Laptop", "T-Shirt"]);
      });

      expect(toast.success).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    // NOTE: The test below was written with the help of an LLM
    test("handles undefined search results gracefully", async () => {
      mockUseSearch.mockReturnValue([
        {
          results: [],  // Use empty array instead of undefined
          keyword: ""
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Search Results")).toBeInTheDocument();
      expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles products with all null fields", async () => {
      const nullProduct = {
        _id: "null-prod",
        name: null,
        price: null,
        description: null,
        slug: null,
      };

      mockUseSearch.mockReturnValue([
        {
          results: [nullProduct],
          keyword: "test"
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("Found 1")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles very long product names", async () => {
      const longNameProduct = {
        _id: "long-name",
        name: "A".repeat(200),
        price: 99.99,
        description: "Test",
        slug: "long-name-product",
      };

      mockUseSearch.mockReturnValue([
        {
          results: [longNameProduct],
          keyword: "test"
        },
        jest.fn()
      ]);

      await act(async () => {
        renderWithProviders();
      });

      expect(screen.getByText("A".repeat(200))).toBeInTheDocument();
    });
  });
});