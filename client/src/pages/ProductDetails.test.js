import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';

// NOTE: The test setup was written with the help of an LLM

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

const mockSetCart = jest.fn();
const mockCart = [];

jest.mock('../context/cart', () => ({
  useCart: jest.fn()
}));

import ProductDetails from './ProductDetails';
import { useCart } from '../context/cart';

// Test data

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
    useCart.mockReturnValue([mockCart, mockSetCart]);
  });

  // suppress logs in tests
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
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

  // NOTE: The test below was written with the help of an LLM
  test('Main product Add to Cart button exists and is clickable', async () => {
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
    });

    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });

    // First button should be the main product's button
    expect(addToCartButtons[0]).toBeEnabled();
    expect(addToCartButtons[0]).not.toBeDisabled();

    // Verify it doesn't throw when clicked
    expect(() => {
      fireEvent.click(addToCartButtons[0]);
    }).not.toThrow();
  });

  // NOTE: The test below was written with the help of an LLM
  test('Main product Add to Cart button calls setCart function', async () => {
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

    // Wait for product data to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument();
      expect(screen.getByText(`Name : ${mockProduct.name}`)).toBeInTheDocument();
    });

    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });
    // Click the first button (index 0) which is the main product's button
    fireEvent.click(addToCartButtons[0]);

    expect(mockSetCart).toHaveBeenCalledWith([mockProduct]);
    expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
  });

  // NOTE: The test below was written with the help of an LLM
  test('Main product handles missing price gracefully', async () => {
    const productWithoutPrice = {
      _id: '123',
      name: 'Test Product',
      description: 'A great product',
      price: undefined,
      category: { _id: 'cat123', name: 'Test Category' },
      slug: 'test-product',
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('get-product')) {
        return Promise.resolve({ data: { product: productWithoutPrice } });
      }
      if (url.includes('related-product')) {
        return Promise.resolve({ data: { products: [] } });
      }
    });

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument();
      expect(screen.getByText(`Name : ${productWithoutPrice.name}`)).toBeInTheDocument();
    });

    expect(screen.getByText('Price : $0.00')).toBeInTheDocument();
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
  test('Related product handles missing price gracefully', async () => {
    const relatedProductWithoutPrice = {
      _id: 'related-1',
      name: 'Mystery Product',
      price: undefined,
      slug: 'mystery-product',
      description: 'Unknown price',
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('get-product')) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url.includes('related-product')) {
        return Promise.resolve({ data: { products: [relatedProductWithoutPrice] } });
      }
    });

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      expect(screen.getByText('Mystery Product')).toBeInTheDocument();
    });

    // Check that price renders as $0.00 when undefined
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  // NOTE: The test below was written with the help of an LLM
  describe('Description length handling of Similar Products', () => {
    // NOTE: The test below was written with the help of an LLM
    it('handles product with missing description', async () => {
      const relatedProductWithoutDescription = {
        _id: 'related-1',
        name: 'Related Product',
        price: 49.99,
        slug: 'related-product',
        description: undefined,
      };

      axios.get.mockImplementation((url) => {
        if (url.includes('get-product')) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url.includes('related-product')) {
          return Promise.resolve({ data: { products: [relatedProductWithoutDescription] } });
        }
      });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(/No description\./i)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    it('handles product with description of length 0', async () => {
      const relatedProductWithEmptyDescription = {
        _id: 'related-1',
        name: 'Related Product',
        price: 49.99,
        slug: 'related-product',
        description: '',
      };

      axios.get.mockImplementation((url) => {
        if (url.includes('get-product')) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url.includes('related-product')) {
          return Promise.resolve({ data: { products: [relatedProductWithEmptyDescription] } });
        }
      });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(/No description\./i)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    it('handles product with description of length 1', async () => {
      const relatedProductWithShortDescription = {
        _id: 'related-1',
        name: 'Related Product',
        price: 49.99,
        slug: 'related-product',
        description: '~',
      };

      axios.get.mockImplementation((url) => {
        if (url.includes('get-product')) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url.includes('related-product')) {
          return Promise.resolve({ data: { products: [relatedProductWithShortDescription] } });
        }
      });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(/~/i)).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    it('handles product with description of length 59', async () => {
      const relatedProductWith59CharDescription = {
        _id: 'related-1',
        name: 'Related Product',
        price: 49.99,
        slug: 'related-product',
        description: '12345678901234567890123456789012345678901234567890123456789',
      };

      axios.get.mockImplementation((url) => {
        if (url.includes('get-product')) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url.includes('related-product')) {
          return Promise.resolve({ data: { products: [relatedProductWith59CharDescription] } });
        }
      });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(/12345678901234567890123456789012345678901234567890123456789/i)).toBeInTheDocument();
      });
    });

    it('handles product with description of length 60', async () => {
      const relatedProductWith60CharDescription = {
        _id: 'related-1',
        name: 'Related Product',
        price: 49.99,
        slug: 'related-product',
        description: '123456789012345678901234567890123456789012345678901234567890',
      };

      axios.get.mockImplementation((url) => {
        if (url.includes('get-product')) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url.includes('related-product')) {
          return Promise.resolve({ data: { products: [relatedProductWith60CharDescription] } });
        }
      });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(/123456789012345678901234567890123456789012345678901234567890/i)).toBeInTheDocument();
      });
    });

    it('handles product with description of length 61', async () => {
      const relatedProductWith61CharDescription = {
        _id: 'related-1',
        name: 'Related Product',
        price: 49.99,
        slug: 'related-product',
        description: '1234567890123456789012345678901234567890123456789012345678901',
      };

      axios.get.mockImplementation((url) => {
        if (url.includes('get-product')) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url.includes('related-product')) {
          return Promise.resolve({ data: { products: [relatedProductWith61CharDescription] } });
        }
      });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(/123456789012345678901234567890123456789012345678901234567890\.\.\./i)).toBeInTheDocument();
      });
    });
  });

  describe('Similar Products Button Functionality', () => {
    const sampleRelatedProducts = [
      {
        _id: 'related-1',
        name: 'Related Product 1',
        price: 49.99,
        slug: 'related-product-1',
        description: 'A related product description',
      },
      {
        _id: 'related-2',
        name: 'Related Product 2',
        price: 79.99,
        slug: 'related-product-2',
        description: 'Another related product description',
      },
    ];

    beforeEach(() => {
      // Re-establish the mock for this nested describe block
      useCart.mockReturnValue([mockCart, mockSetCart]);

      axios.get.mockImplementation((url) => {
        if (url.includes('get-product')) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url.includes('related-product')) {
          return Promise.resolve({ data: { products: sampleRelatedProducts } });
        }
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('More Details button exists and is clickable for each product', async () => {
      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Related Product 1')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button', { name: /more details/i });
      expect(buttons).toHaveLength(2);
      buttons.forEach(button => {
        expect(button).toBeEnabled();
        expect(button).not.toBeDisabled();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('More Details button navigates to product page', async () => {
      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Related Product 1')).toBeInTheDocument();
      });

      const moreDetailsButtons = screen.getAllByRole('button', { name: /more details/i });
      // First button is for the first related product
      fireEvent.click(moreDetailsButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith(`/product/${sampleRelatedProducts[0].slug}`);
    });

    // NOTE: The test below was written with the help of an LLM
    test('Add to Cart button exists and is clickable for each product', async () => {
      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Related Product 1')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button', { name: /add to cart/i });
      expect(buttons).toHaveLength(3); // 1 for main product + 2 for related products

      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('Add to Cart button calls setCart function', async () => {
      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Related Product 1')).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });
      // Click the second button (index 1) which is the first related product
      fireEvent.click(addToCartButtons[1]);

      expect(mockSetCart).toHaveBeenCalledWith([sampleRelatedProducts[0]]);
    });

    // NOTE: The test below was written with the help of an LLM
    test('clicking buttons does not cause errors', async () => {
      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Related Product 1')).toBeInTheDocument();
      });

      const moreDetailsButtons = screen.getAllByRole('button', { name: /more details/i });
      const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });

      // Should not throw errors even without handlers
      expect(() => {
        fireEvent.click(moreDetailsButtons[0]);
        fireEvent.click(addToCartButtons[0]);
      }).not.toThrow();
    });
  });
});