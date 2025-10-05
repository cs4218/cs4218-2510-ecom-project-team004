import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
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
window.matchMedia = window.matchMedia || function () {
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

  // suppress logs in tests
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  // NOTE: The test below was written with the help of an LLM
  it('renders category name and product count', async () => {
    axios.get.mockResolvedValueOnce({ data: mockData });

    await act(async () => {
      renderWithRouter();
    });

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

    await act(async () => {
      renderWithRouter();
    });

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

    await act(async () => {
      renderWithRouter();
    });

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

    await act(async () => {
      renderWithRouter('empty-category');
    });

    await waitFor(() => {
      expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Category - Empty Category/i)
      ).toBeInTheDocument();
    });
  });

  // NOTE: The test below was written with the help of an LLM
  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      // Verify the component renders without crashing
      expect(screen.getByText(/Category -/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Products', () => {
    const multipleProductsData = {
      products: [
        {
          _id: '1',
          name: 'Product One',
          price: 49.99,
          description: 'First product description',
          slug: 'product-one',
        },
        {
          _id: '2',
          name: 'Product Two',
          price: 79.99,
          description: 'Second product description',
          slug: 'product-two',
        },
        {
          _id: '3',
          name: 'Product Three',
          price: 129.99,
          description: 'Third product description',
          slug: 'product-three',
        },
      ],
      category: { name: 'Electronics' },
    };

    // NOTE: The test below was written with the help of an LLM
    it('renders multiple products correctly', async () => {
      axios.get.mockResolvedValueOnce({ data: multipleProductsData });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(/3 result found/i)).toBeInTheDocument();
        expect(screen.getByText('Product One')).toBeInTheDocument();
        expect(screen.getByText('Product Two')).toBeInTheDocument();
        expect(screen.getByText('Product Three')).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('More Details button exists and is clickable for each product', async () => {
      axios.get.mockResolvedValueOnce({ data: multipleProductsData });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Product One')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button', { name: /more details/i });
      expect(buttons).toHaveLength(3);

      buttons.forEach(button => {
        expect(button).toBeEnabled();
        expect(button).not.toBeDisabled();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    test('clicking buttons does not cause errors', async () => {
      axios.get.mockResolvedValueOnce({ data: multipleProductsData });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Product One')).toBeInTheDocument();
      });

      const moreDetailsButtons = screen.getAllByRole('button', { name: /more details/i });

      expect(() => {
        fireEvent.click(moreDetailsButtons[0]);
        fireEvent.click(moreDetailsButtons[1]);
        fireEvent.click(moreDetailsButtons[2]);
      }).not.toThrow();
    });
  });

  describe('Price Handling', () => {
    // NOTE: The test below was written with the help of an LLM
    test('handles missing price gracefully', async () => {
      const productWithoutPrice = {
        products: [
          {
            _id: '1',
            name: 'No Price Product',
            price: undefined,
            description: 'Product without price',
            slug: 'no-price-product',
          },
        ],
        category: { name: 'Test Category' },
      };

      axios.get.mockResolvedValueOnce({ data: productWithoutPrice });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('No Price Product')).toBeInTheDocument();
      });

      // Component should render without crashing even with undefined price
      expect(screen.getByText(/Product without price/i)).toBeInTheDocument();
    });

    // NOTE: The test below was written with the help of an LLM
    test('formats price correctly', async () => {
      axios.get.mockResolvedValueOnce({ data: mockData });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('$99.99')).toBeInTheDocument();
      });
    });
  });

  describe('Description Length Handling', () => {
    // NOTE: The test below was written with the help of an LLM
    it('handles product with missing description', async () => {
      const productWithoutDescription = {
        products: [
          {
            _id: '1',
            name: 'No Description Product',
            price: 49.99,
            description: undefined,
            slug: 'no-description-product',
          },
        ],
        category: { name: 'Test Category' },
      };

      axios.get.mockResolvedValueOnce({ data: productWithoutDescription });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('No description.')).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    it('handles product with description of length 0', async () => {
      const productWithEmptyDescription = {
        products: [
          {
            _id: '1',
            name: 'Empty Description Product',
            price: 49.99,
            description: '',
            slug: 'empty-description-product',
          },
        ],
        category: { name: 'Test Category' },
      };

      axios.get.mockResolvedValueOnce({ data: productWithEmptyDescription });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Empty Description Product')).toBeInTheDocument();
      });
    });

    it('handles product with description of length 1', async () => {
      const productWithShortDescription = {
        products: [
          {
            _id: '1',
            name: 'Short Description Product',
            price: 49.99,
            description: 'X',
            slug: 'short-description-product',
          },
        ],
        category: { name: 'Test Category' },
      };

      axios.get.mockResolvedValueOnce({ data: productWithShortDescription });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Short Description Product')).toBeInTheDocument();
        // Should show just "X" without "..." since it's under 60 chars
        const cardText = screen.getByText('X');
        expect(cardText).toBeInTheDocument();
        expect(cardText.className).toContain('card-text');
      });
    });

    // NOTE: The test below was written with the help of an LLM
    it('handles product with description of length 59', async () => {
      const description59 = '12345678901234567890123456789012345678901234567890123456789';
      const productWith59CharDescription = {
        products: [
          {
            _id: '1',
            name: 'Product 59',
            price: 49.99,
            description: description59,
            slug: 'product-59',
          },
        ],
        category: { name: 'Test Category' },
      };

      axios.get.mockResolvedValueOnce({ data: productWith59CharDescription });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(new RegExp(description59.substring(0, 59), 'i'))).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    it('handles product with description of length 60', async () => {
      const description60 = '123456789012345678901234567890123456789012345678901234567890';
      const productWith60CharDescription = {
        products: [
          {
            _id: '1',
            name: 'Product 60',
            price: 49.99,
            description: description60,
            slug: 'product-60',
          },
        ],
        category: { name: 'Test Category' },
      };

      axios.get.mockResolvedValueOnce({ data: productWith60CharDescription });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText(new RegExp(description60.substring(0, 60), 'i'))).toBeInTheDocument();
      });
    });

    // NOTE: The test below was written with the help of an LLM
    it('handles product with description of length 61', async () => {
      const description61 = '1234567890123456789012345678901234567890123456789012345678901';
      const productWith61CharDescription = {
        products: [
          {
            _id: '1',
            name: 'Product 61',
            price: 49.99,
            description: description61,
            slug: 'product-61',
          },
        ],
        category: { name: 'Test Category' },
      };

      axios.get.mockResolvedValueOnce({ data: productWith61CharDescription });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        // Should be truncated at 60 characters
        expect(screen.getByText(new RegExp(description61.substring(0, 60) + '\\.\\.\\.', 'i'))).toBeInTheDocument();
      });
    });
  });

  describe('Add to Cart Functionality', () => {
    const mockSetCart = jest.fn();
    const mockCart = [];

    beforeEach(() => {
      // Mock useCart to return our test values
      const { useCart } = require('../context/cart');
      useCart.mockReturnValue([mockCart, mockSetCart]);
    });

    // NOTE: The test below was written with the help of an LLM
    test('Add to Cart button exists for each product', async () => {
      axios.get.mockResolvedValueOnce({ data: mockData });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });
      expect(addToCartButtons).toHaveLength(1);
      expect(addToCartButtons[0]).toBeEnabled();
    });

    // NOTE: The test below was written with the help of an LLM
    test('Add to Cart button calls setCart with product', async () => {
      axios.get.mockResolvedValueOnce({ data: mockData });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });

      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addToCartButton);

      expect(mockSetCart).toHaveBeenCalledWith([mockData.products[0]]);
      expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
    });

    // NOTE: The test below was written with the help of an LLM
    test('Add to Cart works with multiple products', async () => {
      const multipleProducts = {
        products: [
          { _id: '1', name: 'Product 1', price: 10, description: 'Desc 1', slug: 'p1' },
          { _id: '2', name: 'Product 2', price: 20, description: 'Desc 2', slug: 'p2' },
        ],
        category: { name: 'Test' },
      };

      axios.get.mockResolvedValueOnce({ data: multipleProducts });

      await act(async () => {
        renderWithRouter();
      });

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });
      expect(addToCartButtons).toHaveLength(2);

      fireEvent.click(addToCartButtons[0]);
      expect(mockSetCart).toHaveBeenCalledWith([multipleProducts.products[0]]);

      fireEvent.click(addToCartButtons[1]);
      expect(mockSetCart).toHaveBeenCalledWith([multipleProducts.products[1]]);
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

// ADD TO CART was commented out - is this something to test or is it a design choice? -- Considered for consistency across pages
// LOAD MORE was commented out - is this something to test or is it a design choice? -- No need i'd say