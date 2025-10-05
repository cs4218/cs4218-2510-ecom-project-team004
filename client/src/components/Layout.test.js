// written with the help of AI to:
// - mock/stub components to allow querying
// - test for correct sequence of components

import React from 'react';
import { render, within } from "@testing-library/react";
import Layout from './Layout';

jest.mock("react-helmet", () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>,
}));
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);
jest.mock("./Footer", () => () => <div data-testid="footer">Footer</div>);
jest.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

const ChildStub = () => <div data-testid="child">Child Content</div>;

it('renders components in correct order', () => {
    const { getByRole, getByTestId } = render(
        <Layout>
            <ChildStub />
        </Layout>
    );

    const layoutDiv = getByRole("main").parentElement; // top div of Layout

    // Helmet should be first
    expect(layoutDiv.firstChild).toHaveAttribute("data-testid", "helmet");

    // Header should be second
    expect(layoutDiv.children[1]).toHaveAttribute("data-testid", "header");

    // main content (with Toaster and children) should be next
    const main = layoutDiv.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(within(main).getByTestId("toaster")).toBeInTheDocument();
    expect(within(main).getByTestId("child")).toBeInTheDocument();

    // Footer should be last
    expect(layoutDiv.lastChild).toHaveAttribute("data-testid", "footer");

})