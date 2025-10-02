import Categories from './Categories';
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor, within } from "@testing-library/react";
import axios from 'axios';
import React from "react";
import { MemoryRouter } from "react-router-dom";

let mockCats = []

jest.mock('../hooks/useCategory', () => ({
    __esModule: true,
    default: () => mockCats,
}));

jest.mock('../components/Layout', () => ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
        <main data-testid="categories-scope">{children}</main>
    </div>
));

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
}));

describe("Categories Component", () => {
    beforeEach(() => {
        mockCats = [];
        jest.clearAllMocks();
    });

    it('renders no links when there are no categories', () => {
        const { getByTestId } = render(
            <MemoryRouter>
                <Categories />
            </MemoryRouter>
        );

        const scope = getByTestId('categories-scope');
        expect(within(scope).queryAllByRole('link')).toHaveLength(0);
    });

    it('renders a link per category with correct href', () => {
        mockCats = [
            { _id: '1', name: 'Shoes', slug: 'shoes' },
            { _id: '2', name: 'Hats', slug: 'hats' },
        ];

        const { getByTestId } = render(
            <MemoryRouter>
                <Categories />
            </MemoryRouter>
        );

        const scope = getByTestId('categories-scope');
        expect(within(scope).getByRole('link', { name: 'Shoes' }))
            .toHaveAttribute('href', '/category/shoes');
        expect(within(scope).getByRole('link', { name: 'Hats' }))
            .toHaveAttribute('href', '/category/hats');
    });
});