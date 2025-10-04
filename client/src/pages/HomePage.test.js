// THOUGHT: SHould I write a test "Filter by Price can be removed"? Or is this a design choice?... Currently the user can remove filter by resetting, but very annoying.

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// NOTE: The test setup was written with the help of an LLM

// Create mock functions
const mockNavigate = jest.fn();
const mockSetCart = jest.fn();
const mockCart = [];
const mockToastSuccess = jest.fn();
const mockReload = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(() => mockNavigate),
    useLocation: jest.fn(() => ({ pathname: '/' })),
}));

// Mock cart context
jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [mockCart, mockSetCart]),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
    },
}));

// Mock Layout component
jest.mock('./../components/Layout', () => ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
        {children}
    </div>
));

// Mock Prices component
jest.mock('../components/Prices', () => ({
    Prices: [
        { _id: 1, name: '$0 to $19', array: [0, 19] },
        { _id: 2, name: '$20 to $39', array: [20, 39] },
        { _id: 3, name: '$40 to $59', array: [40, 59] }
    ]
}));

// Mock window.location.reload
Object.defineProperty(window, 'location', {
    value: { reload: mockReload },
    writable: true
});

// Mock localStorage
const mockLocalStorage = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
});

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

// Import HomePage and toast after all mocks are set up
import HomePage from './HomePage';
import toast from 'react-hot-toast';

// And the tests begin...
describe('HomePage Component - Unit Tests', () => {

    let axios;

    const createMockCategories = () => [
        { _id: 'cat1', name: 'Electronics' },
        { _id: 'cat2', name: 'Clothing' },
        { _id: 'cat3', name: 'Books' }
    ];

    const createMockProducts = (count = 3) =>
        Array.from({ length: count }, (_, i) => ({
            _id: `prod${i + 1}`,
            name: `Product ${i + 1}`,
            price: (i + 1) * 10,
            description: `Description for product ${i + 1}`.repeat(10),
            slug: `product-${i + 1}`
        }));

    // Added this to use in a test in order to avoid: "Encountered two children with the same key"
    const createMockProducts2 = (count = 3, startIndex = 0) =>
        Array.from({ length: count }, (_, i) => ({
            _id: `prod${startIndex + i + 1}`,
            name: `Product ${startIndex + i + 1}`,
            price: (startIndex + i + 1) * 10,
            description: `Description for product ${startIndex + i + 1}`.repeat(10),
            slug: `product-${startIndex + i + 1}`
        }));

    const setupDefaultMocks = (categoryCount = 3, productCount = 3, totalCount = 10) => {
        axios.get.mockImplementation((url) => {
            if (url === '/api/v1/category/get-category') {
                return Promise.resolve({
                    data: { success: true, category: categoryCount > 0 ? createMockCategories().slice(0, categoryCount) : [] }
                });
            }
            if (url === '/api/v1/product/product-count') {
                return Promise.resolve({ data: { total: totalCount } });
            }
            if (url.includes('/api/v1/product/product-list/')) {
                return Promise.resolve({
                    data: { products: createMockProducts(productCount) }
                });
            }
            return Promise.resolve({ data: {} });
        });

        axios.post.mockResolvedValue({
            data: { products: createMockProducts(2) }
        });
    };

    beforeEach(() => {
        axios = require('axios');
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    const renderHomePage = () => {
        return render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
    };

    describe('Component Structure', () => {
        // NOTE: The test below was written with the help of an LLM
        test('renders layout with correct title', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'ALL Products - Best offers ');
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('renders banner image with correct attributes', async () => {
            renderHomePage();
            const bannerImage = screen.getByAltText('bannerimage');

            await waitFor(() => {
                expect(bannerImage).toHaveAttribute('src', '/images/Virtual.png');
                expect(bannerImage).toHaveAttribute('width', '100%');
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('renders filter section', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Filter By Category')).toBeInTheDocument();
                expect(screen.getByText('Filter By Price')).toBeInTheDocument();
            });
        });
    });

    describe('Initial Load Behavior', () => {
        // NOTE: The test below was written with the help of an LLM
        test('makes correct API calls on component mount', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-count');
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
            });

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('displays categories after successful load', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Electronics')).toBeInTheDocument();
                expect(screen.getByText('Clothing')).toBeInTheDocument();
                expect(screen.getByText('Books')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('displays products after successful load', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 2')).toBeInTheDocument();
                expect(screen.getByText('Product 3')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText('Electronics')).toBeInTheDocument();
            });
        });
    });

    describe('Category Filter Behavior - Exhaustive Testing', () => {
        // Test all single category selections (3 tests)
        describe('Single Category Selection', () => {
            // NOTE: The test below was written with the help of an LLM
            test('selects Electronics only', async () => {
                const electronicsProducts = [
                    { _id: 'elec1', name: 'Laptop', price: 50, description: 'A laptop computer', slug: 'laptop' },
                    { _id: 'elec2', name: 'Phone', price: 75, description: 'A mobile phone', slug: 'phone' }
                ];

                axios.post.mockResolvedValue({ data: { products: electronicsProducts } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                act(() => {
                    fireEvent.click(screen.getByLabelText('Electronics'));
                });

                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat1'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('Laptop')).toBeInTheDocument();
                    expect(screen.getByText('Phone')).toBeInTheDocument();
                });

                expect(screen.queryByText('Product 1')).not.toBeInTheDocument();

                await waitFor(() => {
                    const buttons = screen.getAllByText('ADD TO CART');
                    expect(buttons).toHaveLength(2);
                });
            });

            // NOTE: The test below was written with the help of an LLM
            test('selects Clothing only', async () => {
                const clothingProducts = [
                    { _id: 'cloth1', name: 'T-Shirt', price: 20, description: 'Cotton t-shirt', slug: 't-shirt' },
                    { _id: 'cloth2', name: 'Jeans', price: 40, description: 'Blue jeans', slug: 'jeans' }
                ];

                axios.post.mockResolvedValue({ data: { products: clothingProducts } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                act(() => {
                    fireEvent.click(screen.getByLabelText('Clothing'));
                });

                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat2'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('T-Shirt')).toBeInTheDocument();
                    expect(screen.getByText('Jeans')).toBeInTheDocument();
                });
            });

            // NOTE: The test below was written with the help of an LLM
            test('selects Books only', async () => {
                const booksProducts = [
                    { _id: 'book1', name: 'Fiction Novel', price: 15, description: 'Bestselling fiction', slug: 'fiction-novel' },
                    { _id: 'book2', name: 'Cookbook', price: 25, description: 'Recipe book', slug: 'cookbook' }
                ];

                axios.post.mockResolvedValue({ data: { products: booksProducts } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                act(() => {
                    fireEvent.click(screen.getByLabelText('Books'));
                });

                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat3'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('Fiction Novel')).toBeInTheDocument();
                    expect(screen.getByText('Cookbook')).toBeInTheDocument();
                });
            });
        });

        // Test all two-category combinations
        describe('Two Category Combinations', () => {
            // NOTE: The test below was written with the help of an LLM
            test('selects Electronics AND Clothing', async () => {
                const combinedProducts = [
                    { _id: 'elec1', name: 'Smartwatch', price: 100, description: 'Smart wearable', slug: 'smartwatch' },
                    { _id: 'cloth1', name: 'Jacket', price: 80, description: 'Winter jacket', slug: 'jacket' }
                ];

                axios.post.mockResolvedValue({ data: { products: combinedProducts } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                act(() => {
                    fireEvent.click(screen.getByLabelText('Electronics'));
                    fireEvent.click(screen.getByLabelText('Clothing'));
                });

                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat1', 'cat2'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('Smartwatch')).toBeInTheDocument();
                    expect(screen.getByText('Jacket')).toBeInTheDocument();
                });

                const addToCartButtons = screen.getAllByText('ADD TO CART');
                expect(addToCartButtons).toHaveLength(2);
            });

            // NOTE: The test below was written with the help of an LLM
            test('selects Electronics AND Books', async () => {
                const combinedProducts = [
                    { _id: 'elec1', name: 'E-Reader', price: 120, description: 'Digital reader', slug: 'e-reader' },
                    { _id: 'book1', name: 'Tech Manual', price: 30, description: 'Programming guide', slug: 'tech-manual' }
                ];

                axios.post.mockResolvedValue({ data: { products: combinedProducts } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                act(() => {
                    fireEvent.click(screen.getByLabelText('Electronics'));
                    fireEvent.click(screen.getByLabelText('Books'));
                });

                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat1', 'cat3'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('E-Reader')).toBeInTheDocument();
                    expect(screen.getByText('Tech Manual')).toBeInTheDocument();
                });
            });

            // NOTE: The test below was written with the help of an LLM
            test('selects Clothing AND Books', async () => {
                const combinedProducts = [
                    { _id: 'cloth1', name: 'Book Bag', price: 35, description: 'Carry bag', slug: 'book-bag' },
                    { _id: 'book1', name: 'Fashion Magazine', price: 10, description: 'Style guide', slug: 'fashion-mag' }
                ];

                axios.post.mockResolvedValue({ data: { products: combinedProducts } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                act(() => {
                    fireEvent.click(screen.getByLabelText('Clothing'));
                    fireEvent.click(screen.getByLabelText('Books'));
                });

                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat2', 'cat3'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('Book Bag')).toBeInTheDocument();
                    expect(screen.getByText('Fashion Magazine')).toBeInTheDocument();
                });
            });
        });

        // Test all three categories selected
        describe('All Categories Selected', () => {
            // NOTE: The test below was written with the help of an LLM
            test('selects Electronics AND Clothing AND Books', async () => {
                const allCategoryProducts = [
                    { _id: 'elec1', name: 'Tablet', price: 200, description: 'Reading tablet', slug: 'tablet' },
                    { _id: 'cloth1', name: 'Reading Glasses Case', price: 15, description: 'Protective case', slug: 'glasses-case' },
                    { _id: 'book1', name: 'Novel', price: 18, description: 'Fiction book', slug: 'novel' }
                ];

                axios.post.mockResolvedValue({ data: { products: allCategoryProducts } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                act(() => {
                    fireEvent.click(screen.getByLabelText('Electronics'));
                    fireEvent.click(screen.getByLabelText('Clothing'));
                    fireEvent.click(screen.getByLabelText('Books'));
                });

                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat1', 'cat2', 'cat3'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('Tablet')).toBeInTheDocument();
                    expect(screen.getByText('Reading Glasses Case')).toBeInTheDocument();
                    expect(screen.getByText('Novel')).toBeInTheDocument();
                });

                const addToCartButtons = screen.getAllByText('ADD TO CART');
                expect(addToCartButtons).toHaveLength(3);
            });
        });

        // Test deselection scenarios
        describe('Category Deselection', () => {
            // NOTE: The test below was written with the help of an LLM
            test('deselects single category to return to all products', async () => {
                const allProducts = createMockProducts(5);
                const filteredProducts = [
                    { _id: 'filtered1', name: 'Filtered Item', price: 50, description: 'Filtered', slug: 'filtered' }
                ];

                axios.get.mockImplementation((url) => {
                    if (url === '/api/v1/category/get-category') {
                        return Promise.resolve({ data: { success: true, category: createMockCategories() } });
                    }
                    if (url === '/api/v1/product/product-count') {
                        return Promise.resolve({ data: { total: 5 } });
                    }
                    if (url.includes('/api/v1/product/product-list/')) {
                        return Promise.resolve({ data: { products: allProducts } });
                    }
                    return Promise.resolve({ data: {} });
                });

                axios.post.mockResolvedValue({ data: { products: filteredProducts } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                const electronicsCheckbox = screen.getByLabelText('Electronics');

                act(() => {
                    fireEvent.click(electronicsCheckbox);
                });

                await waitFor(() => {
                    expect(screen.getByText('Filtered Item')).toBeInTheDocument();
                });

                act(() => {
                    fireEvent.click(electronicsCheckbox);
                });

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                    expect(screen.getByText('Product 2')).toBeInTheDocument();
                    expect(screen.getByText('Product 5')).toBeInTheDocument();
                });

                expect(screen.queryByText('Filtered Item')).not.toBeInTheDocument();
            });

            // NOTE: The test below was written with the help of an LLM
            test('removes one category from multiple selections', async () => {
                const twoCategories = [
                    { _id: 'prod1', name: 'Product A', price: 50, description: 'From two cats', slug: 'prod-a' },
                    { _id: 'prod2', name: 'Product B', price: 60, description: 'From two cats', slug: 'prod-b' }
                ];

                const oneCategory = [
                    { _id: 'prod3', name: 'Product C', price: 70, description: 'From one cat', slug: 'prod-c' }
                ];

                // Mock based on the checked array content
                axios.post.mockImplementation((url, data) => {
                    const { checked } = data;
                    // Two categories selected
                    if (checked.length === 2) {
                        return Promise.resolve({ data: { products: twoCategories } });
                    }
                    // One category selected
                    if (checked.length === 1) {
                        return Promise.resolve({ data: { products: oneCategory } });
                    }
                    return Promise.resolve({ data: { products: [] } });
                });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                // Select two categories
                act(() => {
                    fireEvent.click(screen.getByLabelText('Electronics'));
                });

                // Wait for first category to process
                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalled();
                });

                act(() => {
                    fireEvent.click(screen.getByLabelText('Clothing'));

                });

                // Wait for two-category filter to apply
                await waitFor(() => {
                    expect(axios.post).toHaveBeenLastCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat1', 'cat2'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('Product A')).toBeInTheDocument();
                    expect(screen.getByText('Product B')).toBeInTheDocument();
                });

                // Clear previous calls for clearer assertions
                jest.clearAllMocks();

                // Deselect one category
                act(() => {
                    fireEvent.click(screen.getByLabelText('Clothing'));
                });

                await waitFor(() => {
                    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                        checked: ['cat1'],
                        radio: []
                    });
                });

                await waitFor(() => {
                    expect(screen.getByText('Product C')).toBeInTheDocument();
                });

                expect(screen.queryByText('Product A')).not.toBeInTheDocument();
                expect(screen.queryByText('Product B')).not.toBeInTheDocument();
            });

            // NOTE: The test below was written with the help of an LLM
            test('deselects all categories from three selections', async () => {
                const allProducts = createMockProducts(5);
                const threeCategories = [
                    { _id: 'multi1', name: 'Multi Product', price: 100, description: 'All cats', slug: 'multi-1' }
                ];

                axios.get.mockImplementation((url) => {
                    if (url === '/api/v1/category/get-category') {
                        return Promise.resolve({ data: { success: true, category: createMockCategories() } });
                    }
                    if (url === '/api/v1/product/product-count') {
                        return Promise.resolve({ data: { total: 5 } });
                    }
                    if (url.includes('/api/v1/product/product-list/')) {
                        return Promise.resolve({ data: { products: allProducts } });
                    }
                    return Promise.resolve({ data: {} });
                });

                axios.post.mockResolvedValue({ data: { products: threeCategories } });

                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                });

                // Select all three
                act(() => {
                    fireEvent.click(screen.getByLabelText('Electronics'));
                    fireEvent.click(screen.getByLabelText('Clothing'));
                    fireEvent.click(screen.getByLabelText('Books'));
                });

                await waitFor(() => {
                    expect(screen.getByText('Multi Product')).toBeInTheDocument();
                });

                // Deselect all three
                act(() => {
                    fireEvent.click(screen.getByLabelText('Electronics'));
                    fireEvent.click(screen.getByLabelText('Clothing'));
                    fireEvent.click(screen.getByLabelText('Books'));
                });

                await waitFor(() => {
                    expect(screen.getByText('Product 1')).toBeInTheDocument();
                    expect(screen.getByText('Product 5')).toBeInTheDocument();
                });

                expect(screen.queryByText('Multi Product')).not.toBeInTheDocument();
            });
        });

        // Test checkbox state management
        describe('Checkbox State Management', () => {
            // NOTE: The test below was written with the help of an LLM
            test('checkboxes maintain correct checked state', async () => {
                renderHomePage();

                await waitFor(() => {
                    expect(screen.getByText('Electronics')).toBeInTheDocument();
                });

                const electronicsCheckbox = screen.getByLabelText('Electronics');
                const clothingCheckbox = screen.getByLabelText('Clothing');
                const booksCheckbox = screen.getByLabelText('Books');

                // Initially unchecked
                expect(electronicsCheckbox).not.toBeChecked();
                expect(clothingCheckbox).not.toBeChecked();
                expect(booksCheckbox).not.toBeChecked();

                // Check Electronics
                act(() => {
                    fireEvent.click(electronicsCheckbox);
                });
                await waitFor(() => {
                    expect(electronicsCheckbox).toBeChecked();
                });
                expect(clothingCheckbox).not.toBeChecked();
                expect(booksCheckbox).not.toBeChecked();

                // Check Clothing too
                act(() => {
                    fireEvent.click(clothingCheckbox);
                });
                await waitFor(() => {
                    expect(electronicsCheckbox).toBeChecked();
                    expect(clothingCheckbox).toBeChecked();
                });
                expect(booksCheckbox).not.toBeChecked();

                // Uncheck Electronics
                act(() => {
                    fireEvent.click(electronicsCheckbox);
                });
                await waitFor(() => {
                    expect(electronicsCheckbox).not.toBeChecked();
                });
                expect(clothingCheckbox).toBeChecked();
                expect(booksCheckbox).not.toBeChecked();
            });
        });
    });

    describe('Price Filter Behavior', () => {
        // NOTE: The test below was written with the help of an LLM
        test('displays only products in selected price range', async () => {
            const cheapProducts = [
                { _id: 'cheap1', name: 'Cheap Item 1', price: 10, description: 'Affordable product', slug: 'cheap-1' },
                { _id: 'cheap2', name: 'Cheap Item 2', price: 15, description: 'Budget friendly', slug: 'cheap-2' }
            ];

            axios.post.mockResolvedValue({ data: { products: cheapProducts } });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('$0 to $19'));
            });

            await waitFor(() => {
                expect(screen.getByText('Cheap Item 1')).toBeInTheDocument();
                expect(screen.getByText('Cheap Item 2')).toBeInTheDocument();
            });

            expect(screen.queryByText('Product 1')).not.toBeInTheDocument();

            await waitFor(() => {
                const addToCartButtons = screen.getAllByText('ADD TO CART');
                expect(addToCartButtons).toHaveLength(2);
            });
        });
    });

    describe('Category and Price Filter Behavior', () => {
        // NOTE: The test below was written with the help of an LLM
        test('Electronics + $0 to $19 filter', async () => {
            const filteredProducts = [
                { _id: 'cheap-elec', name: 'USB Cable', price: 10, description: 'Charging cable', slug: 'usb-cable' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat1') && radio.length === 2 && radio[0] === 0) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
                fireEvent.click(screen.getByLabelText('$0 to $19'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat1'],
                    radio: [0, 19]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('USB Cable')).toBeInTheDocument();
            });

            const addToCartButtons = screen.getAllByText('ADD TO CART');
            expect(addToCartButtons).toHaveLength(1);
        });

        // NOTE: The test below was written with the help of an LLM
        test('Electronics + $20 to $39 filter', async () => {
            const filteredProducts = [
                { _id: 'mid-elec', name: 'Wireless Mouse', price: 25, description: 'Ergonomic mouse', slug: 'wireless-mouse' },
                { _id: 'mid-elec2', name: 'Keyboard', price: 35, description: 'Mechanical keyboard', slug: 'keyboard' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat1') && radio.length === 2 && radio[0] === 20) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
                fireEvent.click(screen.getByLabelText('$20 to $39'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat1'],
                    radio: [20, 39]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
                expect(screen.getByText('Keyboard')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('Electronics + $40 to $59 filter', async () => {
            const filteredProducts = [
                { _id: 'exp-elec', name: 'Gaming Headset', price: 55, description: 'Premium audio', slug: 'gaming-headset' },
                { _id: 'exp-elec2', name: 'Webcam', price: 45, description: 'HD camera', slug: 'webcam' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat1') && radio.length === 2 && radio[0] === 40) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
                fireEvent.click(screen.getByLabelText('$40 to $59'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat1'],
                    radio: [40, 59]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Gaming Headset')).toBeInTheDocument();
                expect(screen.getByText('Webcam')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('Clothing + $20 to $39 filter', async () => {
            const filteredProducts = [
                { _id: 'mid-cloth', name: 'T-Shirt', price: 25, description: 'Cotton shirt', slug: 't-shirt' },
                { _id: 'mid-cloth2', name: 'Socks Pack', price: 20, description: '5-pack socks', slug: 'socks' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat2') && radio.length === 2 && radio[0] === 20) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Clothing'));
                fireEvent.click(screen.getByLabelText('$20 to $39'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat2'],
                    radio: [20, 39]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('T-Shirt')).toBeInTheDocument();
                expect(screen.getByText('Socks Pack')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('Clothing + $40 to $59 filter', async () => {
            const filteredProducts = [
                { _id: 'exp-cloth', name: 'Designer Jeans', price: 55, description: 'Premium denim', slug: 'designer-jeans' },
                { _id: 'exp-cloth2', name: 'Leather Belt', price: 45, description: 'Genuine leather', slug: 'leather-belt' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat2') && radio.length === 2 && radio[0] === 40) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Clothing'));
                fireEvent.click(screen.getByLabelText('$40 to $59'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat2'],
                    radio: [40, 59]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Designer Jeans')).toBeInTheDocument();
                expect(screen.getByText('Leather Belt')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('Clothing + $0 to $19 filter', async () => {
            const filteredProducts = [
                { _id: 'cheap-cloth', name: 'Basic Tee', price: 12, description: 'Plain cotton', slug: 'basic-tee' },
                { _id: 'cheap-cloth2', name: 'Cap', price: 15, description: 'Baseball cap', slug: 'cap' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat2') && radio.length === 2 && radio[0] === 0) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Clothing'));
                fireEvent.click(screen.getByLabelText('$0 to $19'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat2'],
                    radio: [0, 19]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Basic Tee')).toBeInTheDocument();
                expect(screen.getByText('Cap')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('Books + $40 to $59 filter', async () => {
            const filteredProducts = [
                { _id: 'exp-book', name: 'Textbook', price: 55, description: 'University textbook', slug: 'textbook' },
                { _id: 'exp-book2', name: 'Box Set', price: 48, description: 'Novel series', slug: 'box-set' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat3') && radio.length === 2 && radio[0] === 40) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Books'));
                fireEvent.click(screen.getByLabelText('$40 to $59'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat3'],
                    radio: [40, 59]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Textbook')).toBeInTheDocument();
                expect(screen.getByText('Box Set')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('Books + $0 to $19 filter', async () => {
            const filteredProducts = [
                { _id: 'cheap-book', name: 'Paperback Novel', price: 12, description: 'Fiction book', slug: 'paperback' },
                { _id: 'cheap-book2', name: 'Magazine', price: 8, description: 'Monthly issue', slug: 'magazine' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat3') && radio.length === 2 && radio[0] === 0) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Books'));
                fireEvent.click(screen.getByLabelText('$0 to $19'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat3'],
                    radio: [0, 19]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Paperback Novel')).toBeInTheDocument();
                expect(screen.getByText('Magazine')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('Books + $20 to $39 filter', async () => {
            const filteredProducts = [
                { _id: 'mid-book', name: 'Biography', price: 28, description: 'Life story', slug: 'biography' },
                { _id: 'mid-book2', name: 'Travel Guide', price: 22, description: 'City guidebook', slug: 'travel-guide' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat3') && radio.length === 2 && radio[0] === 20) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Books'));
                fireEvent.click(screen.getByLabelText('$20 to $39'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat3'],
                    radio: [20, 39]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Biography')).toBeInTheDocument();
                expect(screen.getByText('Travel Guide')).toBeInTheDocument();
            });
        });

        // Test changing price while category is selected
        // NOTE: The test below was written with the help of an LLM
        test('changes price filter while category is active', async () => {
            const lowPriceProducts = [
                { _id: 'low1', name: 'Cheap Item', price: 15, description: 'Budget product', slug: 'cheap-item' }
            ];

            const midPriceProducts = [
                { _id: 'mid1', name: 'Mid Item', price: 30, description: 'Mid-range product', slug: 'mid-item' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.includes('cat1')) {
                    if (radio[0] === 0) {
                        return Promise.resolve({ data: { products: lowPriceProducts } });
                    }
                    if (radio[0] === 20) {
                        return Promise.resolve({ data: { products: midPriceProducts } });
                    }
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            // Select category and first price
            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
                fireEvent.click(screen.getByLabelText('$0 to $19'));
            });

            await waitFor(() => {
                expect(screen.getByText('Cheap Item')).toBeInTheDocument();
            });

            // Change to different price range
            act(() => {
                fireEvent.click(screen.getByLabelText('$20 to $39'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat1'],
                    radio: [20, 39]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Mid Item')).toBeInTheDocument();
            });

            expect(screen.queryByText('Cheap Item')).not.toBeInTheDocument();
        });

        // Test multiple categories with one price
        // NOTE: The test below was written with the help of an LLM
        test('multiple categories with single price filter', async () => {
            const filteredProducts = [
                { _id: 'multi1', name: 'Electronics Item', price: 25, description: 'Tech product', slug: 'elec-item' },
                { _id: 'multi2', name: 'Clothing Item', price: 30, description: 'Fashion product', slug: 'cloth-item' }
            ];

            axios.post.mockImplementation((url, data) => {
                const { checked, radio } = data;
                if (checked.length === 2 && checked.includes('cat1') && checked.includes('cat2') && radio[0] === 20) {
                    return Promise.resolve({ data: { products: filteredProducts } });
                }
                return Promise.resolve({ data: { products: [] } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
                fireEvent.click(screen.getByLabelText('Clothing'));
                fireEvent.click(screen.getByLabelText('$20 to $39'));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                    checked: ['cat1', 'cat2'],
                    radio: [20, 39]
                });
            });

            await waitFor(() => {
                expect(screen.getByText('Electronics Item')).toBeInTheDocument();
                expect(screen.getByText('Clothing Item')).toBeInTheDocument();
            });
        });
    });

    describe('Reset Functionality', () => {
        // NOTE: The test below was written with the help of an LLM
        test('reloads page when reset button is clicked', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('RESET FILTERS')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByText('RESET FILTERS'));
            });

            expect(mockReload).toHaveBeenCalled();
        });
    });

    describe('Load More Functionality', () => {
        // NOTE: The test below was written with the help of an LLM
        test('shows load more button when products count is less than total', async () => {
            setupDefaultMocks(0, 3, 10);

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText(/Loadmore/)).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('hides load more button when all products are loaded', async () => {
            setupDefaultMocks(0, 3, 3);

            renderHomePage();

            await waitFor(() => {
                expect(screen.queryByText(/Loadmore/)).not.toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('loads next page when load more button is clicked', async () => {
            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: [] } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 10 } });
                }
                if (url === '/api/v1/product/product-list/1') {
                    return Promise.resolve({ data: { products: createMockProducts2(3, 0) } });
                }
                if (url === '/api/v1/product/product-list/2') {
                    return Promise.resolve({ data: { products: createMockProducts2(2, 3) } });
                }
                return Promise.resolve({ data: {} });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText(/Loadmore/)).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));

            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
            });

            await waitFor(() => {
                const buttons = screen.getAllByText('ADD TO CART');
                expect(buttons.length).toBeGreaterThan(3);
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test("hides load more button when products are filtered", async () => {
            setupDefaultMocks(3, 10, 100);

            axios.post.mockResolvedValue({
                data: {
                    products: [
                        { _id: 'filtered1', name: 'Filtered Product 1', price: 50, description: 'Filtered desc 1', slug: 'filtered-1' },
                        { _id: 'filtered2', name: 'Filtered Product 2', price: 75, description: 'Filtered desc 2', slug: 'filtered-2' }
                    ]
                }
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            const electronicsCheckbox = screen.getByText('Electronics');
            act(() => {
                fireEvent.click(electronicsCheckbox);
            });

            await waitFor(() => {
                expect(screen.getByText('Filtered Product 1')).toBeInTheDocument();
            });

            const loadMoreButton = screen.queryByText(/loadmore/i);
            expect(loadMoreButton).not.toBeInTheDocument();
        });

        // NOTE: The test below was written with the help of an LLM
        test('load more works correctly after unchecking all category filters', async () => {
            const page1Products = [
                { _id: 'prod1', name: 'Product 1', price: 10, description: 'Page 1 item 1', slug: 'product-1' },
                { _id: 'prod2', name: 'Product 2', price: 20, description: 'Page 1 item 2', slug: 'product-2' }
            ];

            const page2Products = [
                { _id: 'prod3', name: 'Product 3', price: 30, description: 'Page 2 item 1', slug: 'product-3' },
                { _id: 'prod4', name: 'Product 4', price: 40, description: 'Page 2 item 2', slug: 'product-4' }
            ];

            const filteredProducts = [
                { _id: 'filtered1', name: 'Filtered Item', price: 50, description: 'Category filtered', slug: 'filtered-1' }
            ];

            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: createMockCategories() } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 4 } });
                }
                if (url === '/api/v1/product/product-list/1') {
                    return Promise.resolve({ data: { products: page1Products } });
                }
                if (url === '/api/v1/product/product-list/2') {
                    return Promise.resolve({ data: { products: page2Products } });
                }
                return Promise.resolve({ data: {} });
            });

            axios.post.mockResolvedValue({ data: { products: filteredProducts } });

            renderHomePage();

            // Wait for initial load
            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 2')).toBeInTheDocument();
                expect(screen.getByText(/Loadmore/)).toBeInTheDocument();
            });

            // Apply category filter
            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
            });

            await waitFor(() => {
                expect(screen.getByText('Filtered Item')).toBeInTheDocument();
            });

            // Verify load more button is hidden when filtered
            expect(screen.queryByText(/Loadmore/)).not.toBeInTheDocument();

            // Uncheck the category filter
            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
            });

            // Verify products reload and load more button reappears
            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 2')).toBeInTheDocument();
                expect(screen.getByText(/Loadmore/)).toBeInTheDocument();
            });

            // Verify filtered product is gone
            expect(screen.queryByText('Filtered Item')).not.toBeInTheDocument();

            // Clear mock calls to track load more behavior
            jest.clearAllMocks();

            // Click load more to verify it still works
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
            });

            await waitFor(() => {
                expect(screen.getByText('Product 3')).toBeInTheDocument();
                expect(screen.getByText('Product 4')).toBeInTheDocument();
            });

            // Verify all products from both pages are visible
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
            expect(screen.getByText('Product 3')).toBeInTheDocument();
            expect(screen.getByText('Product 4')).toBeInTheDocument();

            // Verify load more button is now hidden (all products loaded)
            expect(screen.queryByText(/Loadmore/)).not.toBeInTheDocument();
        });

        // NOTE: The test below was written with the help of an LLM
        test('can load more multiple times through many pages', async () => {
            const page1Products = [
                { _id: 'prod1', name: 'Product 1', price: 10, description: 'Page 1 item', slug: 'product-1' },
                { _id: 'prod2', name: 'Product 2', price: 20, description: 'Page 1 item', slug: 'product-2' }
            ];

            const page2Products = [
                { _id: 'prod3', name: 'Product 3', price: 30, description: 'Page 2 item', slug: 'product-3' },
                { _id: 'prod4', name: 'Product 4', price: 40, description: 'Page 2 item', slug: 'product-4' }
            ];

            const page3Products = [
                { _id: 'prod5', name: 'Product 5', price: 50, description: 'Page 3 item', slug: 'product-5' },
                { _id: 'prod6', name: 'Product 6', price: 60, description: 'Page 3 item', slug: 'product-6' }
            ];

            const page4Products = [
                { _id: 'prod7', name: 'Product 7', price: 70, description: 'Page 4 item', slug: 'product-7' },
                { _id: 'prod8', name: 'Product 8', price: 80, description: 'Page 4 item', slug: 'product-8' }
            ];

            const page5Products = [
                { _id: 'prod9', name: 'Product 9', price: 90, description: 'Page 5 item', slug: 'product-9' }
            ];

            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: [] } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 9 } });
                }
                if (url === '/api/v1/product/product-list/1') {
                    return Promise.resolve({ data: { products: page1Products } });
                }
                if (url === '/api/v1/product/product-list/2') {
                    return Promise.resolve({ data: { products: page2Products } });
                }
                if (url === '/api/v1/product/product-list/3') {
                    return Promise.resolve({ data: { products: page3Products } });
                }
                if (url === '/api/v1/product/product-list/4') {
                    return Promise.resolve({ data: { products: page4Products } });
                }
                if (url === '/api/v1/product/product-list/5') {
                    return Promise.resolve({ data: { products: page5Products } });
                }
                return Promise.resolve({ data: {} });
            });

            renderHomePage();

            // Verify page 1 loads
            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 2')).toBeInTheDocument();
                expect(screen.getByText(/Loadmore/)).toBeInTheDocument();
            });

            // Load page 2
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
                expect(screen.getByText('Product 3')).toBeInTheDocument();
                expect(screen.getByText('Product 4')).toBeInTheDocument();
            });

            // Verify page 1 products still visible
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
            expect(screen.getByText(/Loadmore/)).toBeInTheDocument();

            // Load page 3
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/3');
                expect(screen.getByText('Product 5')).toBeInTheDocument();
                expect(screen.getByText('Product 6')).toBeInTheDocument();
            });

            // Verify all previous products still visible
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 4')).toBeInTheDocument();
            expect(screen.getByText(/Loadmore/)).toBeInTheDocument();

            // Load page 4
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/4');
                expect(screen.getByText('Product 7')).toBeInTheDocument();
                expect(screen.getByText('Product 8')).toBeInTheDocument();
            });

            // Verify cumulative products
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 6')).toBeInTheDocument();
            expect(screen.getByText(/Loadmore/)).toBeInTheDocument();

            // Load page 5 (final page)
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/5');
                expect(screen.getByText('Product 9')).toBeInTheDocument();
            });

            // Verify all 9 products are visible
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
            expect(screen.getByText('Product 3')).toBeInTheDocument();
            expect(screen.getByText('Product 4')).toBeInTheDocument();
            expect(screen.getByText('Product 5')).toBeInTheDocument();
            expect(screen.getByText('Product 6')).toBeInTheDocument();
            expect(screen.getByText('Product 7')).toBeInTheDocument();
            expect(screen.getByText('Product 8')).toBeInTheDocument();
            expect(screen.getByText('Product 9')).toBeInTheDocument();

            // Verify load more button is now hidden (all products loaded)
            expect(screen.queryByText(/Loadmore/)).not.toBeInTheDocument();

            // Verify correct number of buttons
            const addToCartButtons = screen.getAllByText('ADD TO CART');
            expect(addToCartButtons).toHaveLength(9);

            const moreDetailsButtons = screen.getAllByText('More Details');
            expect(moreDetailsButtons).toHaveLength(9);
        });
    });

    describe('Cart Functionality', () => {
        // NOTE: The test below was written with the help of an LLM
        test('adds product to cart when ADD TO CART button is clicked', async () => {
            const mockProducts = createMockProducts(3);

            renderHomePage();

            await waitFor(() => {
                expect(screen.getAllByText('ADD TO CART')).toHaveLength(3);
            });

            const addToCartButtons = screen.getAllByText('ADD TO CART');

            act(() => {
                fireEvent.click(addToCartButtons[0]);
            });

            expect(mockSetCart).toHaveBeenCalledWith([mockProducts[0]]);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify([mockProducts[0]]));
            expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
        });

        // NOTE: The test below was written with the help of an LLM
        test('adds correct product to cart when specific product ADD TO CART is clicked', async () => {
            const mockProducts = createMockProducts(3);

            renderHomePage();

            await waitFor(() => {
                expect(screen.getAllByText('ADD TO CART')).toHaveLength(3);
            });

            const addToCartButtons = screen.getAllByText('ADD TO CART');

            act(() => {
                fireEvent.click(addToCartButtons[1]);
            });

            expect(mockSetCart).toHaveBeenCalledWith([mockProducts[1]]);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify([mockProducts[1]]));
            expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
        });

        // NOTE: The test below was written with the help of an LLM
        test('handles single product ADD TO CART correctly', async () => {
            setupDefaultMocks(0, 1, 1);

            const mockProducts = createMockProducts(1);

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('ADD TO CART')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByText('ADD TO CART'));
            });

            expect(mockSetCart).toHaveBeenCalledWith([mockProducts[0]]);
        });
    });

    describe('Page Number State Management', () => {
        // NOTE: The test below was written with the help of an LLM
        test('page starts at 1 on initial load', async () => {
            setupDefaultMocks(0, 3, 10);

            renderHomePage();

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
            });

            // Verify that only page 1 was called on initial mount
            expect(axios.get).not.toHaveBeenCalledWith('/api/v1/product/product-list/2');
        });

        // NOTE: The test below was written with the help of an LLM
        test('increments page number when load more is clicked', async () => {
            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: [] } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 10 } });
                }
                if (url === '/api/v1/product/product-list/1') {
                    return Promise.resolve({ data: { products: createMockProducts(3) } });
                }
                if (url === '/api/v1/product/product-list/2') {
                    return Promise.resolve({
                        data: {
                            products: [
                                { _id: 'prod4', name: 'Product 4', price: 40, description: 'Description 4', slug: 'product-4' },
                                { _id: 'prod5', name: 'Product 5', price: 50, description: 'Description 5', slug: 'product-5' }
                            ]
                        }
                    });
                }
                return Promise.resolve({ data: {} });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            // Clear previous calls for clearer tracking
            jest.clearAllMocks();

            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
            });

            await waitFor(() => {
                expect(screen.getByText('Product 4')).toBeInTheDocument();
                expect(screen.getByText('Product 5')).toBeInTheDocument();
            });

            // Verify products from page 1 are still displayed
            expect(screen.getByText('Product 1')).toBeInTheDocument();
        });

        // NOTE: The test below was written with the help of an LLM
        test('page number is reset after applying filter', async () => {
            const initialProducts = createMockProducts(3);
            const filteredProducts = [
                { _id: 'filtered1', name: 'Filtered Product 1', price: 25, description: 'Filtered desc', slug: 'filtered-1' }
            ];

            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: createMockCategories() } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 10 } });
                }
                if (url === '/api/v1/product/product-list/1') {
                    return Promise.resolve({ data: { products: initialProducts } });
                }
                if (url === '/api/v1/product/product-list/2') {
                    return Promise.resolve({
                        data: {
                            products: [
                                { _id: 'prod4', name: 'Product 4', price: 40, description: 'Description 4', slug: 'product-4' }
                            ]
                        }
                    });
                }
                return Promise.resolve({ data: {} });
            });

            axios.post.mockResolvedValue({ data: { products: filteredProducts } });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            });

            // Click load more to increment page to 2
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(screen.getByText('Product 4')).toBeInTheDocument();
            });

            // Verify we're on page 2
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');

            // Apply a filter
            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
            });

            await waitFor(() => {
                expect(screen.getByText('Filtered Product 1')).toBeInTheDocument();
            });

            // Verify that when filter is applied, page is implicitly reset
            // (no new pagination calls should be made with page > 1 after filter)
            expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
                checked: ['cat1'],
                radio: []
            });

            // Original paginated products should no longer be visible
            expect(screen.queryByText('Product 4')).not.toBeInTheDocument();
        });

        // NOTE: The test below was written with the help of an LLM
        test('tracks correct products through pagination lifecycle', async () => {
            const page1Products = [
                { _id: 'prod1', name: 'Product 1', price: 10, description: 'Page 1 item 1', slug: 'product-1' },
                { _id: 'prod2', name: 'Product 2', price: 20, description: 'Page 1 item 2', slug: 'product-2' }
            ];

            const page2Products = [
                { _id: 'prod3', name: 'Product 3', price: 30, description: 'Page 2 item 1', slug: 'product-3' },
                { _id: 'prod4', name: 'Product 4', price: 40, description: 'Page 2 item 2', slug: 'product-4' }
            ];

            const page3Products = [
                { _id: 'prod5', name: 'Product 5', price: 50, description: 'Page 3 item 1', slug: 'product-5' }
            ];

            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: [] } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 5 } });
                }
                if (url === '/api/v1/product/product-list/1') {
                    return Promise.resolve({ data: { products: page1Products } });
                }
                if (url === '/api/v1/product/product-list/2') {
                    return Promise.resolve({ data: { products: page2Products } });
                }
                if (url === '/api/v1/product/product-list/3') {
                    return Promise.resolve({ data: { products: page3Products } });
                }
                return Promise.resolve({ data: {} });
            });

            renderHomePage();

            // Verify page 1 products
            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 2')).toBeInTheDocument();
            });

            // Load page 2
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(screen.getByText('Product 3')).toBeInTheDocument();
                expect(screen.getByText('Product 4')).toBeInTheDocument();
            });

            // Verify page 1 products are still visible
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();

            // Load page 3
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(screen.getByText('Product 5')).toBeInTheDocument();
            });

            // Verify all products from all pages are visible
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
            expect(screen.getByText('Product 3')).toBeInTheDocument();
            expect(screen.getByText('Product 4')).toBeInTheDocument();
            expect(screen.getByText('Product 5')).toBeInTheDocument();

            // Verify load more button is now hidden (all products loaded)
            expect(screen.queryByText(/Loadmore/)).not.toBeInTheDocument();

            // Verify correct number of "ADD TO CART" buttons (one per product)
            const addToCartButtons = screen.getAllByText('ADD TO CART');
            expect(addToCartButtons).toHaveLength(5);
        });
    });

    describe('Navigation Functionality', () => {
        // NOTE: The test below was written with the help of an LLM
        test('navigates to product details when More Details button is clicked', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getAllByText('More Details')).toHaveLength(3);
            });

            const moreDetailsButtons = screen.getAllByText('More Details');

            act(() => {
                fireEvent.click(moreDetailsButtons[0]);
            });

            expect(mockNavigate).toHaveBeenCalledWith('/product/product-1');
        });

        // NOTE: The test below was written with the help of an LLM
        test('navigates to correct product when specific More Details button is clicked', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getAllByText('More Details')).toHaveLength(3);
            });

            const moreDetailsButtons = screen.getAllByText('More Details');

            act(() => {
                fireEvent.click(moreDetailsButtons[1]);
            });

            expect(mockNavigate).toHaveBeenCalledWith('/product/product-2');
        });

        // NOTE: The test below was written with the help of an LLM
        test('handles single product More Details correctly', async () => {
            setupDefaultMocks(0, 1, 1);

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('More Details')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByText('More Details'));

            });

            expect(mockNavigate).toHaveBeenCalledWith('/product/product-1');
        });
    });

    describe('Error Handling', () => {
        // NOTE: The test below was written with the help of an LLM
        test('handles category loading error gracefully', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            const error = new Error('Category fetch failed');

            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.reject(error);
                }
                return Promise.resolve({ data: {} });
            });

            renderHomePage();

            await waitFor(() => {
                expect(consoleLogSpy).toHaveBeenCalledWith(error);
            });

            consoleLogSpy.mockRestore();
        });

        // NOTE: The test below was written with the help of an LLM
        test('handles product loading error gracefully', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            const error = new Error('Product fetch failed');

            axios.get.mockImplementation((url) => {
                if (url.includes('/api/v1/product/product-list/')) {
                    return Promise.reject(error);
                }
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: [] } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 0 } });
                }
                return Promise.resolve({ data: {} });
            });

            renderHomePage();

            await waitFor(() => {
                expect(consoleLogSpy).toHaveBeenCalledWith(error);
            });

            consoleLogSpy.mockRestore();
        });

        // NOTE: The test below was written with the help of an LLM
        test('handles filter API error gracefully', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            const error = new Error('Filter API failed');

            axios.post.mockRejectedValue(error);

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Electronics')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
            });

            await waitFor(() => {
                expect(consoleLogSpy).toHaveBeenCalledWith(error);
            });

            consoleLogSpy.mockRestore();
        });
    });

    describe('Edge Cases', () => {
        // NOTE: The test below was written with the help of an LLM
        test('handles empty categories response', async () => {
            setupDefaultMocks(0, 0, 0);

            renderHomePage();

            await waitFor(() => {
                expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('handles empty products response', async () => {
            setupDefaultMocks(0, 0, 0);

            renderHomePage();

            await waitFor(() => {
                expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
                expect(screen.queryByText(/Loadmore/)).not.toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('truncates long product descriptions correctly', async () => {
            const longDescription = 'A'.repeat(100);
            const productWithLongDesc = [{
                _id: 'prod1',
                name: 'Product 1',
                price: 10,
                description: longDescription,
                slug: 'product-1'
            }];

            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: [] } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 1 } });
                }
                if (url.includes('/api/v1/product/product-list/')) {
                    return Promise.resolve({ data: { products: productWithLongDesc } });
                }
                return Promise.resolve({ data: {} });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('A'.repeat(60) + '...')).toBeInTheDocument();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('restores correct state after load more, filter, then clear filter sequence', async () => {
            const page1Products = [
                { _id: 'prod1', name: 'Product 1', price: 10, description: 'Page 1 item 1', slug: 'product-1' },
                { _id: 'prod2', name: 'Product 2', price: 20, description: 'Page 1 item 2', slug: 'product-2' }
            ];

            const page2Products = [
                { _id: 'prod3', name: 'Product 3', price: 30, description: 'Page 2 item 1', slug: 'product-3' },
                { _id: 'prod4', name: 'Product 4', price: 40, description: 'Page 2 item 2', slug: 'product-4' }
            ];

            const filteredProducts = [
                { _id: 'filtered1', name: 'Filtered Item', price: 50, description: 'Category filtered', slug: 'filtered-1' }
            ];

            axios.get.mockImplementation((url) => {
                if (url === '/api/v1/category/get-category') {
                    return Promise.resolve({ data: { success: true, category: createMockCategories() } });
                }
                if (url === '/api/v1/product/product-count') {
                    return Promise.resolve({ data: { total: 10 } });
                }
                if (url === '/api/v1/product/product-list/1') {
                    return Promise.resolve({ data: { products: page1Products } });
                }
                if (url === '/api/v1/product/product-list/2') {
                    return Promise.resolve({ data: { products: page2Products } });
                }
                return Promise.resolve({ data: {} });
            });

            axios.post.mockResolvedValue({ data: { products: filteredProducts } });

            renderHomePage();

            // Step 1: Initial load - verify page 1
            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 2')).toBeInTheDocument();
                expect(screen.getByText(/Loadmore/)).toBeInTheDocument();
            });

            // Step 2: Click load more to get page 2
            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(screen.getByText('Product 3')).toBeInTheDocument();
                expect(screen.getByText('Product 4')).toBeInTheDocument();
            });

            // Verify we have products from both pages
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
            expect(screen.getByText('Product 3')).toBeInTheDocument();
            expect(screen.getByText('Product 4')).toBeInTheDocument();

            // Step 3: Apply category filter
            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
            });

            await waitFor(() => {
                expect(screen.getByText('Filtered Item')).toBeInTheDocument();
            });

            // Verify paginated products are no longer visible
            expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
            expect(screen.queryByText('Product 4')).not.toBeInTheDocument();

            // Verify load more is hidden during filtering
            expect(screen.queryByText(/Loadmore/)).not.toBeInTheDocument();

            // Step 4: Clear the category filter
            act(() => {
                fireEvent.click(screen.getByLabelText('Electronics'));
            });

            // Step 5: Verify state is reset to initial load (only page 1, not page 1+2)
            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 2')).toBeInTheDocument();
            });

            // CRITICAL: Page 2 products should NOT be visible after filter clear
            // This is the bug - the state should reset as if the page was freshly loaded
            expect(screen.queryByText('Product 3')).not.toBeInTheDocument();
            expect(screen.queryByText('Product 4')).not.toBeInTheDocument();

            // Verify filtered product is gone
            expect(screen.queryByText('Filtered Item')).not.toBeInTheDocument();

            // Verify load more button reappears
            expect(screen.getByText(/Loadmore/)).toBeInTheDocument();

            // Verify correct number of products (only from page 1)
            const addToCartButtons = screen.getAllByText('ADD TO CART');
            expect(addToCartButtons).toHaveLength(2);

            // Step 6: Verify load more still works after the sequence
            jest.clearAllMocks();

            act(() => {
                fireEvent.click(screen.getByText(/Loadmore/));
            });

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
            });

            await waitFor(() => {
                expect(screen.getByText('Product 3')).toBeInTheDocument();
                expect(screen.getByText('Product 4')).toBeInTheDocument();
            });

            // Verify all products are now visible
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
            expect(screen.getByText('Product 3')).toBeInTheDocument();
            expect(screen.getByText('Product 4')).toBeInTheDocument();
        });
    });
});