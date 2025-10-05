// The tests below are generated with help from GenAI
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import toastModule from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";
import Products from "./Products";

jest.mock("axios");

jest.mock("./../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="mock-layout">{children}</div>,
}));

jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="mock-adminmenu">AdminMenu</div>
));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {},
  error: jest.fn(),
}));

if (toastModule && !toastModule.error) {
  toastModule.error = jest.fn();
}

const mockProducts = [
  {
    _id: "p1",
    name: "Product A",
    description: "Description A",
    slug: "product-a",
  },
  {
    _id: "p2",
    name: "Product B",
    description: "Description B",
    slug: "product-b",
  },
];

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("Products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches and displays products", async () => {
    // Arange
    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

    // Act
    renderWithRouter(<Products />);

    await screen.findByText("Product A");

    // Assert
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Description A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();

    const imgA = screen.getByAltText("Product A");
    expect(imgA).toHaveAttribute("src", "/api/v1/product/product-photo/p1");

    const links = screen.getAllByRole("link");
    const foundHref = links.some((l) =>
      l.getAttribute("href")?.includes("/dashboard/admin/product/product-a")
    );
    expect(foundHref).toBe(true);
  });

  test("shows toast on API failure", async () => {
    // Arrange
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    // Act
    renderWithRouter(<Products />);

    // Assert
    await waitFor(() =>
      expect(toastModule.error).toHaveBeenCalledWith("Failed to fetch products")
    );
  });

  test("renders nothing when product list empty", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    // Act
    renderWithRouter(<Products />);

    // Assert
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(screen.queryByText("Product A")).toBeNull();
    expect(screen.queryByAltText("Product A")).toBeNull();
  });

  test("handles missing products key in response gracefully", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: {} }); // products key missing

    // Act
    renderWithRouter(<Products />);

    // Assert
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Product A")).toBeNull();
    expect(toastModule.error).not.toHaveBeenCalled();
  });
});
