import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Login from './Login';

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');

// Mock setAuth 
const mockSetAuth = jest.fn();
jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, mockSetAuth]) // Mock useAuth hook to return null state and a mock function for setAuth

jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
  }));  

jest.mock('../../hooks/useCategory', () => jest.fn(() => []));  // Mock useCategory hook to return null state and a mock function

// Mock navigate function in useNavigate hook
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({  
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(), // Mock useLocation hook
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
};

const formData = {
  email: 'test@example.com',
  password: 'password123'
};

function submitForm() {
  const { email, password } = formData;

  const { getByPlaceholderText, getByText } = render (
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        );

  fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: email } });
  fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: password } });
  fireEvent.click(getByText('LOGIN'));
}
describe('Login Component', () => {
  describe('Login Form', () => {
      beforeEach(() => {
          jest.clearAllMocks();
      });
  
      it('renders login form', () => {
          const { getByText, getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/login']}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          );
      
          expect(getByText('LOGIN FORM')).toBeInTheDocument();
          expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
          expect(getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
      });
  
      it('inputs should be initially empty', () => {
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<Login />} />
            </Routes>
          </MemoryRouter>
        );
    
        expect(getByText('LOGIN FORM')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter Your Email').value).toBe('');
        expect(getByPlaceholderText('Enter Your Password').value).toBe('');
      });
    
      it('should allow typing email and password', () => {
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<Login />} />
            </Routes>
          </MemoryRouter>
        );
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
        expect(getByPlaceholderText('Enter Your Email').value).toBe('test@example.com');
        expect(getByPlaceholderText('Enter Your Password').value).toBe('password123');
      });
  });
  
  describe('Forgot Password', () => {
      beforeEach(() => {
          jest.clearAllMocks();
      });
  
      it('should navigate to forgot-password page when clicked', () => {
          const { getByText, getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/login']}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          );
  
          fireEvent.click(getByText('Forgot Password'));
      
          expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
      });
  });
  
  describe('Process Login', () => {
    let logSpy;

    beforeEach(() => {
      jest.clearAllMocks();
      logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});  
      useLocation.mockReturnValue({ state: '' });
    });
      
    it('should call login API', async () => {
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      submitForm();

      await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/login', formData));
    });

    it('should login the user successfully', async () => {
      const data = {
          success: true,
          message: 'Login successful',
          user: { id: 1, name: 'John Doe', email: 'test@example.com' },
          token: 'mockToken'
      };
      axios.post.mockResolvedValueOnce({ data });

      submitForm();

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(toast.success).toHaveBeenCalledWith('Login successful', {  // should display success message
          duration: 5000,
          icon: '🙏',
          style: {
              background: 'green',
              color: 'white'
          }
      });
      expect(mockSetAuth).toHaveBeenCalledTimes(1); // should update auth state
      expect(mockSetAuth).toHaveBeenCalledWith({
        user: data.user,
        token: data.token,
      });
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);  // should save logged in data
      expect(localStorage.setItem).toHaveBeenCalledWith('auth', JSON.stringify(data));
    });

    it('should navigate user back to the saved location state when applicable', async () => {
      useLocation.mockReturnValue({ state: '/cart' });
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      submitForm();

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });

    it('should navigate user back to home page when there are no saved state', async () => {
      useLocation.mockReturnValue({ state: '' });
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      submitForm();

      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

    it('should display error message on failed login', async () => {
        axios.post.mockResolvedValueOnce({ 
          data: {
            success: false,
            message: 'Invalid credentials' 
          }
        });

        submitForm();

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should display error message on empty login response', async () => {
      axios.post.mockResolvedValueOnce({});

        submitForm();

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });

    it('should display error message when promise is rejected', async () => {
      axios.post.mockRejectedValueOnce('Error from login API');

        submitForm();

        await waitFor(() => expect(axios.post).toHaveBeenCalled());
        expect(logSpy).toHaveBeenCalledWith('Error from login API');
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });
  
  });

})
