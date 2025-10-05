import React, { useState, useContext, createContext } from "react"; // FIXED: Added import for "React"

const SearchContext = createContext();
const SearchProvider = ({ children }) => {
  const [searchState, setSearchState] = useState({ // Should be searching related state and setter?
    keyword: "",
    results: [],
  });
  
  // FIXED: Changed how state is updated to merge instead of replace
  // NOTE: This logic was written with the help of an LLM
  // Wrapper function that merges updates instead of replacing
  const updateSearchState = (updates) => {
    setSearchState(prevState => ({
      ...prevState,
      ...updates
    }));
  };

  return (
    <SearchContext.Provider value={[searchState, updateSearchState]}>
      {children}
    </SearchContext.Provider>
  );
};

// custom hook
// const useSearch = () => useContext(SearchContext);
// FIXED: Added error handling
const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export { useSearch, SearchProvider };