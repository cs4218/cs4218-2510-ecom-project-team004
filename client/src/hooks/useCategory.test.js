import { beforeEach } from 'node:test';
import useCategory from './useCategory'
import '@testing-library/jest-dom/extend-expect';
import { render, waitFor } from "@testing-library/react";
import axios from 'axios';
import React from "react";

jest.mock('axios');

function Demo() {
    const categories = useCategory();
    return (
        <div>
            <div data-testid="count">{categories.length}</div>
            <pre data-testid="data">{JSON.stringify(categories)}</pre>
        </div>
    );
}

describe("useCategory hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the API and renders returned categories", async () => {
        const mockcats = [{ _id: "1", name: "A" }, { id: "2", name: "B" }];
        axios.get.mockResolvedValueOnce({ data: { category: mockcats } });

        const { getByTestId } = render(<Demo />);

        expect(getByTestId("count").textContent).toBe("0");

        await waitFor(() => expect(axios.get).toHaveBeenCalled());
        await waitFor(() => expect(getByTestId("count").textContent).toBe("2"));
        expect(getByTestId("data").textContent).toContain("A");
        expect(getByTestId("data").textContent).toContain("B");
    });

    it("logs an error and keeps previous state", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        axios.get.mockRejectedValueOnce(new Error("Network error"));

        const { getByTestId } = render(<Demo />);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        expect(getByTestId("count").textContent).toBe("0");
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(consoleSpy.mock.calls[0][0].message).toBe("Network error");

        consoleSpy.mockRestore();
    });

    it("treats missing/nullable category as empty array", async () => {
        axios.get.mockResolvedValueOnce({ data: { category: null } });

        const { getByTestId } = render(<Demo />);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());
        await waitFor(() => expect(getByTestId("count").textContent).toBe("0"));
        expect(getByTestId("data").textContent).toBe("[]");
    });
});
