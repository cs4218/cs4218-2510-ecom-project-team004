import React from "react";
import Dashboard from "./Dashboard";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { render } from "@testing-library/react"

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => []) // Mock useAuth hook to return empty array for setAuth
}));

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

describe("Dashboard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test("Renders with authenticated user", () => {
        useAuth.mockReturnValue([
            { user: { name: "XYZ", email: "def@ghi.com", address: "123 JKL" } },
            jest.fn()
        ])

        const { getByText, getAllByText } = render(
            <MemoryRouter>
                <Dashboard/>
            </MemoryRouter>
        )

        expect(getAllByText("XYZ").length).toBeGreaterThanOrEqual(1);
        expect(getByText("def@ghi.com")).toBeInTheDocument();
        expect(getByText(/123/)).toBeInTheDocument();
        expect(getByText(/JKL/)).toBeInTheDocument();
    })
})
