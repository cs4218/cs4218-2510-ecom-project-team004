import AdminDashboard from './AdminDashboard'
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from "../../context/auth";

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
}));

jest.mock('../../hooks/useCategory', () => jest.fn(() => []))

describe('AdminDashBoard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders AdminMenu component', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        expect(getByText('Admin Panel')).toBeInTheDocument();
    });

    it('displays admin details correctly if admin is logged in', () => {
        useAuth.mockReturnValue([{ user: { name: 'John Doe', email: 'john.doe@example.com', phone: '9876543210' } }]);
        const { getByText } = render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        expect(getByText('Admin Name : John Doe')).toBeInTheDocument();
        expect(getByText('Admin Email : john.doe@example.com')).toBeInTheDocument();
        expect(getByText('Admin Contact : 9876543210')).toBeInTheDocument();
    });

    it('does not display admin details if user is not logged in', () => {
        useAuth.mockReturnValue([{ user: null }]);
        const { queryByText } = render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        expect(queryByText('Admin Name : ')).not.toBeInTheDocument();
        expect(queryByText('Admin Email : ')).not.toBeInTheDocument();
        expect(queryByText('Admin Contact : ')).not.toBeInTheDocument();
    });
});
