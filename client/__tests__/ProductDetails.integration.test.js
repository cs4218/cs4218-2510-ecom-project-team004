import React from "react";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import ProductDetails from "../src/pages/ProductDetails";
import { CartProvider } from "../src/context/cart";
import { setupServer } from "msw/node";
import { rest } from "msw";
import toast from "react-hot-toast";

// NOTE: The test setup was written with the help of an LLM


// Mock toast
jest.mock("react-hot-toast");

// Mock Layout component
jest.mock("../src/components/Layout", () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock data
const mockProduct = {
  _id: "prod1",
  name: "Laptop",
  slug: "laptop",
  description: "A high-performance laptop suitable for gaming and professional work",
  price: 999.99,
  category: {
    _id: "cat1",
    name: "Electronics"
  }
};

const mockRelatedProducts = [
  {
    _id: "prod2",
    name: "Gaming Mouse",
    slug: "gaming-mouse",
    description: "High precision gaming mouse with RGB lighting and programmable buttons for ultimate gaming experience",
    price: 59.99,
    category: {
      _id: "cat1",
      name: "Electronics"
    }
  },
  {
    _id: "prod3",
    name: "Keyboard",
    slug: "keyboard",
    description: "Mechanical keyboard",
    price: 89.99,
    category: {
      _id: "cat1",
      name: "Electronics"
    }
  }
];

const mockProductNoPrice = {
  _id: "prod4",
  name: "Free Product",
  slug: "free-product",
  description: "This product is free",
  price: null,
  category: {
    _id: "cat2",
    name: "Freebies"
  }
};

const mockProductNoDescription = {
  _id: "prod5",
  name: "Mystery Product",
  slug: "mystery-product",
  description: null,
  price: 49.99,
  category: {
    _id: "cat3",
    name: "Mystery"
  }
};

// MSW Server Setup
const server = setupServer(
  rest.get("/api/v1/product/get-product/:slug", (req, res, ctx) => {
    const { slug } = req.params;

    if (slug === "laptop") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          product: mockProduct
        })
      );
    }

    if (slug === "free-product") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          product: mockProductNoPrice
        })
      );
    }

    if (slug === "mystery-product") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          product: mockProductNoDescription
        })
      );
    }

    return res(
      ctx.status(404),
      ctx.json({ success: false, message: "Product not found" })
    );
  }),

  rest.get("/api/v1/product/related-product/:pid/:cid", (req, res, ctx) => {
    const { pid, cid } = req.params;

    if (pid === "prod1" && cid === "cat1") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          products: mockRelatedProducts
        })
      );
    }

    if (pid === "prod4" && cid === "cat2") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          products: [] // No related products
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        products: []
      })
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
const renderWithProviders = (slug = "laptop") => {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={[`/product/${slug}`]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    </CartProvider>
  );
};

// Helper function to get the main product's ADD TO CART button
const getMainAddToCartButton = () => {
  const productDetailsSection = screen.getByText("Product Details").closest(".product-details");
  return within(productDetailsSection).getByRole('button', { name: /ADD TO CART/i });
};

// Helper to wait for product to load
const waitForProductLoad = async () => {
  await waitFor(() => {
    expect(screen.getByText("Product Details")).toBeInTheDocument();
  });
};

describe("ProductDetails Component - Integration Tests", () => {
  describe("Component Rendering & Data Fetching", () => {
    // NOTE: The test below was written with the help of an LLM
    test("renders product details page successfully", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      // Verify key product information is displayed
      await waitFor(() => {
        expect(screen.getByText(/Name :.*Laptop/)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("fetches and displays related products", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
        expect(screen.getByText("Keyboard")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles product not found with 404 status", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await act(async () => {
        renderWithProviders("non-existent-product");
      });

      await waitFor(() => {
        // Verify error was logged
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            response: expect.objectContaining({
              status: 404
            })
          })
        );
      });

      consoleSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles API error gracefully and logs error", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      server.use(
        rest.get("/api/v1/product/get-product/:slug", (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: "Server error" })
          );
        })
      );

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            response: expect.objectContaining({
              status: 500
            })
          })
        );
      });

      consoleSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test("loads different product data for different slugs", async () => {
      // Test first product
      const { unmount } = await act(async () => {
        return renderWithProviders("laptop");
      });

      await waitFor(() => {
        expect(screen.getByText(/Name :.*Laptop/)).toBeInTheDocument();
        expect(screen.getByText(/\$999\.99/)).toBeInTheDocument();
      });

      // Unmount and render with different slug
      unmount();

      await act(async () => {
        renderWithProviders("free-product");
      });

      await waitFor(() => {
        expect(screen.getByText(/Name :.*Free Product/)).toBeInTheDocument();
        expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
      });
    });
  });

  describe("Product Display & Formatting", () => {
    // NOTE: The test below was written with the help of an LLM
    test("formats product price correctly", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText(/Price :.*\$999\.99/)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles missing price gracefully by displaying $0.00", async () => {
      await act(async () => {
        renderWithProviders("free-product");
      });

      await waitFor(() => {
        expect(screen.getByText(/Price :.*\$0\.00/)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles missing description gracefully", async () => {
      await act(async () => {
        renderWithProviders("mystery-product");
      });

      await waitFor(() => {
        const descriptionHeading = screen.getByText("Description :");
        expect(descriptionHeading).toBeInTheDocument();
      });

      // Verify that either the description is empty or shows fallback
      const descriptionSection = screen.getByText("Description :").parentElement;
      expect(descriptionSection).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays full product description when available", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText(/A high-performance laptop/)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("renders product image with correct API endpoint", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images[0]).toHaveAttribute("src", "/api/v1/product/product-photo/prod1");
        expect(images[0]).toHaveAttribute("alt", "Laptop");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays product category information", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText(/Category :.*Electronics/)).toBeInTheDocument();
      });
    });
  });

  describe("Related Products Display", () => {
    // NOTE: The test below was written with the help of an LLM
    test("displays 'No Similar Products found' when no related products exist", async () => {
      await act(async () => {
        renderWithProviders("free-product");
      });

      await waitFor(() => {
        expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("truncates long descriptions in related products with ellipsis", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        const relatedProduct = screen.getByText("Gaming Mouse").closest(".card");
        const description = within(relatedProduct).getByText(/High precision gaming mouse/);
        expect(description.textContent).toMatch(/\.\.\.$/);
        expect(description.textContent.length).toBeLessThan(mockRelatedProducts[0].description.length);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays short descriptions without truncation in related products", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        const relatedProduct = screen.getByText("Keyboard").closest(".card");
        const description = within(relatedProduct).getByText("Mechanical keyboard");
        expect(description.textContent).toBe("Mechanical keyboard");
        expect(description.textContent).not.toMatch(/\.\.\.$/);
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("displays correct number of related products", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        const relatedProductCards = screen.getAllByText(/More Details/).length;
        expect(relatedProductCards).toBe(2); // Gaming Mouse and Keyboard
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("shows prices for all related products", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText(/\$59\.99/)).toBeInTheDocument();
        expect(screen.getByText(/\$89\.99/)).toBeInTheDocument();
      });
    });
  });

  describe("Navigation & Interaction", () => {
    // NOTE: The test below was written with the help of an LLM
    test("'More Details' button has correct navigation link", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        const gamingMouseCard = screen.getByText("Gaming Mouse").closest(".card");
        const moreDetailsButton = within(gamingMouseCard).getByText("More Details");
        
        // Verify button is clickable and properly configured
        expect(moreDetailsButton).toBeInTheDocument();
        expect(moreDetailsButton.closest('button')).toBeEnabled();
      });
    });
  });

  describe("Cart Functionality", () => {
    // NOTE: The test below was written with the help of an LLM
    test("adds main product to cart when 'ADD TO CART' is clicked", async () => {
      const user = userEvent;
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      const addToCartButton = getMainAddToCartButton();

      await act(async () => {
        await user.click(addToCartButton);
      });

      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
      
      // Verify cart was updated
      const cartData = JSON.parse(localStorage.getItem("cart"));
      expect(cartData).toHaveLength(1);
      expect(cartData[0]._id).toBe("prod1");
    });

    // NOTE: The test below was written with the help of an LLM
    test("adds related product to cart when 'ADD TO CART' is clicked", async () => {
      const user = userEvent;
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
      });

      const relatedProduct = screen.getByText("Gaming Mouse").closest(".card");
      const addToCartButton = within(relatedProduct).getByRole('button', { name: /ADD TO CART/i });

      await act(async () => {
        await user.click(addToCartButton);
      });

      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
      
      const cartData = JSON.parse(localStorage.getItem("cart"));
      expect(cartData).toHaveLength(1);
      expect(cartData[0]._id).toBe("prod2");
    });

    // NOTE: The test below was written with the help of an LLM
    test("persists cart to localStorage with correct data structure", async () => {
      const user = userEvent;
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      const addToCartButton = getMainAddToCartButton();

      await act(async () => {
        await user.click(addToCartButton);
      });

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(1);
        expect(cartData[0]).toMatchObject({
          _id: "prod1",
          name: "Laptop",
          price: 999.99,
          slug: "laptop"
        });
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("adds multiple different products to cart", async () => {
      const user = userEvent;
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      // Add main product
      const mainAddToCart = getMainAddToCartButton();
      await act(async () => {
        await user.click(mainAddToCart);
      });

      // Add related product
      await waitFor(() => {
        expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
      });
      
      const relatedProduct = screen.getByText("Gaming Mouse").closest(".card");
      const relatedAddToCart = within(relatedProduct).getByRole('button', { name: /ADD TO CART/i });
      
      await act(async () => {
        await user.click(relatedAddToCart);
      });

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(2);
        expect(cartData.map(item => item._id)).toEqual(["prod1", "prod2"]);
      });

      expect(toast.success).toHaveBeenCalledTimes(2);
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles adding same product to cart multiple times", async () => {
      const user = userEvent;
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      const addToCartButton = getMainAddToCartButton();

      // Click twice
      await act(async () => {
        await user.click(addToCartButton);
      });
      
      await act(async () => {
        await user.click(addToCartButton);
      });

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData.length).toBeGreaterThanOrEqual(1);
      });

      expect(toast.success).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cart Integration with Existing Items", () => {
    // NOTE: The test below was written with the help of an LLM
    test("renders correctly with existing cart items in localStorage", async () => {
      const existingCart = [
        {
          _id: "existing1",
          name: "Existing Product",
          price: 100,
          slug: "existing-product",
          description: "Existing product description"
        }
      ];
      localStorage.setItem("cart", JSON.stringify(existingCart));

      const user = userEvent;
      toast.success = jest.fn();

      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      const addToCartButton = getMainAddToCartButton();
      await act(async () => {
        await user.click(addToCartButton);
      });

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(2);
        expect(cartData[0]._id).toBe("existing1");
        expect(cartData[1]._id).toBe("prod1");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("preserves existing cart items when adding new product", async () => {
      const existingCart = [
        { _id: "item1", name: "Item 1", price: 50 },
        { _id: "item2", name: "Item 2", price: 75 }
      ];
      localStorage.setItem("cart", JSON.stringify(existingCart));

      const user = userEvent;

      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      const addToCartButton = getMainAddToCartButton();
      await act(async () => {
        await user.click(addToCartButton);
      });

      await waitFor(() => {
        const cartData = JSON.parse(localStorage.getItem("cart"));
        expect(cartData).toHaveLength(3);
        expect(cartData.map(item => item._id)).toEqual(["item1", "item2", "prod1"]);
      });
    });
  });

  describe("Edge Cases & Error Handling", () => {
    // NOTE: The test below was written with the help of an LLM
    test("handles empty related products array", async () => {
      server.use(
        rest.get("/api/v1/product/related-product/:pid/:cid", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              products: []
            })
          );
        })
      );

      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles related products API failure gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      server.use(
        rest.get("/api/v1/product/related-product/:pid/:cid", (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: "Failed to fetch related products" })
          );
        })
      );

      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      // Component should still render main product even if related products fail
      await waitFor(() => {
        expect(screen.getByText(/Name :.*Laptop/)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles malformed cart data in localStorage", async () => {
      localStorage.setItem("cart", "invalid-json");

      await act(async () => {
        renderWithProviders();
      });

      await waitForProductLoad();

      // Should not crash and should render product
      expect(screen.getByText("Product Details")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles product with all fields populated", async () => {
      await act(async () => {
        renderWithProviders();
      });

      await waitFor(() => {
        expect(screen.getByText(/Name :.*Laptop/)).toBeInTheDocument();
        expect(screen.getByText(/Price :.*\$999\.99/)).toBeInTheDocument();
        expect(screen.getByText(/Category :.*Electronics/)).toBeInTheDocument();
        expect(screen.getByText(/A high-performance laptop/)).toBeInTheDocument();
      });
    });
  });
});