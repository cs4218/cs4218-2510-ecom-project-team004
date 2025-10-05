import CategoryForm from "./CategoryForm";
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe("Category Form", () => {
    const mockHandleSubmit = jest.fn((e) => e?.preventDefault?.());
    const mockSetValue = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders input and submit button", () => {
        const { getByPlaceholderText, getByRole } = render(
            <MemoryRouter>
                <CategoryForm handleSubmit={mockHandleSubmit} value="" setValue={mockSetValue} />
            </MemoryRouter>
        );
        expect(getByPlaceholderText("Enter new category")).toBeInTheDocument();
        expect(getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("calls setValue on input change", () => {
        const { getByPlaceholderText } = render(
            <MemoryRouter>
                <CategoryForm handleSubmit={mockHandleSubmit} value="" setValue={mockSetValue} />
            </MemoryRouter>
        );
        const input = getByPlaceholderText("Enter new category");
        fireEvent.change(input, { target: { value: "New Category" } });
        expect(mockSetValue).toHaveBeenCalledWith("New Category");
    });

    it("calls handleSubmit when form is submitted", () => {
        const { getByRole } = render(
            <MemoryRouter>
                <CategoryForm handleSubmit={mockHandleSubmit} value="X" setValue={mockSetValue} />
            </MemoryRouter>
        );
        const button = getByRole("button", { name: /submit/i });
        fireEvent.click(button);
        expect(mockHandleSubmit).toHaveBeenCalled();
    });
});