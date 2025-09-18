import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import ProductDetails from './ProductDetails';

// NOTE: The test setup was written with the help of an LLM

// Mocks
jest.mock('axios');
jest.mock('react-hot-toast');

// Mock Layout wrapper
jest.mock('../components/Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="mock-layout">{children}</div>;
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test Data

const mockProduct = {
  _id: '123',
  name: 'Test Product',
  description: 'A great product',
  price: 99.99,
  category: { _id: 'cat123', name: 'Test Category' },
  slug: 'test-product',
};

const mockRelatedProducts = [
  {
    _id: '456',
    name: 'Related Product',
    description: 'Related product description',
    price: 49.99,
    slug: 'related-product',
  },
];

describe('productDetails Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // suppress logs in tests
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  const renderWithRouter = (slug = 'test-product') => {
    return render(
      <MemoryRouter initialEntries={[`/product/${slug}`]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // NOTE: The test below was written with the help of an LLM
  it('renders product details correctly', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url.includes('related-product')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
    });

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument();
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Description : ${mockProduct.description}`)).toBeInTheDocument();
      expect(screen.getByText('Category : Test Category')).toBeInTheDocument();
    });
  });

  // NOTE: The test below was written with the help of an LLM
  it('renders related products', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url.includes('related-product')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
    });

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      expect(screen.getByText('Similar Products ➡️')).toBeInTheDocument();
      expect(screen.getByText('Related Product')).toBeInTheDocument();
    });
  });

  // NOTE: The test below was written with the help of an LLM
  it('shows fallback when no related products', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url.includes('related-product')) {
        return Promise.resolve({ data: { products: [] } });
      }
    });

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      expect(screen.getByText('No Similar Products found')).toBeInTheDocument();
    });
  });

  // NOTE: The test below was written with the help of an LLM
  it('navigates to product detail on button click', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url.includes('related-product')) {
        return Promise.resolve({ data: { products: mockRelatedProducts } });
      }
    });

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      const button = screen.getByText('More Details');
      fireEvent.click(button);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/product/related-product');
  });

  // NOTE: The test below was written with the help of an LLM
  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      // simply ensures layout renders without crashing
      expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    });
  });
});

// Should ADD TO CART button be tested to make sure it works or is that integration testing?
// ADD TO CART for Similar Products was commented out - is this something to test or is it a design choice?