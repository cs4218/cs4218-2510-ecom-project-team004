import UpdateProduct from "./UpdateProduct";
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor, fireEvent, within } from "@testing-library/react";
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

// This function was made with the help of an LLM
async function selectAntdOptionByText(container, selectIndex, optionText) {
    const selectors = container.querySelectorAll(".ant-select-selector");
    const trigger = selectors[selectIndex];
    if (!trigger) throw new Error(`Select index ${selectIndex} not found`);

    await act(async () => {
        fireEvent.mouseDown(trigger);
    });

    const listboxes = document.body.querySelectorAll(".ant-select-dropdown");
    if (!listboxes.length) throw new Error("No AntD dropdown found");
    const listbox = listboxes[listboxes.length - 1];
    const { getByRole, getByText } = within(listbox);

    const optionNode =
        listbox.querySelector('[role="option"]') && getByText(optionText).closest('[role="option"]')
            ? getByText(optionText).closest('[role="option"]')
            : getByText(optionText);

    await act(async () => {
        fireEvent.click(optionNode);
    });
}

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

    it("shows the chosen filename on the upload button after selecting a photo", async () => {
        axios.get
            .mockResolvedValueOnce(productResp)
            .mockResolvedValueOnce(categoriesResp);

        const file = new File(["image-bytes"], "photo.png", { type: "image/png" });

        const { container, findByText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        const fileInput = await waitFor(() => container.querySelector('input[name="photo"]'));
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        expect(await findByText("photo.png")).toBeInTheDocument();
    });

    it("handles update error (axios.put rejects) and shows toast.error", async () => {
        axios.get
            .mockResolvedValueOnce(productResp)
            .mockResolvedValueOnce(categoriesResp);
        axios.put.mockRejectedValueOnce(new Error("server down"));

        const { getByText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        const btn = await waitFor(() => getByText("UPDATE PRODUCT"));
        await act(async () => {
            fireEvent.click(btn);
        });

        expect(axios.put).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("something went wrong");
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("handles delete error (axios.delete rejects) and shows toast.error", async () => {
        axios.get
            .mockResolvedValueOnce(productResp)
            .mockResolvedValueOnce(categoriesResp);
        axios.delete = jest.fn().mockRejectedValueOnce(new Error("oops"));
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
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("lets the user edit inputs and sends the new values in FormData", async () => {
        axios.get
            .mockResolvedValueOnce(productResp)
            .mockResolvedValueOnce(categoriesResp);
        axios.put.mockResolvedValueOnce({ data: { success: true } });

        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        const nameInput = await waitFor(() => getByPlaceholderText("write a name"));
        const descInput = getByPlaceholderText("write a description");
        const priceInput = getByPlaceholderText("write a Price");
        const qtyInput = getByPlaceholderText("write a quantity");

        await act(async () => {
            fireEvent.change(nameInput, { target: { value: "prod-a-edited" } });
            fireEvent.change(descInput, { target: { value: "desc-edited" } });
            fireEvent.change(priceInput, { target: { value: "99" } });
            fireEvent.change(qtyInput, { target: { value: "7" } });
        });

        const btn = getByText("UPDATE PRODUCT");
        await act(async () => {
            fireEvent.click(btn);
        });

        const [, body] = axios.put.mock.calls[0];
        expect(body.get("name")).toBe("prod-a-edited");
        expect(body.get("description")).toBe("desc-edited");
        expect(body.get("price")).toBe("99");
        expect(body.get("quantity")).toBe("7");
        expect(body.get("category")).toBe("1");
        expect(body.get("shipping")).toBe("0");

        expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });

    // This test was made with the help of an LLM
    it("changes category via Select and sends the new category id", async () => {
        const categoriesResp2 = {
            data: { success: true, category: [{ _id: "1", name: "cat1" }, { _id: "2", name: "cat2" }] },
        };

        axios.get
            .mockResolvedValueOnce(productResp)   
            .mockResolvedValueOnce(categoriesResp2);
        axios.put.mockResolvedValueOnce({ data: { success: true } });

        const { container, getByText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        await selectAntdOptionByText(container, 0, "cat2");

        const btn = await waitFor(() => getByText("UPDATE PRODUCT"));
        await act(async () => {
            fireEvent.click(btn);
        });

        const [, body] = axios.put.mock.calls[0];
        expect(body.get("category")).toBe("2");
    });

    // This test was made with the help of an LLM
    it("changes shipping via Select and sends the new shipping value", async () => {
        axios.get
            .mockResolvedValueOnce(productResp)
            .mockResolvedValueOnce(categoriesResp);
        axios.put.mockResolvedValueOnce({ data: { success: true } });

        const { container, getByText } = render(
            <MemoryRouter>
                <UpdateProduct />
            </MemoryRouter>
        );

        await selectAntdOptionByText(container, 1, "Yes");

        const btn = await waitFor(() => getByText("UPDATE PRODUCT"));
        await act(async () => {
            fireEvent.click(btn);
        });

        const [, body] = axios.put.mock.calls[0];
        expect(body.get("shipping")).toBe("1");
    });
});
