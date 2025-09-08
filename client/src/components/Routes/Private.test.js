import React from 'react';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react'

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Spinner from '../Spinner';
import PrivateRoute from './Private';

jest.mock('axios');

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [
        { user: null, token: "A" }, jest.fn() // Null user and non-empty token for authentication purposes.
    ]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

describe('Private Route', () => {
    it('should call axios.get', async() => {
        // Mock axios.get.
        const mockAuth = { data: { ok: false } }
        axios.get.mockResolvedValueOnce(mockAuth);

        render(
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/dashboard" element={<PrivateRoute />} />
            </Routes>
          </MemoryRouter>
        );

        expect(axios.get.mock.calls).toHaveLength(1);
    })

    it('should redirect when not authenticated', async() => {
        // Mock axios.get to return unauthenticated.
        const mockAuth = { data: { ok: false } }

        axios.get.mockResolvedValueOnce(mockAuth);

        // Check if Spinner is returned in the document.
        // We can check if it contains the word "redirecting".
        const { getByText } = render(
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/dashboard" element={<PrivateRoute />} />
            </Routes>
          </MemoryRouter>
        );

        expect(getByText(/redirecting/i)).toBeInTheDocument();
    })
})
