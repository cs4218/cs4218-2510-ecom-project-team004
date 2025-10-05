import React from 'react';
import { render } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Users from './Users';

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

jest.mock('../../hooks/useCategory', () => jest.fn(() => []));  // Mock useCategory hook to return null state and a mock function

it('renders admin/users page', () => {
    const { getByText } = render(
        <MemoryRouter initialEntries={['/dashboard/admin/users']}>
            <Routes>
                <Route path="/dashboard/admin/users" element={<Users />} />
            </Routes>
        </MemoryRouter>
    );

    expect(getByText('All Users')).toBeInTheDocument();
})