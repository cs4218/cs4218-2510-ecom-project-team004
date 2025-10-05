import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// NOTE: The test setup was written with the help of an LLM

// Mock dependencies
const mockNavigate = jest.fn();
const mockSetValues = jest.fn();
let mockValues = { keyword: '', results: [] };

const mockUseSearch = jest.fn(() => [mockValues, mockSetValues]);

jest.mock('../../context/search', () => ({
  useSearch: () => mockUseSearch(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(() => mockNavigate),
}));

jest.mock('axios', () => ({
  get: jest.fn(),
}));

import SearchInput from './SearchInput';
import axios from 'axios';

describe('SearchInput Component - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValues = { keyword: '', results: [] }; // reset between tests
    mockUseSearch.mockReturnValue([mockValues, mockSetValues]);
  });

  const renderSearchInput = () =>
    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

  describe('Structure', () => {
    // NOTE: The test below was written with the help of an LLM
    test('renders input with placeholder and button', () => {
      renderSearchInput();
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    // NOTE: The test below was written with the help of an LLM
    test('updates keyword on change', () => {
      renderSearchInput();
      const input = screen.getByPlaceholderText('Search');
      fireEvent.change(input, { target: { value: 'phone' } });
      expect(mockSetValues).toHaveBeenCalledWith({ ...mockValues, keyword: 'phone' });
    });

    // NOTE: The test below was written with the help of an LLM
    test('handles empty input gracefully', () => {
      // Start with non-empty keyword to test clearing it
      const initialValues = { keyword: 'test', results: [] };
      mockUseSearch.mockReturnValue([initialValues, mockSetValues]);

      renderSearchInput();
      const input = screen.getByPlaceholderText('Search');
      fireEvent.change(input, { target: { value: '' } });
      expect(mockSetValues).toHaveBeenCalledWith({ keyword: '', results: [] });
    });

    // NOTE: The test below was written with the help of an LLM
    test('handles long keyword input', () => {
      const longKeyword = 'a'.repeat(200);
      renderSearchInput();
      const input = screen.getByPlaceholderText('Search');
      fireEvent.change(input, { target: { value: longKeyword } });
      expect(mockSetValues).toHaveBeenCalledWith({ ...mockValues, keyword: longKeyword });
    });
  });

  describe('Form Submission', () => {
    // NOTE: The test below was written with the help of an LLM
    test('submits with valid keyword and updates results', async () => {
      // Set up mock values and axios response
      const testValues = { keyword: 'laptop', results: [] };
      mockUseSearch.mockReturnValue([testValues, mockSetValues]);
      const mockData = [{ id: 1, name: 'Laptop' }];
      axios.get.mockResolvedValueOnce({ data: mockData });

      renderSearchInput();

      // Use the correct role for the form
      const form = screen.getByRole('search');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/laptop');
        expect(mockSetValues).toHaveBeenCalledWith({ ...testValues, results: mockData });
        expect(mockNavigate).toHaveBeenCalledWith('/search');
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('does not submit when keyword is empty', async () => {
      const testValues = { keyword: '', results: [] };
      mockUseSearch.mockReturnValue([testValues, mockSetValues]);

      renderSearchInput();
      const form = screen.getByRole('search');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(axios.get).not.toHaveBeenCalled(); // Should NOT call API
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('logs error when API call fails', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
      const testValues = { keyword: 'errorcase', results: [] };
      mockUseSearch.mockReturnValue([testValues, mockSetValues]);
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      renderSearchInput();
      const form = screen.getByRole('search');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/errorcase');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    // NOTE: The test below was written with the help of an LLM
    test('handles unexpected API response by defaulting to empty array', async () => {
      const testValues = { keyword: 'test', results: [] };
      mockUseSearch.mockReturnValue([testValues, mockSetValues]);
      axios.get.mockResolvedValueOnce({}); // no data field

      renderSearchInput();
      const form = screen.getByRole('search');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSetValues).toHaveBeenCalledWith({
          ...testValues,
          results: [] // Should default to empty array, not undefined
        });
      });
    });
  });
});