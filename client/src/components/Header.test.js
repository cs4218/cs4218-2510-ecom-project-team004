import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth";
import useCategory from "../hooks/useCategory";
import Header from "./Header";

jest.mock('react-hot-toast');

jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()])
}));

jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("./Form/SearchInput", () => () => <div data-testid="search">Search</div>);

Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
});


describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    describe('Components independent of login status', () => {
        it('renders brand name', () => {
            const { getByText } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );

            expect(getByText(/.* Virtual Vault/)).toBeInTheDocument();
        })
        
        it('brand name links to root path', () => {
            const { getByRole } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            
            expect(getByRole('link',{ name: /.* Virtual Vault/})).toHaveAttribute('href', '/')
        })
        
        it('renders search', () => {
            const { getByTestId } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );

            expect(getByTestId("search")).toBeInTheDocument();
        })

        it('renders home button', () => {
            const { getByText } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );

            expect(getByText('Home')).toBeInTheDocument();
        })
        
        it('home button links to root path', () => {
            const { getByRole } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            
            expect(getByRole('link',{ name: 'Home'})).toHaveAttribute('href', '/')
        })

        it('renders categories dropdown', () => {
            useCategory.mockReturnValueOnce([
                { _id: 1, name: 'Clothing', slug: 'clothing'},
                { _id: 2, name: 'Electronics', slug: 'electronics'},
            ]);
            
            const { getByText } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );

            expect(getByText('Categories')).toBeInTheDocument();
            expect(getByText('All Categories')).toBeInTheDocument();
            expect(getByText('Clothing')).toBeInTheDocument();
            expect(getByText('Electronics')).toBeInTheDocument();
        })

        it('each category links to respective page', () => {
            useCategory.mockReturnValueOnce([
                { _id: 1, name: 'Clothing', slug: 'clothing'},
                { _id: 2, name: 'Electronics', slug: 'electronics'},
            ]);
            
            const { getByRole } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );

            expect(getByRole('link',{ name: 'Categories'})).toHaveAttribute('href', '/categories')
            expect(getByRole('link',{ name: 'All Categories'})).toHaveAttribute('href', '/categories')
            expect(getByRole('link',{ name: 'Clothing'})).toHaveAttribute('href', '/category/clothing')
            expect(getByRole('link',{ name: 'Electronics'})).toHaveAttribute('href', '/category/electronics')
        })

        it('renders cart button', () => {
            const { getByText } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );

            expect(getByText('Cart')).toBeInTheDocument();
        })
        
        it('cart button links to cart page', () => {
            const { getByRole } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            
            expect(getByRole('link',{ name: 'Cart'})).toHaveAttribute('href', '/cart')
        })
    })

    describe('When user is not logged in', () => {
        beforeEach(() => {
            useAuth.mockReturnValue([{ user: null, token: ''}, jest.fn()]);
        })

        it('renders register and login buttons', () => {
            const { getByText } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );

            expect(getByText('Register')).toBeInTheDocument();
            expect(getByText('Login')).toBeInTheDocument();
        })

        it('register and login buttons link to correct page', () => {
            const { getByRole } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            
            expect(getByRole('link',{ name: 'Register'})).toHaveAttribute('href', '/register')
            expect(getByRole('link',{ name: 'Login'})).toHaveAttribute('href', '/login')
        })
    })

    describe('When user is logged in', () => {
        it('renders register and login buttons', () => {
            useAuth.mockReturnValue([{ user: { name: 'fakeUser', role: 0 }, token: ''}, jest.fn()]);
            
            const { getByText } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            
            expect(getByText('fakeUser')).toBeInTheDocument();
            expect(getByText('Dashboard')).toBeInTheDocument();
            expect(getByText('Logout')).toBeInTheDocument();
        })
        
        it('links to correct dashboard for non-admin user', () => {
            useAuth.mockReturnValue([{ user: { name: 'fakeUser', role: 0 }, token: ''}, jest.fn()]);
            
            const { getByRole } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            
            expect(getByRole('link',{ name: 'Dashboard'})).toHaveAttribute('href', '/dashboard/user')
        })
        
        it('links to correct dashboard for admin user', () => {
            useAuth.mockReturnValue([{ user: { name: 'fakeAdmin', role: 1 }, token: ''}, jest.fn()]);
            
            const { getByRole } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );
            
            expect(getByRole('link',{ name: 'Dashboard'})).toHaveAttribute('href', '/dashboard/admin')
        })

        it('user can logout', () => {
            const mockSetAuth = jest.fn();
            useAuth.mockReturnValue([{ user: { name: 'fakeUser', role: 0 }, token: ''}, mockSetAuth]);

            const { getByText } = render(
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            );

            fireEvent.click(getByText('Logout'));

            expect(mockSetAuth).toHaveBeenCalledTimes(1);
            expect(mockSetAuth).toHaveBeenCalledWith({ user: null, token: ''});
            expect(localStorage.removeItem).toHaveBeenCalledTimes(1);
            expect(localStorage.removeItem).toHaveBeenCalledWith('auth');
            expect(toast.success).toHaveBeenCalledWith('Logout Successfully');
        })
    })
})