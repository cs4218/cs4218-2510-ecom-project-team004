import React from 'react';
import { render } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Footer from './Footer';

it('renders footer', () => {
    const { getByText } = render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
        );

    expect(getByText(/All Rights Reserved .* TestingComp/)).toBeInTheDocument();
    expect(getByText('About')).toBeInTheDocument();
    expect(getByText('Contact')).toBeInTheDocument();
    expect(getByText('Privacy Policy')).toBeInTheDocument();
})

// written with the help of AI to generate the assertion code
it('"About" links to correct path', () => {
    const { getByRole } = render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
        );

    expect(getByRole('link',{ name: 'About'})).toHaveAttribute('href', '/about');
})

it('"Contact" links to correct path', () => {
    const { getByRole } = render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
        );

    expect(getByRole('link',{ name: 'Contact'})).toHaveAttribute('href', '/contact');
})

it('"Privacy Policy" links to correct path', () => {
    const { getByRole } = render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
        );

    expect(getByRole('link',{ name: 'Privacy Policy'})).toHaveAttribute('href', '/policy');
})