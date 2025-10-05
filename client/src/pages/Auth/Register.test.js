import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Register from './Register';

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

jest.mock('../../hooks/useCategory', () => jest.fn(() => []));  // Mock useCategory hook to return null state and a mock function

// Mock navigate function in useNavigate hook
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({  
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  }));

Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: function () { },
    removeListener: function () { }
  };

const formData = {
  name: 'John Doe',
  email: 'test@example.com',
  password: 'password123',
  phone: '1234567890',
  address: '123 Street',
  DOB: '2000-01-01',
  answer: 'Football',
}

function submitForm() {
  const { name, email, password, phone, address, DOB, answer } = formData;

  const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      );

    fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: name } });
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: email } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: password } });
    fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: phone } });
    fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: address } });
    fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: DOB } });
    fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: answer } });

    fireEvent.click(getByText('REGISTER'));
}


describe('Register Component', () => {
  let logSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});  
  });

  it('should call registration API', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    submitForm();

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/register', formData));
  });

  it('should register the user successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    submitForm();

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should display error message on failed registration', async () => {
    axios.post.mockResolvedValueOnce({ 
      data: {
        success: false,
        message: 'Already Register please login'} });

    submitForm();

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('Already Register please login');
  });

  it('should display error message on empty response', async () => {
    axios.post.mockResolvedValueOnce({});

    submitForm();

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('should display error message on promise rejection', async () => {
    axios.post.mockRejectedValueOnce('Error from register API');

    submitForm();

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(logSpy).toHaveBeenCalledWith('Error from register API');
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });
});
