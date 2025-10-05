import React from 'react';
import { render } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Pagenotfound from './Pagenotfound';
import HomePage from './HomePage';

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));
    
jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

jest.mock('../hooks/useCategory', () => jest.fn(() => []));  // Mock useCategory hook to return null state and a mock function

// written with the help of AI to test wildcard route
it('renders Pagenotfound on wildcard route', () => {
    const { getByText, getByRole } = render(
        <MemoryRouter initialEntries={['/nonexistent']}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<Pagenotfound />} />
            </Routes>
        </MemoryRouter>
        );

    expect(getByText('404')).toBeInTheDocument();
    expect(getByText('Oops ! Page Not Found')).toBeInTheDocument();
    expect(getByRole('link', {name: 'Go Back'})).toHaveAttribute('href', '/');
})