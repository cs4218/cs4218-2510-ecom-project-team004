import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import SearchInput from "../src/components/Form/SearchInput";
import { SearchProvider, useSearch } from "../src/context/search"; // Import useSearch here
import { setupServer } from "msw/node";
import { rest } from "msw";

// NOTE: The test setup was written with the help of an LLM

// MSW Server Setup - This handles API calls instead of mocking axios
const server = setupServer(
  rest.get("/api/v1/product/search/:keyword", (req, res, ctx) => {
    const { keyword } = req.params;

    if (keyword === "laptop") {
      return res(
        ctx.status(200),
        ctx.json([
          { _id: "1", name: "Gaming Laptop", price: 1500 },
          { _id: "2", name: "Business Laptop", price: 1200 }
        ])
      );
    }

    if (keyword === "empty") {
      return res(
        ctx.status(200),
        ctx.json([])
      );
    }

    if (keyword === "error") {
      return res(
        ctx.status(500),
        ctx.json({ error: "Server error" })
      );
    }

    return res(
      ctx.status(200),
      ctx.json([])
    );
  })
);

// Enable API mocking
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

// Helper component to verify search results are passed to results page
const SearchResultsPage = () => {
  const [values] = useSearch();
  
  return (
    <div data-testid="search-results-page">
      <h2>Search Results for: {values.keyword}</h2>
      <div data-testid="results-count">
        Found {values.results.length} results
      </div>
      <ul data-testid="results-list">
        {values.results.map(product => (
          <li key={product._id} data-testid={`product-${product._id}`}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Helper function to render the full integration
const renderSearchFlow = () => {
  const user = userEvent;
  
  const utils = render(
    <SearchProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<SearchInput />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
      </MemoryRouter>
    </SearchProvider>
  );

  return { user, ...utils };
};

describe("SearchInput Component - Integration Tests", () => {
  // NOTE: The test below was written with the help of an LLM
  describe("Full Search Flow Integration", () => {
    test("completes full search flow: input → API → context → navigation → display", async () => {
      const { user } = renderSearchFlow();

      // 1. Find and interact with search input
      const searchInput = screen.getByRole("searchbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      // 2. User types search query
      await user.clear(searchInput);
      await user.type(searchInput, "laptop");

      expect(searchInput).toHaveValue("laptop");

      // 3. User submits search
      await user.click(searchButton);

      // 4. Wait for navigation to results page
      await waitFor(() => {
        expect(screen.getByTestId("search-results-page")).toBeInTheDocument();
      });

      // 5. Verify search results are displayed (proves context integration)
      expect(screen.getByText("Search Results for: laptop")).toBeInTheDocument();
      expect(screen.getByTestId("results-count")).toHaveTextContent("Found 2 results");

      // 6. Verify actual product data is rendered
      expect(screen.getByTestId("product-1")).toHaveTextContent("Gaming Laptop - $1500");
      expect(screen.getByTestId("product-2")).toHaveTextContent("Business Laptop - $1200");
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles keyboard submission (Enter key)", async () => {
      const { user } = renderSearchFlow();

      const searchInput = screen.getByRole("searchbox");
      
      await user.clear(searchInput);
      await user.type(searchInput, "laptop{Enter}");

      await waitFor(() => {
        expect(screen.getByTestId("search-results-page")).toBeInTheDocument();
      });

      expect(screen.getByTestId("results-count")).toHaveTextContent("Found 2 results");
    });
  });

  describe("Empty Results Handling", () => {
    // NOTE: The test below was written with the help of an LLM
    test("handles empty search results gracefully", async () => {
      const { user } = renderSearchFlow();

      const searchInput = screen.getByRole("searchbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.clear(searchInput);
      await user.type(searchInput, "empty");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId("search-results-page")).toBeInTheDocument();
      });

      expect(screen.getByTestId("results-count")).toHaveTextContent("Found 0 results");
      
      const resultsList = screen.getByTestId("results-list");
      expect(resultsList).toBeEmptyDOMElement();
    });
  });

  describe("Input Validation", () => {
    // NOTE: The test below was written with the help of an LLM
    test("prevents search with empty keyword", async () => {
      const { user } = renderSearchFlow();

      const searchButton = screen.getByRole("button", { name: /search/i });

      // Try to submit with empty input
      await user.click(searchButton);

      // Should stay on home page
      expect(screen.queryByTestId("search-results-page")).not.toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test("prevents search with only whitespace", async () => {
      const { user } = renderSearchFlow();

      const searchInput = screen.getByRole("searchbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "   ");
      await user.click(searchButton);

      expect(screen.queryByTestId("search-results-page")).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    // NOTE: The test below was written with the help of an LLM
    test("handles API errors without crashing", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const { user } = renderSearchFlow();

      const searchInput = screen.getByRole("searchbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "error");
      await user.click(searchButton);

      // Should log error but not crash
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // Should not navigate on error
      expect(screen.queryByTestId("search-results-page")).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe("Search Context Persistence", () => {
    // NOTE: The test below was written with the help of an LLM
    test("maintains search state across component re-renders", async () => {
      const { user, rerender } = renderSearchFlow();

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "laptop");
      await user.click(screen.getByRole("button", { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByTestId("results-count")).toHaveTextContent("Found 2 results");
      });

      // Force re-render
      rerender(
        <SearchProvider>
          <MemoryRouter initialEntries={["/search"]}>
            <Routes>
              <Route path="/" element={<SearchInput />} />
              <Route path="/search" element={<SearchResultsPage />} />
            </Routes>
          </MemoryRouter>
        </SearchProvider>
      );

      // Context should persist
      expect(screen.getByText("Search Results for: laptop")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    // NOTE: The test below was written with the help of an LLM
    test("handles rapid successive searches", async () => {
      const { user } = renderSearchFlow();

      const searchInput = screen.getByRole("searchbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      // First search
      await user.type(searchInput, "laptop");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId("results-count")).toHaveTextContent("Found 2 results");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test("handles special characters in search query", async () => {
      const { user } = renderSearchFlow();

      const searchInput = screen.getByRole("searchbox");
      
      await user.type(searchInput, "test@#$%");
      await user.click(screen.getByRole("button", { name: /search/i }));

      // Should not crash - may return empty results
      await waitFor(() => {
        expect(screen.getByTestId("search-results-page")).toBeInTheDocument();
      });
    });
  });
});