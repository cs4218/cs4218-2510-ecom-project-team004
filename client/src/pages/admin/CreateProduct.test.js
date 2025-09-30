import CreateProduct from "./CreateProduct";
import '@testing-library/jest-dom/extend-expect';
import { render, within, fireEvent, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import axios from "axios";
import React from "react";
import toast from 'react-hot-toast';
import { MemoryRouter, useNavigate } from "react-router-dom";
import { Select } from "antd";
import { act } from "react-dom/test-utils";
import { GiTargetArrows } from "react-icons/gi";

const mockNavigate = jest.fn();

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

jest.mock('../../hooks/useCategory', () => jest.fn(() => []));

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("CreateProduct Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(URL, 'createObjectURL', {
            writable: true,
            value: jest.fn(() => 'blob:mock'),
        });
        Object.defineProperty(URL, 'revokeObjectURL', {
            writable: true,
            value: jest.fn(),
        });
    });

    afterEach(() => {
        URL.createObjectURL.mockReset();
        URL.revokeObjectURL.mockReset();
    });

    it("renders inputs and creates buttons", async () => {
        axios.get.mockResolvedValue({ data: { success: true, category: [] } });

        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
        });

        expect(getByText("Select a category")).toBeInTheDocument();
        expect(getByText("Upload Photo")).toBeInTheDocument();
        expect(getByPlaceholderText("write a name")).toBeInTheDocument();
        expect(getByPlaceholderText("write a description")).toBeInTheDocument();
        expect(getByPlaceholderText("write a Price")).toBeInTheDocument();
        expect(getByPlaceholderText("write a quantity")).toBeInTheDocument();
        expect(getByText("Select Shipping")).toBeInTheDocument();
        expect(getByText("CREATE PRODUCT")).toBeInTheDocument();
    });

    it("creates product successfully", async () => {
        axios.get.mockResolvedValue({ data: { success: true, category: [{ _id: "1", name: "cat1" }] } });
        axios.post.mockResolvedValue({ data: { success: true } });

        const { getByPlaceholderText, getByText, getByRole, getByLabelText } = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        const categorySelect = getByRole("combobox", { name: "Category" });
        await act(async () => {
            fireEvent.mouseDown(categorySelect);
        });

        await act(async () => {
            fireEvent.click(getByText("cat1"));
        });

        const file = new File(["dummy"], "test.png", { type: "image/png" });
        const fileInput = getByLabelText("Upload Photo", { selector: 'input[type="file"]' });
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        })


        await act(async () => {
            fireEvent.change(getByPlaceholderText("write a name"), {
                target: { value: "Test Product" },
            });
            fireEvent.change(getByPlaceholderText("write a description"), {
                target: { value: "This is a test product" },
            });
            fireEvent.change(getByPlaceholderText("write a Price"), {
                target: { value: "9.99" },
            });
            fireEvent.change(getByPlaceholderText("write a quantity"), {
                target: { value: "1" },
            });
        });

        const shippingSelect = getByRole("combobox", { name: "Shipping" });
        await act(async () => {
            fireEvent.mouseDown(shippingSelect);
        });

        await act(async () => {
            fireEvent.click(getByText("No"));
        });

        await act(async () => {
            fireEvent.click(getByText("CREATE PRODUCT"));
        });

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
        });

        expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    it("creates product successfully and the correct formData is created", async () => {
        axios.get.mockResolvedValue({ data: { success: true, category: [{ _id: "1", name: "cat1" }] } });
        axios.post.mockResolvedValue({ data: { success: true } });

        const { getByPlaceholderText, getByText, getByRole, getByLabelText } = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        const categorySelect = getByRole("combobox", { name: "Category" });
        await act(async () => {
            fireEvent.mouseDown(categorySelect);
        });

        await act(async () => {
            fireEvent.click(getByText("cat1"));
        });

        const file = new File(["dummy"], "test.png", { type: "image/png" });
        const fileInput = getByLabelText("Upload Photo", { selector: 'input[type="file"]' });
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        await act(async () => {
            fireEvent.change(getByPlaceholderText("write a name"), {
                target: { value: "Test Product" },
            });
            fireEvent.change(getByPlaceholderText("write a description"), {
                target: { value: "This is a test product" },
            });
            fireEvent.change(getByPlaceholderText("write a Price"), {
                target: { value: "9.99" },
            });
            fireEvent.change(getByPlaceholderText("write a quantity"), {
                target: { value: "1" },
            });
        });

        const shippingSelect = getByRole("combobox", { name: "Shipping" });
        await act(async () => {
            fireEvent.mouseDown(shippingSelect);
        });

        await act(async () => {
            fireEvent.click(getByText("No"));
        });

        await act(async () => {
            fireEvent.click(getByText("CREATE PRODUCT"));
        });

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
        });

        const [, sentFormData] = axios.post.mock.calls[0];
        expect(sentFormData).toBeInstanceOf(FormData);

        const entries = Object.fromEntries(sentFormData.entries());
        expect(entries.name).toBe("Test Product");
        expect(entries.description).toBe("This is a test product");
        expect(entries.price).toBe("9.99");
        expect(entries.quantity).toBe("1");
        expect(entries.category).toBe("1");
        expect(entries.shipping).toBe("0");

        expect(entries.photo).toBeInstanceOf(File);
        expect(entries.photo.name).toBe("test.png");
        expect(entries.photo.type).toBe("image/png");
    });

    it("shows server error message when creation returns success:false", async () => {
        axios.get.mockResolvedValue({ data: { success: true, category: [{ _id: "1", name: "cat1" }] } });
        axios.post.mockResolvedValue({ data: { success: false, message: "Duplicate product" } });

        const { getByText, getByRole } = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        const shippingSelect = getByRole("combobox", { name: "Shipping" });
        await act(async () => {
            fireEvent.mouseDown(shippingSelect);
        });
        await act(async () => {
            fireEvent.click(getByText("No"));
        });

        await act(async () => {
            fireEvent.click(getByText("CREATE PRODUCT"));
        });

        await waitFor(() => expect(axios.post).toHaveBeenCalled());

        expect(toast.error).toHaveBeenCalledWith("Duplicate product");
        expect(toast.success).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows generic error toast when creation throws", async () => {
        axios.get.mockResolvedValue({ data: { success: true, category: [{ _id: "1", name: "cat1" }] } });
        axios.post.mockRejectedValue(new Error("network down"));

        const { getByText } = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await act(async () => {
            fireEvent.click(getByText("CREATE PRODUCT"));
        });

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.error).toHaveBeenCalledWith("something went wrong");
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows toast when categories fetch fails", async () => {
        axios.get.mockRejectedValue(new Error("boom"));

        render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting catgeory")
        );
    });
});