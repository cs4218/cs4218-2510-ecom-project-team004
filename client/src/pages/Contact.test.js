import React from 'react';
import { getDefaultNormalizer, render } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Contact from './Contact';

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

it('renders contact page', () => {
    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/contact']}>
            <Routes>
                <Route path="/contact" element={<Contact />} />
            </Routes>
        </MemoryRouter>
    );

    expect(getByText('CONTACT US')).toBeInTheDocument();
    expect(getByText('For any query or info about product, feel free to call anytime. We are available 24X7.')).toBeInTheDocument();
    expect(getByText(': www.help@ecommerceapp.com')).toBeInTheDocument();
    expect(getByText(': 012-3456789')).toBeInTheDocument();
    expect(getByText(': 1800-0000-0000 (toll free)')).toBeInTheDocument();
})