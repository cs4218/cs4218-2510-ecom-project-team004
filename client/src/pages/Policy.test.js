import React from 'react';
import { render } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Policy from './Policy';

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

it('renders policy page', () => {
    const { getAllByText } = render(
        <MemoryRouter initialEntries={['/policy']}>
            <Routes>
                <Route path="/policy" element={<Policy />} />
            </Routes>
        </MemoryRouter>
    );
    const placeholders = getAllByText('add privacy policy');

    expect(placeholders).toHaveLength(7);
    expect(placeholders[0]).toBeInTheDocument();
})