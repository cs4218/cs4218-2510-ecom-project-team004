import React from "react";
import UserMenu from "./UserMenu";

import { render } from '@testing-library/react'
import { MemoryRouter } from "react-router-dom";

describe("User Menu", () => {
    test("Displays Dashboard Header", () => {
        const { getByText } = render(
            <MemoryRouter>
                <UserMenu/>
            </MemoryRouter>
        )

        expect(getByText("Dashboard")).toBeInTheDocument();
    })

    test("Displays Navlink for Profile", () => {
        const { getByText } = render(
            <MemoryRouter>
                <UserMenu/>
            </MemoryRouter>
        )

        const profile_navlink = getByText("Profile");

        expect(profile_navlink).toBeInTheDocument();
        expect(profile_navlink.getAttribute("href")).toEqual("/dashboard/user/profile");
    })

    test("Displays Navlink for Orders", () => {
        const { getByText } = render(
            <MemoryRouter>
                <UserMenu/>
            </MemoryRouter>
        )

        const profile_navlink = getByText("Orders");

        expect(profile_navlink).toBeInTheDocument();
        expect(profile_navlink.getAttribute("href")).toEqual("/dashboard/user/orders");
    })
})
