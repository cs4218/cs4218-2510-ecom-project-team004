import CreateProduct from "./CreateProduct";
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

describe("CreateProduct Component", () => {

});