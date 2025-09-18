import CreateCategory from "./CreateCategory";
import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { WiMoonAltWaxingGibbous1 } from "react-icons/wi";
import { MemoryRouter } from "react-router-dom";

jest.mock('axios');
jest.mock('react-hot-toast');

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

describe("CreateCategory Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders layout and category form", () => {
        const { getByText } = render(
            <MemoryRouter>
                <CreateCategory />
            </MemoryRouter>
        );
        expect(getByText(/Manage Category/i)).toBeInTheDocument();
    });
});