import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchProvider, useSearch } from "../src/context/search";

// NOTE: The test setup was written with the help of an LLM

// Helper function to handle different userEvent versions
const getUser = () => {
  // Check if setup method exists (v14+)
  if (typeof userEvent.setup === 'function') {
    return userEvent;
  }
  // Fall back to direct userEvent for older versions
  return userEvent;
};

// Test component that uses the search context
const TestSearchComponent = () => {
  const [searchState, updateSearchState] = useSearch();

  const handleSearch = () => {
    updateSearchState({
      keyword: "test query",
      results: [
        { _id: "1", name: "Test Product 1", price: 100 },
        { _id: "2", name: "Test Product 2", price: 200 }
      ]
    });
  };

  const handleClearResults = () => {
    updateSearchState({
      results: []
    });
  };

  const handleUpdateKeyword = () => {
    updateSearchState({
      keyword: "new keyword"
    });
  };

  const handlePartialUpdate = () => {
    updateSearchState({
      keyword: "partial"
      // results remain unchanged
    });
  };

  return (
    <div>
      <div data-testid="keyword">{searchState.keyword}</div>
      <div data-testid="results-count">{searchState.results.length}</div>

      {searchState.results.map(product => (
        <div key={product._id} data-testid={`product-${product._id}`}>
          {product.name} - ${product.price}
        </div>
      ))}

      <button onClick={handleSearch} data-testid="search-button">
        Perform Search
      </button>
      <button onClick={handleClearResults} data-testid="clear-results-button">
        Clear Results
      </button>
      <button onClick={handleUpdateKeyword} data-testid="update-keyword-button">
        Update Keyword
      </button>
      <button onClick={handlePartialUpdate} data-testid="partial-update-button">
        Partial Update
      </button>
    </div>
  );
};

// Error boundary for testing hook outside provider
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-message">{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

const TestComponentWithoutProvider = () => {
  useSearch();
  return <div>Should not render</div>;
};

describe("SearchContext - Integration Tests", () => {
  describe("SearchProvider Initial State", () => {
    // NOTE: The test below was written with the help of an LLM
    it("provides initial state with empty keyword and results", () => {
      render(
        <SearchProvider>
          <TestSearchComponent />
        </SearchProvider>
      );

      expect(screen.getByTestId("keyword")).toHaveTextContent("");
      expect(screen.getByTestId("results-count")).toHaveTextContent("0");
    });

    // NOTE: The test below was written with the help of an LLM
    it("initializes with correct data structure", () => {
      const TestComponent = () => {
        const [searchState] = useSearch();
        return (
          <div>
            <div data-testid="has-keyword">{typeof searchState.keyword}</div>
            <div data-testid="has-results">{Array.isArray(searchState.results).toString()}</div>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      expect(screen.getByTestId("has-keyword")).toHaveTextContent("string");
      expect(screen.getByTestId("has-results")).toHaveTextContent("true");
    });
  });

  describe("Search State Updates", () => {
    // NOTE: The test below was written with the help of an LLM
    it("updates search state with new results and keyword", async () => {
      const user = getUser();
      
      render(
        <SearchProvider>
          <TestSearchComponent />
        </SearchProvider>
      );

      // Initial state
      expect(screen.getByTestId("keyword")).toHaveTextContent("");
      expect(screen.getByTestId("results-count")).toHaveTextContent("0");

      // Perform search
      await user.click(screen.getByTestId("search-button"));

      // Verify updated state
      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("test query");
      });
      
      expect(screen.getByTestId("results-count")).toHaveTextContent("2");
      expect(screen.getByTestId("product-1")).toHaveTextContent("Test Product 1 - $100");
      expect(screen.getByTestId("product-2")).toHaveTextContent("Test Product 2 - $200");
    });

    // NOTE: The test below was written with the help of an LLM
    it("clears search results while preserving keyword", async () => {
      const user = getUser();
      
      render(
        <SearchProvider>
          <TestSearchComponent />
        </SearchProvider>
      );

      // First perform a search
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByTestId("results-count")).toHaveTextContent("2");
      });

      // Clear results
      await user.click(screen.getByTestId("clear-results-button"));

      // Results should be cleared but keyword remains
      await waitFor(() => {
        expect(screen.getByTestId("results-count")).toHaveTextContent("0");
      });
      
      expect(screen.getByTestId("keyword")).toHaveTextContent("test query");
      expect(screen.queryByTestId("product-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("product-2")).not.toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    it("updates keyword independently of results", async () => {
      const user = userEvent;
      
      render(
        <SearchProvider>
          <TestSearchComponent />
        </SearchProvider>
      );

      // First perform a search
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("test query");
      });

      // Update keyword only
      await user.click(screen.getByTestId("update-keyword-button"));

      // Keyword should update, results should remain
      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("new keyword");
      });
      
      expect(screen.getByTestId("results-count")).toHaveTextContent("2");
      expect(screen.getByTestId("product-1")).toBeInTheDocument();
      expect(screen.getByTestId("product-2")).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    it("handles partial updates correctly", async () => {
      const user = userEvent;
      
      render(
        <SearchProvider>
          <TestSearchComponent />
        </SearchProvider>
      );

      // First perform a search to set both keyword and results
      await user.click(screen.getByTestId("search-button"));

      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("test query");
      });

      // Perform partial update (only keyword changes)
      await user.click(screen.getByTestId("partial-update-button"));

      // Keyword should update, results should remain unchanged
      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("partial");
      });
      
      expect(screen.getByTestId("results-count")).toHaveTextContent("2");
      expect(screen.getByTestId("product-1")).toBeInTheDocument();
      expect(screen.getByTestId("product-2")).toBeInTheDocument();
    });
  });

  describe("State Merging Behavior", () => {
    // NOTE: The test below was written with the help of an LLM
    it("merges state updates instead of replacing entire state", async () => {
      const user = userEvent;
      
      const TestMergeComponent = () => {
        const [searchState, updateSearchState] = useSearch();

        const setKeywordFirst = () => {
          updateSearchState({ keyword: "first keyword" });
        };

        const setResultsSecond = () => {
          updateSearchState({
            results: [{ _id: "1", name: "Product", price: 100 }]
          });
        };

        return (
          <div>
            <div data-testid="keyword">{searchState.keyword}</div>
            <div data-testid="results-count">{searchState.results.length}</div>
            <button onClick={setKeywordFirst} data-testid="set-keyword-button">
              Set Keyword
            </button>
            <button onClick={setResultsSecond} data-testid="set-results-button">
              Set Results
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestMergeComponent />
        </SearchProvider>
      );

      // Set keyword first
      await user.click(screen.getByTestId("set-keyword-button"));

      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("first keyword");
      });
      
      expect(screen.getByTestId("results-count")).toHaveTextContent("0");

      // Set results second - keyword should persist
      await user.click(screen.getByTestId("set-results-button"));

      await waitFor(() => {
        expect(screen.getByTestId("results-count")).toHaveTextContent("1");
      });
      
      expect(screen.getByTestId("keyword")).toHaveTextContent("first keyword");
    });

    // NOTE: The test below was written with the help of an LLM
    it("does not lose data on multiple sequential updates", async () => {
      const user = userEvent;
      
      const TestComponent = () => {
        const [searchState, updateSearchState] = useSearch();

        return (
          <div>
            <div data-testid="keyword">{searchState.keyword}</div>
            <div data-testid="results-count">{searchState.results.length}</div>
            <button
              onClick={() => updateSearchState({ keyword: "step1" })}
              data-testid="step1"
            >
              Step 1
            </button>
            <button
              onClick={() => updateSearchState({ results: [{ _id: "1", name: "A", price: 1 }] })}
              data-testid="step2"
            >
              Step 2
            </button>
            <button
              onClick={() => updateSearchState({ keyword: "step3" })}
              data-testid="step3"
            >
              Step 3
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      await user.click(screen.getByTestId("step1"));
      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("step1");
      });

      await user.click(screen.getByTestId("step2"));
      await waitFor(() => {
        expect(screen.getByTestId("results-count")).toHaveTextContent("1");
      });
      expect(screen.getByTestId("keyword")).toHaveTextContent("step1");

      await user.click(screen.getByTestId("step3"));
      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("step3");
      });
      expect(screen.getByTestId("results-count")).toHaveTextContent("1");
    });
  });

  describe("Error Handling", () => {
    // NOTE: The test below was written with the help of an LLM
    it("throws error when useSearch is used outside SearchProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <TestComponentWithoutProvider />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "useSearch must be used within a SearchProvider"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Multiple Consumers", () => {
    // NOTE: The test below was written with the help of an LLM
    it("multiple components share the same search state", async () => {
      const user = userEvent;
      
      const ConsumerA = () => {
        const [searchState] = useSearch();
        return <div data-testid="consumer-a">{searchState.keyword}</div>;
      };

      const ConsumerB = () => {
        const [searchState, updateSearchState] = useSearch();

        const updateState = () => {
          updateSearchState({ keyword: "updated from B" });
        };

        return (
          <div>
            <div data-testid="consumer-b">{searchState.keyword}</div>
            <button onClick={updateState} data-testid="update-from-b">
              Update from B
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <ConsumerA />
          <ConsumerB />
        </SearchProvider>
      );

      // Both consumers show initial state
      expect(screen.getByTestId("consumer-a")).toHaveTextContent("");
      expect(screen.getByTestId("consumer-b")).toHaveTextContent("");

      // Update from Consumer B
      await user.click(screen.getByTestId("update-from-b"));

      // Both consumers should see the updated state
      await waitFor(() => {
        expect(screen.getByTestId("consumer-a")).toHaveTextContent("updated from B");
      });
      expect(screen.getByTestId("consumer-b")).toHaveTextContent("updated from B");
    });

    // NOTE: The test below was written with the help of an LLM
    it("updates from any consumer affect all consumers", async () => {
      const user = userEvent;
      
      const ConsumerWithUpdate = ({ id }) => {
        const [searchState, updateSearchState] = useSearch();

        return (
          <div>
            <div data-testid={`keyword-${id}`}>{searchState.keyword}</div>
            <button
              onClick={() => updateSearchState({ keyword: `from-${id}` })}
              data-testid={`update-${id}`}
            >
              Update
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <ConsumerWithUpdate id="1" />
          <ConsumerWithUpdate id="2" />
          <ConsumerWithUpdate id="3" />
        </SearchProvider>
      );

      // Update from consumer 1
      await user.click(screen.getByTestId("update-1"));

      await waitFor(() => {
        expect(screen.getByTestId("keyword-1")).toHaveTextContent("from-1");
        expect(screen.getByTestId("keyword-2")).toHaveTextContent("from-1");
        expect(screen.getByTestId("keyword-3")).toHaveTextContent("from-1");
      });

      // Update from consumer 3
      await user.click(screen.getByTestId("update-3"));

      await waitFor(() => {
        expect(screen.getByTestId("keyword-1")).toHaveTextContent("from-3");
        expect(screen.getByTestId("keyword-2")).toHaveTextContent("from-3");
        expect(screen.getByTestId("keyword-3")).toHaveTextContent("from-3");
      });
    });
  });

  describe("Complex Search Scenarios", () => {
    // NOTE: The test below was written with the help of an LLM
    it("handles sequential search operations with different queries", async () => {
      const user = userEvent;
      
      const TestSequentialComponent = () => {
        const [searchState, updateSearchState] = useSearch();

        const searchForLaptops = () => {
          updateSearchState({
            keyword: "laptop",
            results: [
              { _id: "1", name: "Gaming Laptop", price: 1500 },
              { _id: "2", name: "Business Laptop", price: 1200 }
            ]
          });
        };

        const searchForPhones = () => {
          updateSearchState({
            keyword: "phone",
            results: [
              { _id: "3", name: "Smartphone", price: 800 },
              { _id: "4", name: "Tablet", price: 600 }
            ]
          });
        };

        const refineSearch = () => {
          updateSearchState({
            keyword: "phone tablet",
            results: [{ _id: "4", name: "Tablet", price: 600 }]
          });
        };

        return (
          <div>
            <div data-testid="current-keyword">{searchState.keyword}</div>
            <div data-testid="current-results">
              {searchState.results.map(p => p.name).join(", ")}
            </div>
            <button onClick={searchForLaptops} data-testid="laptop-search">
              Search Laptops
            </button>
            <button onClick={searchForPhones} data-testid="phone-search">
              Search Phones
            </button>
            <button onClick={refineSearch} data-testid="refine-search">
              Refine Search
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestSequentialComponent />
        </SearchProvider>
      );

      // Initial state
      expect(screen.getByTestId("current-keyword")).toHaveTextContent("");
      expect(screen.getByTestId("current-results")).toHaveTextContent("");

      // Search for laptops
      await user.click(screen.getByTestId("laptop-search"));

      await waitFor(() => {
        expect(screen.getByTestId("current-keyword")).toHaveTextContent("laptop");
        expect(screen.getByTestId("current-results")).toHaveTextContent("Gaming Laptop, Business Laptop");
      });

      // Search for phones (should replace laptop results)
      await user.click(screen.getByTestId("phone-search"));

      await waitFor(() => {
        expect(screen.getByTestId("current-keyword")).toHaveTextContent("phone");
        expect(screen.getByTestId("current-results")).toHaveTextContent("Smartphone, Tablet");
      });

      // Refine search
      await user.click(screen.getByTestId("refine-search"));

      await waitFor(() => {
        expect(screen.getByTestId("current-keyword")).toHaveTextContent("phone tablet");
        expect(screen.getByTestId("current-results")).toHaveTextContent("Tablet");
      });
    });

    // NOTE: The test below was written with the help of an LLM
    it("handles empty search results correctly", async () => {
      const user = userEvent;
      
      const TestComponent = () => {
        const [searchState, updateSearchState] = useSearch();

        return (
          <div>
            <div data-testid="keyword">{searchState.keyword}</div>
            <div data-testid="results-count">{searchState.results.length}</div>
            <div data-testid="no-results">
              {searchState.results.length === 0 && searchState.keyword ? "No results found" : ""}
            </div>
            <button
              onClick={() => updateSearchState({ keyword: "nonexistent", results: [] })}
              data-testid="empty-search"
            >
              Empty Search
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      await user.click(screen.getByTestId("empty-search"));

      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("nonexistent");
        expect(screen.getByTestId("results-count")).toHaveTextContent("0");
        expect(screen.getByTestId("no-results")).toHaveTextContent("No results found");
      });
    });
  });

  describe("Context Value Stability", () => {
    // NOTE: The test below was written with the help of an LLM
    it("provides stable update function reference", () => {
      const updateFunctions = [];

      const TestComponent = () => {
        const [, updateSearchState] = useSearch();
        
        // Store reference on first render
        React.useEffect(() => {
          updateFunctions.push(updateSearchState);
        }, [updateSearchState]);

        return <div data-testid="test">Test</div>;
      };

      const { rerender } = render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      // Force re-render
      rerender(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      expect(updateFunctions.length).toBeGreaterThanOrEqual(1);
      expect(typeof updateFunctions[0]).toBe("function");
    });
  });

  describe("Edge Cases", () => {
    // NOTE: The test below was written with the help of an LLM
    it("handles updating with empty object", async () => {
      const user = userEvent;
      
      const TestComponent = () => {
        const [searchState, updateSearchState] = useSearch();

        return (
          <div>
            <div data-testid="keyword">{searchState.keyword}</div>
            <div data-testid="results-count">{searchState.results.length}</div>
            <button
              onClick={() => {
                updateSearchState({ keyword: "test" });
                updateSearchState({});
              }}
              data-testid="update-with-empty"
            >
              Update
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      await user.click(screen.getByTestId("update-with-empty"));

      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("test");
      });
      expect(screen.getByTestId("results-count")).toHaveTextContent("0");
    });

    // NOTE: The test below was written with the help of an LLM
    it("handles rapid successive updates", async () => {
      const user = userEvent;
      
      const TestComponent = () => {
        const [searchState, updateSearchState] = useSearch();

        const rapidUpdates = () => {
          updateSearchState({ keyword: "update1" });
          updateSearchState({ keyword: "update2" });
          updateSearchState({ keyword: "update3" });
        };

        return (
          <div>
            <div data-testid="keyword">{searchState.keyword}</div>
            <button onClick={rapidUpdates} data-testid="rapid-button">
              Rapid Updates
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      await user.click(screen.getByTestId("rapid-button"));

      // Should end up with the last update
      await waitFor(() => {
        expect(screen.getByTestId("keyword")).toHaveTextContent("update3");
      });
    });
  });
});