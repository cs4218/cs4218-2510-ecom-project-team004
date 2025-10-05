import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import Profile from "./Profile";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

jest.mock("axios");
jest.mock("react-hot-toast");

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

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(() => "{}")
    },
    writable: true,
});

// JSON.parse = jest.fn();

describe("Profile page", () => {
    let mockUser;
    beforeEach(() => {
        mockUser = {
            name: "NAME",
            email: "test@abc.com",
            password: "PASSWORD",
            phone: "81234567",
            address: "ADDRESS"
        };
    })

    it("Should render correctly", () => {
        const { getByText } = render(
            <MemoryRouter>
                <Profile/>
            </MemoryRouter>
        );

        expect(getByText("USER PROFILE")).toBeInTheDocument();
    })

    it("Should display user information correctly", async () => {
        useAuth.mockReturnValue([{ user: mockUser }, jest.fn()]);

        const { getByPlaceholderText, findByText } = render(
            <MemoryRouter>
                <Profile/>
            </MemoryRouter>
        );

        // Wait for getEffect() to return and update the React-controlled text fields.
        // Assume mockUser.name returns correctly; otherwise, it'll fail the later tests anyway.
        await waitFor(() => {
            expect(getByPlaceholderText("Enter Your Name")).toHaveValue(mockUser.name);
        })

        expect(getByPlaceholderText("Enter Your Name")).toHaveValue(mockUser.name);
        expect(getByPlaceholderText("Enter Your Email")).toBeInTheDocument(mockUser.email);
        expect(getByPlaceholderText("Enter Your Password")).toBeInTheDocument(mockUser.password);
        expect(getByPlaceholderText("Enter Your Phone")).toBeInTheDocument(mockUser.phone);
        expect(getByPlaceholderText("Enter Your Address")).toBeInTheDocument(mockUser.address);
    })

    it("Should handle null auth gracefully", async () => {
        useAuth.mockReturnValue([null, jest.fn()]);

        // Should not crash.
        render(
            <MemoryRouter>
                <Profile/>
            </MemoryRouter>
        );
    })

    it("Should allow typing of all the fields", async () => {
        useAuth.mockReturnValue([{ user: mockUser }, jest.fn()]);

        const { getByText, getByPlaceholderText } = render(
            <MemoryRouter>
                <Profile/>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'CHANGED NAME' } });
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'changed@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'CHANGED PASSWORD' } });
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '8111111' } });
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: 'CHANGED ADDRESS' } });
        expect(getByPlaceholderText('Enter Your Name').value).toBe('CHANGED NAME');
        expect(getByPlaceholderText('Enter Your Email').value).toBe('changed@example.com');
        expect(getByPlaceholderText('Enter Your Password').value).toBe('CHANGED PASSWORD');
        expect(getByPlaceholderText('Enter Your Phone').value).toBe('8111111');
        expect(getByPlaceholderText('Enter Your Address').value).toBe('CHANGED ADDRESS');
    })

    it("Should handle submit with valid input correctly", async () => {
        const updatedUser = {
            name: "UPDATED NAME",
            email: "updated@abc.com",
            password: "UPDATED PASSWORD",
            phone: "87654321",
            address: "UPDATED ADDRESS"
        };
        axios.put.mockResolvedValue({ data: { updatedUser } })

        useAuth.mockReturnValue([{ user: mockUser }, jest.fn()]);

        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter>
                <Profile/>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'CHANGED NAME' } });
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'changed@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'CHANGED PASSWORD' } });
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '8111111' } });
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: 'CHANGED ADDRESS' } });

        fireEvent.click(getByText("UPDATE"));

        await waitFor(() => expect(axios.put).toHaveBeenCalled());

        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
            name: 'CHANGED NAME',
            email: "changed@example.com",
            password: "CHANGED PASSWORD",
            phone: "8111111",
            address: "CHANGED ADDRESS"
        })

        expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
    })

    it("Should report an error when an error is encountered in submitting the form", async () => {
        axios.put.mockImplementation(() => { throw new Error(); })

        useAuth.mockReturnValue([{ user: mockUser }, jest.fn()]);

        const { getByText } = render(
            <MemoryRouter>
                <Profile/>
            </MemoryRouter>
        );

        fireEvent.click(getByText("UPDATE"));

        await waitFor(() => expect(axios.put).toHaveBeenCalled());

        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    })

    it("Should report an error when there is an error in the data", async () => {
        axios.put.mockResolvedValue({ data: { error: "ERROR" } });

        useAuth.mockReturnValue([{ user: mockUser }, jest.fn()]);

        const { getByText } = render(
            <MemoryRouter>
                <Profile/>
            </MemoryRouter>
        );

        fireEvent.click(getByText("UPDATE"));

        await waitFor(() => expect(axios.put).toHaveBeenCalled());

        expect(toast.error).toHaveBeenCalledWith("ERROR");
    })
})
