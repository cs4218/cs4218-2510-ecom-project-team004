import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import Profile from "./Profile";

jest.mock("axios");

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

describe("Profile page", () => {
    it("Should render correctly", () => {
        const { getByText } = render(
            <MemoryRouter>
                <Profile/>
            </MemoryRouter>
        );

        expect(getByText("USER PROFILE")).toBeInTheDocument();
    })
})
