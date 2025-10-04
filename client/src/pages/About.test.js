import React from 'react';
import { render } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import About from './About';

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

it('renders about page', () => {
    const { getByText, getByRole } = render(
        <MemoryRouter initialEntries={['/about']}>
            <Routes>
                <Route path="/about" element={<About />} />
            </Routes>
        </MemoryRouter>
        );

    const img = getByRole('img', {name: 'contactus'});
    const text = getByText('Add text');

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/about.jpeg');
    expect(text).toBeInTheDocument();
})