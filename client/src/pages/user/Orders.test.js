import React from "react";
import axios from "axios";
import { render, waitFor } from "@testing-library/react";
import Orders from "./Orders";
import { MemoryRouter } from "react-router-dom";
import moment from "moment";

jest.mock("axios");
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [
        { token: "test-token" },
        jest.fn()
    ])
}))

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

describe("Orders component", () => {
    const mockOrders = [{
        _id: "123456",
        products: [
            {
                _id: "abcdef",
                name: "Test Product",
                description: "Used for testing.",
                price: 500
            }
        ],
        payment: {
            success: true
        },
        buyer: {
            name: "fedcba"
        },
        status: "Processed",
        createAt: new Date().toISOString()
    }]

    it("should call API and render orders", async () => {
        axios.get.mockResolvedValueOnce({ data: mockOrders });

        const { getByText } = render(
            <MemoryRouter>
                <Orders/>
            </MemoryRouter>
        );

        await waitFor(() => {
            // Wait for the first order (and therefore all other orders) to be rendered.
            expect(getByText("#")).toBeInTheDocument();
        });

        expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
        expect(getByText("Processed")).toBeInTheDocument();
        expect(getByText("fedcba")).toBeInTheDocument();
        expect(getByText(moment(mockOrders[0].createAt).fromNow())).toBeInTheDocument();
        expect(getByText("Success")).toBeInTheDocument();
    })

    it("should call API and not render any orders if empty", async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        const { getByText } = render(
            <MemoryRouter>
                <Orders/>
            </MemoryRouter>
        );

        await waitFor(() => {
            // Wait for the "all orders" text to be rendered.
            expect(getByText("All Orders")).toBeInTheDocument();
        });

        // There should be no children of the parent of this element.
        const all_orders_parent = getByText("All Orders").parentNode;
        expect(all_orders_parent.children).toHaveLength(1);
    })
})
