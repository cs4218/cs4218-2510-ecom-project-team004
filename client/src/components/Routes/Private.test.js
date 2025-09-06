import React from 'react';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react'

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Spinner from '../Spinner';
import PrivateRoute from './Private';

jest.mock('axios');

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

describe('Private Route', () => {
    // it('should call axios.get()?')

    it('should redirect when not authenticated', async() => {
        // Mock axios.get to return unauthenticated.
        const mockAuth = { ok: false }

        axios.get.mockResolvedValueOnce(mockAuth);

        // Check if Spinner is returned in the document.
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
