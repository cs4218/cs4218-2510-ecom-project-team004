import UpdateProduct from "./UpdateProduct";
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import React from "react";
import toast from 'react-hot-toast';
import { MemoryRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";

const mockNavigate = jest.fn();

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]),
}));
jest.mock('../../hooks/useCategory', () => jest.fn(() => []));

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ slug: "prod-a" }),
    };
});

describe("UpdateProduct component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(URL, 'createObjectURL', {
            writable: true,
            value: jest.fn(() => 'blob:mock'),
        });
        if (!window.prompt) {
            Object.defineProperty(window, 'prompt', {
                configurable: true,
                writable: true,
                value: () => null,
            });
        }
        promptSpy = jest.spyOn(window, 'prompt');
    });

    afterEach(() => {
        URL.createObjectURL.mockReset();
        if (promptSpy) promptSpy.mockReset();
    });

    const productResp = {
        data: {
            product: {
                name: "prod-a",
                _id: "pid",
                description: "desc",
                price: "10",
                quantity: "2",
                shipping: "0",
                category: { _id: "1", name: "cat1" },
            },
        },
    };

    const categoriesResp = {
        data: { success: true, category: [{ _id: "1", name: "cat1" }] },
    };

    it("fetches product and categories and populates form", async () => {
        axios.get
            .mockResolvedValueOnce(productResp)
            .mockResolvedValueOnce(categoriesResp);

        const { findByDisplayValue, getByAltText, findByText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        expect(await findByText("cat1")).toBeInTheDocument();
        expect(await findByText("No")).toBeInTheDocument();
        expect(await findByDisplayValue("prod-a")).toBeInTheDocument();
        expect(await findByDisplayValue("desc")).toBeInTheDocument();
        expect(await findByDisplayValue("10")).toBeInTheDocument();
        expect(await findByDisplayValue("2")).toBeInTheDocument();

        const img = getByAltText("product_photo");
        expect(img.src).toContain("/api/v1/product/product-photo/pid");
    });

    it("updates product successfully (no photo) and navigates", async () => {
        axios.get.mockResolvedValueOnce(productResp).mockResolvedValueOnce(categoriesResp);
        axios.put.mockResolvedValueOnce({ data: { success: true } });

        const { getByText, findByDisplayValue } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await findByDisplayValue("prod-a");
        const btn = await waitFor(() => getByText("UPDATE PRODUCT"));
        await act(async () => {
            fireEvent.click(btn);
        });

        expect(axios.put).toHaveBeenCalled();
        const [url, body] = axios.put.mock.calls[0];
        expect(url).toBe("/api/v1/product/update-product/pid");
        expect(body instanceof FormData).toBe(true);

        expect(body.get("name")).toBe("prod-a");
        expect(body.get("description")).toBe("desc");
        expect(body.get("price")).toBe("10");
        expect(body.get("quantity")).toBe("2");
        expect(body.get("category")).toBe("1");
        expect(body.get("shipping")).toBe("0");
        expect(body.get("photo")).toBe(null);

        expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    it("updates product successfully with photo", async () => {
        axios.get.mockResolvedValueOnce(productResp).mockResolvedValueOnce(categoriesResp);
        axios.put.mockResolvedValueOnce({ data: { success: true } });

        const file = new File(["image-bytes"], "photo.png", { type: "image/png" });

        const { container, getByText, getByAltText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        const fileInput = await waitFor(() => container.querySelector('input[name="photo"]'));
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        const previewImg = getByAltText("product_photo");
        expect(previewImg.src).toBe("blob:mock");
        expect(URL.createObjectURL).toHaveBeenCalled();

        const btn = getByText("UPDATE PRODUCT");
        await act(async () => {
            fireEvent.click(btn);
        });

        const [, body] = axios.put.mock.calls[0];
        expect(body.get("photo")).toBe(file);
        expect(toast.success).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    it("shows toast.error when update returns false", async () => {
        axios.get.mockResolvedValueOnce(productResp).mockResolvedValueOnce(categoriesResp);
        axios.put.mockResolvedValueOnce({ data: { success: false, message: "Something failed" } });

        const { getByText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        const btn = await waitFor(() => getByText("UPDATE PRODUCT"));
        await act(async () => {
            fireEvent.click(btn);
        });

        expect(toast.error).toHaveBeenCalledWith("Something failed");
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("cancels delete when prompt is empty", async () => {
        axios.get.mockResolvedValueOnce(productResp).mockResolvedValueOnce(categoriesResp);
        window.prompt.mockReturnValue("");

        const { getByText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        const delBtn = await waitFor(() => getByText("DELETE PRODUCT"));
        await act(async () => {
            fireEvent.click(delBtn);
        });

        expect(axios.delete).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("deletes product successfully and navigates", async () => {
        axios.get.mockResolvedValueOnce(productResp).mockResolvedValueOnce(categoriesResp);
        axios.delete = jest.fn().mockResolvedValueOnce({ data: { success: true } });
        window.prompt.mockReturnValue("yes");

        const { getByText, findByDisplayValue } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        await findByDisplayValue("prod-a");

        const delBtn = await waitFor(() => getByText("DELETE PRODUCT"));
        await act(async () => {
            fireEvent.click(delBtn);
        });

        expect(axios.delete).toHaveBeenCalledWith("/api/v1/product/delete-product/pid");
        expect(toast.success).toHaveBeenCalledWith("Product Deleted Succfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    it("shows toast.error when delete returns success:false", async () => {
        axios.get.mockResolvedValueOnce(productResp).mockResolvedValueOnce(categoriesResp);
        axios.delete = jest.fn().mockResolvedValueOnce({ data: { success: false } });
        window.prompt.mockReturnValue("yes");

        const { getByText, findByDisplayValue } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        await findByDisplayValue("prod-a");

        const delBtn = await waitFor(() => getByText("DELETE PRODUCT"));
        await act(async () => {
            fireEvent.click(delBtn);
        });

        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows toast.error when getSingleProduct fails", async () => {
        axios.get
            .mockRejectedValueOnce(new Error("Fail"))
            .mockResolvedValueOnce(categoriesResp);

        render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something went wrong");
        });
    });

    it("shows toast.error when getAllCategory fails", async () => {
        axios.get
            .mockResolvedValueOnce(productResp)
            .mockRejectedValueOnce(new Error("cat fail"));

        render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory");
        });
    });
});
