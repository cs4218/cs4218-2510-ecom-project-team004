// written with the help of AI to simulate countdown

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { render, act } from "@testing-library/react"
import Spinner from './Spinner';

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useLocation: jest.fn(),
}));

describe('Spinner', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    })

    afterEach(() => {
        jest.useRealTimers();
    })

    it('Renders', () => {
        const { getByText } = render(<Spinner />);

        expect(getByText(/redirecting to you in \d second/)).toBeInTheDocument();
        expect(getByText('Loading...')).toBeInTheDocument();
    })
    
    it('Redirects to specific path if provided', () => {
        useLocation.mockReturnValueOnce({ pathname: 'somepath' });

        render(<Spinner path="somepath" />);
        act(() => jest.advanceTimersByTime(3000));
        
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/somepath', expect.anything());
    })

    it('Redirects to login by default', () => {
        useLocation.mockReturnValueOnce({ pathname: 'somepath' });

        render(<Spinner />);
        act(() => jest.advanceTimersByTime(3000));
        
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login', expect.anything());
    })

    it('Passes location.pathname to destination route', () => {
        useLocation.mockReturnValueOnce({ pathname: 'somepath' });
        
        render(<Spinner />);
        act(() => jest.advanceTimersByTime(3000));
        
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(expect.anything(), { state: 'somepath' });
    })
})