import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CategoryProduct from './CategoryProduct';

// NOTE: The test setup was written with the help of an LLM

// axios
jest.mock('axios');

// react-hot-toast
jest.mock('react-hot-toast');

// custom hooks & context
jest.mock('../hooks/useCategory', () => jest.fn(() => []));
jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock('../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]),
}));

// react-router useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// localStorage shim
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// matchMedia shim
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};

const mockData = {
  products: [
    {
      _id: '1',
      name: 'Test Product',
      price: 99.99,
      description: 'This is a test product',
      slug: 'test-product',
    },
  ],
  category: { name: 'Test Category' },
};

const renderWithRouter = (slug = 'test-category') =>
  render(
    <MemoryRouter initialEntries={[`/category/${slug}`]}>
      <Routes>
        <Route path="/category/:slug" element={<CategoryProduct />} />
      </Routes>
    </MemoryRouter>
  );

describe('categoryProduct Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // NOTE: The test below was written with the help of an LLM
  it('renders category name and product count', async () => {
    axios.get.mockResolvedValueOnce({ data: mockData });

    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText(/Category - Test Category/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/1 result found/i)).toBeInTheDocument();
    });
  });

  // NOTE: The test below was written with the help of an LLM
  it('renders product details', async () => {
    axios.get.mockResolvedValueOnce({ data: mockData });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(
        screen.getByText(/This is a test product/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /More Details/i })
      ).toBeInTheDocument();
    });
  });

  // NOTE: The test below was written with the help of an LLM
  it('navigates to product detail page on button click', async () => {
    axios.get.mockResolvedValueOnce({ data: mockData });

    renderWithRouter();

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /More Details/i });
      fireEvent.click(btn);
      expect(mockNavigate).toHaveBeenCalledWith('/product/test-product');
    });
  });

  // NOTE: The test below was written with the help of an LLM
  it('handles empty product list', async () => {
    axios.get.mockResolvedValueOnce({
      data: { products: [], category: { name: 'Empty Category' } },
    });

    renderWithRouter('empty-category');

    await waitFor(() => {
      expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Category - Empty Category/i)
      ).toBeInTheDocument();
    });
  });

  // The test below is a design choice of good practice right?
  // NOTE: The test below was written with the help of an LLM
  // it('shows toast on fetch error', async () => {
  //   axios.get.mockRejectedValueOnce(new Error('Fetch failed'));

  //   renderWithRouter();

  //   await waitFor(() => {
  //     expect(toast.error).toHaveBeenCalledWith(
  //       'Failed to load products for this category'
  //     );
  //   });
  // });
});

// ADD TO CART was commented out - is this something to test or is it a design choice?
// LOAD MORE was commented out - is this something to test or is it a design choice?