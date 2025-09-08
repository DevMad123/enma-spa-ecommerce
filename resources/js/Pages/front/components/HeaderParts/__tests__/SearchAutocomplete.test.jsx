import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SearchAutocomplete from '../SearchAutocomplete';

jest.useFakeTimers();

test('debounced search and suggestion selection', () => {
  const mockSearch = jest.fn();
  render(<SearchAutocomplete onSearch={mockSearch} suggestions={[]} loading={false} />);
  const input = screen.getByPlaceholderText(/search products/i);
  fireEvent.change(input, { target: { value: 'shoes' } });
  jest.advanceTimersByTime(250);
  expect(mockSearch).toHaveBeenCalledWith('shoes');
});

test('shows suggestions and selects', () => {
  const suggestions = [{ id: 1, title: 'Test Product', url: '/shop/1' }];
  render(<SearchAutocomplete onSearch={() => {}} suggestions={suggestions} loading={false} />);
  expect(screen.getByText('Test Product')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Test Product'));
  // window.location.href should change (simulate)
});