import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// NOTE: The test setup was written with the help of an LLM

// Mock dependencies

jest.mock('./../components/Layout', () => ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
        {children}
    </div>
));

let mockValues = { keyword: '', results: [] };
const mockSetValues = jest.fn();

jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [mockValues, mockSetValues]),
}));

const mockNavigate = jest.fn();
const mockCart = [];
const mockSetCart = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(),
}));

import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/cart';
import Search from './Search';

describe('Search Component Tests', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
            throw new Error(msg, ...args);
        });
        jest.spyOn(console, 'warn').mockImplementation((msg, ...args) => {
            throw new Error(msg, ...args);
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockValues = { keyword: '', results: [] };

        useNavigate.mockReturnValue(mockNavigate);
        useCart.mockReturnValue([mockCart, mockSetCart]);
    });


    const renderSearch = () => render(<Search />);

    describe('Structure', () => {
        // NOTE: The test below was written with the help of an LLM
        test('renders Layout with correct title', () => {
            renderSearch();
            expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'Search results');
        });
        // NOTE: The test below was written with the help of an LLM
        test('renders heading and subheading', () => {
            renderSearch();
            expect(screen.getByRole('heading', { name: /search results/i })).toBeInTheDocument();
            expect(screen.getByText(/no products found/i)).toBeInTheDocument();
        });
    });

    describe('No Results Case', () => {
        // NOTE: The test below was written with the help of an LLM
        test('displays "No Products Found" when results array is empty', () => {
            mockValues = { keyword: 'phone', results: [] };
            renderSearch();
            expect(screen.getByText(/no products found/i)).toBeInTheDocument();
        });
    });

    describe('Results Present', () => {
        const sampleProducts = [
            {
                _id: 'p1',
                name: 'Laptop',
                description: 'A very powerful laptop for developers',
                price: 1200,
            },
            {
                _id: 'p2',
                name: 'Phone',
                description: 'A smartphone with a great camera',
                price: 800,
            },
        ];

        beforeEach(() => {
            mockValues = { keyword: 'tech', results: sampleProducts };
        });

        // NOTE: The test below was written with the help of an LLM
        test('displays correct count when results exist', () => {
            renderSearch();
            expect(screen.getByText(/found 2/i)).toBeInTheDocument();
        });
        // NOTE: The test below was written with the help of an LLM
        test('renders product cards with correct content', () => {
            renderSearch();

            sampleProducts.forEach((p) => {
                // Title
                expect(screen.getByText(p.name)).toBeInTheDocument();

                // Description truncated
                expect(screen.getByText(new RegExp(p.description.substring(0, 30)))).toBeInTheDocument();

                // Price
                expect(screen.getByText(`$ ${p.price}`)).toBeInTheDocument();

                // Image
                const img = screen.getByAltText(p.name);
                expect(img).toHaveAttribute('src', `/api/v1/product/product-photo/${p._id}`);
            });
        });
        // NOTE: The test below was written with the help of an LLM
        test('renders action buttons for each product', () => {
            renderSearch();
            expect(screen.getAllByRole('button', { name: /more details/i })).toHaveLength(2);
            expect(screen.getAllByRole('button', { name: /add to cart/i })).toHaveLength(2);
        });
    });

    describe('Description length handling', () => {
        test('handles product with missing description', () => {
            mockValues = {
                keyword: 'nodefault',
                results: [{ _id: 'p5', name: 'Widget', description: undefined, price: 50 }],
            };
            renderSearch();
            expect(screen.getByText(/No description./i)).toBeInTheDocument();
        });
        test('handles product with description of length 0', () => {
            mockValues = {
                keyword: 'nodefault',
                results: [{ _id: 'p5', name: 'Widget', description: '', price: 50 }],
            };
            renderSearch();
            expect(screen.getByText(/widget/i)).toBeInTheDocument();
        });
        test('handles product with description of length 1', () => {
            mockValues = {
                keyword: 'nodefault',
                results: [{ _id: 'p5', name: 'Widget', description: '~', price: 50 }],
            };
            renderSearch();
            expect(screen.getByText(/~/i)).toBeInTheDocument();
        });
        test('handles product with description of length 29', () => {
            mockValues = {
                keyword: 'nodefault',
                results: [{ _id: 'p5', name: 'Widget', description: '12345678901234567890123456789', price: 50 }],
            };
            renderSearch();
            expect(screen.getByText(/12345678901234567890123456789/i)).toBeInTheDocument();
        });
        test('handles product with description of length 30', () => {
            mockValues = {
                keyword: 'nodefault',
                results: [{ _id: 'p5', name: 'Widget', description: '123456789012345678901234567890', price: 50 }],
            };
            renderSearch();
            expect(screen.getByText(/123456789012345678901234567890/i)).toBeInTheDocument();
        });
        test('handles product with description of length 31', () => {
            mockValues = {
                keyword: 'nodefault',
                results: [{ _id: 'p5', name: 'Widget', description: '1234567890123456789012345678901', price: 50 }],
            };
            renderSearch();
            expect(screen.getByText(/123456789012345678901234567890.../i)).toBeInTheDocument();
        });
    })

    describe('Button Functionality', () => {
        const sampleProducts = [
            {
                _id: 'p1',
                slug: 'laptop',
                name: 'Laptop',
                description: 'A very powerful laptop for developers',
                price: 1200,
            },
        ];

        beforeEach(() => {
            mockValues = { keyword: 'tech', results: sampleProducts };

            mockNavigate.mockClear();
            mockSetCart.mockClear();
        });

        // NOTE: The test below was written with the help of an LLM
        test('More Details button navigates to product page', () => {
            renderSearch();

            const moreDetailsButton = screen.getByRole('button', { name: /more details/i });
            fireEvent.click(moreDetailsButton);

            expect(mockNavigate).toHaveBeenCalledWith(`/product/${sampleProducts[0].slug}`);
        });

        // NOTE: The test below was written with the help of an LLM
        test('Add to Cart button calls setCart function', () => {
            renderSearch();

            const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
            fireEvent.click(addToCartButton);

            expect(mockSetCart).toHaveBeenCalledWith([sampleProducts[0]]);
        });

        // NOTE: The test below was written with the help of an LLM
        test('More Details button exists and is clickable for each product', () => {
            mockValues = {
                keyword: 'tech',
                results: [sampleProducts[0], { ...sampleProducts[0], _id: 'p2', name: 'Phone' }]
            };

            renderSearch();

            const buttons = screen.getAllByRole('button', { name: /more details/i });
            expect(buttons).toHaveLength(2);

            buttons.forEach(button => {
                expect(button).toBeEnabled();
                expect(button).not.toBeDisabled();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('Add to Cart button exists and is clickable for each product', () => {
            mockValues = {
                keyword: 'tech',
                results: [sampleProducts[0], { ...sampleProducts[0], _id: 'p2', name: 'Phone' }]
            };

            renderSearch();

            const buttons = screen.getAllByRole('button', { name: /add to cart/i });
            expect(buttons).toHaveLength(2);

            buttons.forEach(button => {
                expect(button).toBeEnabled();
            });
        });

        // NOTE: The test below was written with the help of an LLM
        test('clicking buttons does not cause errors', () => {
            renderSearch();

            const moreDetailsButton = screen.getByRole('button', { name: /more details/i });
            const addToCartButton = screen.getByRole('button', { name: /add to cart/i });

            // Should not throw errors even without handlers
            expect(() => {
                fireEvent.click(moreDetailsButton);
                fireEvent.click(addToCartButton);
            }).not.toThrow();
        });
    });

    describe('Edge Cases', () => {
        test('handles product with missing price', () => {
            mockValues = {
                keyword: 'broken',
                results: [{ _id: 'p4', name: 'Mystery', description: 'Unknown', price: undefined }],
            };
            renderSearch();

            // expect(screen.getByText('Mystery')).toBeInTheDocument();
            expect(screen.getByText('$ 0')).toBeInTheDocument(); // price undefined still renders but as $ 0
        });
    });


});
