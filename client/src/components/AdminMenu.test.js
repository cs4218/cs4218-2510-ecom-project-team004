import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminMenu from './AdminMenu'

describe('AdminMenu Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Admin Panel')).toBeInTheDocument();
    });

    it('renders create category link', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Create Category')).toBeInTheDocument();
    });

    it('renders create product link', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Create Product')).toBeInTheDocument();
    });

    it('renders products link', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Products')).toBeInTheDocument();
    });

    it('renders orders link', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Orders')).toBeInTheDocument();
    });

    it('renders users link', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Users')).toBeInTheDocument();
    });

    it('create category has correct link for navigation', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Create Category').closest('a')).toHaveAttribute('href', '/dashboard/admin/create-category');
    });

    it('create product has correct link for navigation', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Create Product').closest('a')).toHaveAttribute('href', '/dashboard/admin/create-product');
    });

    it('products has correct link for navigation', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Products').closest('a')).toHaveAttribute('href', '/dashboard/admin/products');
    });

    it('orders has correct link for navigation', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Orders').closest('a')).toHaveAttribute('href', '/dashboard/admin/orders');
    });

    it('users has correct link for navigation', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Users').closest('a')).toHaveAttribute('href', '/dashboard/admin/users');
    });
});