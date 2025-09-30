import CreateCategory from "./CreateCategory";
import '@testing-library/jest-dom/extend-expect';
import { render, within, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import toast from 'react-hot-toast';
import { MemoryRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";

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

describe("CreateCategory Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders layout and category form", async () => {
    axios.get.mockResolvedValue({ data: { success: true, category: [] } });

    const { getByText, getByRole } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(getByText("Manage Category")).toBeInTheDocument();
    expect(getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("fetches and displays categories", async () => {
    axios.get.mockResolvedValue({ data: { success: true, category: [{ _id: "1", name: "Cat A" }, { _id: "2", name: "Cat B" }] } });

    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Cat A")).toBeInTheDocument();
      expect(getByText("Cat B")).toBeInTheDocument();
    });
  });

  it("submits new category and calls correct API", async () => {
    axios.get.mockResolvedValue({ data: { success: true, category: [] } });
    axios.post.mockResolvedValue({ data: { success: true } });

    const { getByRole } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const input = getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "NewCat" } });
    });

    const submit = getByRole("button", { name: "Submit" });
    await act(async () => {
      fireEvent.click(submit);
    });

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith("/api/v1/category/create-category", { name: "NewCat" })
    );
  });

  it("edits and updates category and calls update API", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "OldName" }] } });
    axios.put.mockResolvedValue({ data: { success: true } });

    const { getByRole, findByText, findByRole } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(await findByText("OldName")).toBeInTheDocument();

    const edit = getByRole("button", { name: "Edit" });
    await act(async () => {
      fireEvent.click(edit);
    });


    const modal = await findByRole("dialog");
    const modalInput = within(modal).getByRole("textbox");
    await act(async () => {
      fireEvent.change(modalInput, { target: { value: "UpdatedName" } });
    });

    const submit = within(modal).getByRole("button", { name: "Submit" });
    await act(async () => {
      fireEvent.click(submit);
    });

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith("/api/v1/category/update-category/1", { name: "UpdatedName" })
    );
  });

  it("deletes and updates category and calls API", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "toDelete" }] } });
    axios.delete.mockResolvedValue({ data: { success: true } });

    const { getByRole, findByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(await findByText("toDelete")).toBeInTheDocument();

    const del = getByRole("button", { name: "Delete" });
    await act(async () => {
      fireEvent.click(del);
    });

    await waitFor(() => expect(axios.delete).toHaveBeenCalledWith("/api/v1/category/delete-category/1"));
  });

  it("displays error message if fetching categories fails and api fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Request failed with status code 400"))

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
  });

  it("displays error message if submitting a category fails but api resolves", async () => {
    axios.get.mockResolvedValue({ data: { success: true, category: [] } });
    axios.post.mockResolvedValueOnce({ data: { success: false } });

    const { getByRole } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const input = getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    const submit = getByRole("button", { name: "Submit" });
    await act(async () => {
      fireEvent.click(submit);
    });

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in input form");
  });

  it("displays error message if submitting a category fails and api fails", async () => {
    axios.get.mockResolvedValue({ data: { success: true, category: [] } });
    axios.post.mockRejectedValueOnce(new Error("Request failed with status code 400"));

    const { getByRole } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const input = getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    const submit = getByRole("button", { name: "Submit" });
    await act(async () => {
      fireEvent.click(submit);
    });

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in input form");
  });

  it("displays error message if updating a category fails but api resolves", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "OldName" }] } });
    axios.put.mockResolvedValueOnce({ data: { success: false } });

    const { getByRole, findByText, findByRole } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(await findByText("OldName")).toBeInTheDocument();

    const edit = getByRole("button", { name: "Edit" });
    await act(async () => {
      fireEvent.click(edit);
    });

    const modal = await findByRole("dialog");
    const modalInput = within(modal).getByRole("textbox");
    await act(async () => {
      fireEvent.change(modalInput, { target: { value: "" } });
    });

    const submit = within(modal).getByRole("button", { name: "Submit" });
    await act(async () => {
      fireEvent.click(submit);
    });

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("displays error message if updating a category fails and api fails", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "OldName" }] } });
    axios.put.mockRejectedValueOnce(new Error("Request failed with status code 400"));

    const { getByRole, findByText, findByRole } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(await findByText("OldName")).toBeInTheDocument();

    const edit = getByRole("button", { name: "Edit" });
    await act(async () => {
      fireEvent.click(edit);
    });

    const modal = await findByRole("dialog");
    const modalInput = within(modal).getByRole("textbox");
    await act(async () => {
      fireEvent.change(modalInput, { target: { value: "" } });
    });

    const submit = within(modal).getByRole("button", { name: "Submit" });
    await act(async () => {
      fireEvent.click(submit);
    });

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("displays error message if deleting category fails but api resolves", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "toDelete" }] } });
    axios.delete.mockResolvedValue({ data: { success: false } });

    const { getByRole, findByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(await findByText("toDelete")).toBeInTheDocument();

    const del = getByRole("button", { name: "Delete" });
    await act(async () => {
      fireEvent.click(del);
    });

    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("displays error message if deleting category fails and api fails", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, category: [{ _id: "1", name: "toDelete" }] } });
    axios.delete.mockRejectedValueOnce(new Error("Request failed with status code 400"));

    const { getByRole, findByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(await findByText("toDelete")).toBeInTheDocument();

    const del = getByRole("button", { name: "Delete" });
    await act(async () => {
      fireEvent.click(del);
    });

    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });
});