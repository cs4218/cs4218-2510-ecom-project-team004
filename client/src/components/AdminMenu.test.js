import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminMenu from './AdminMenu'

describe('AdminMenu Component', () => {
    it('renders Admin Panel component', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Admin Panel')).toBeInTheDocument();
    });

    it('renders all navigation links', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Create Category')).toBeInTheDocument();
        expect(getByText('Create Product')).toBeInTheDocument();
        expect(getByText('Products')).toBeInTheDocument();
        expect(getByText('Orders')).toBeInTheDocument();
        expect(getByText('Users')).toBeInTheDocument();
    });

    it('has correct links for navigation', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );
        expect(getByText('Create Category').closest('a')).toHaveAttribute('href', '/dashboard/admin/create-category');
        expect(getByText('Create Product').closest('a')).toHaveAttribute('href', '/dashboard/admin/create-product');
        expect(getByText('Products').closest('a')).toHaveAttribute('href', '/dashboard/admin/products');
        expect(getByText('Orders').closest('a')).toHaveAttribute('href', '/dashboard/admin/orders');
        expect(getByText('Users').closest('a')).toHaveAttribute('href', '/dashboard/admin/users');
    });
});