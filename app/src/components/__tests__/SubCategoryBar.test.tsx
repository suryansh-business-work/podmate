import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SubCategoryBar } from '../SubCategoryBar';

describe('SubCategoryBar', () => {
  const items = [
    { id: 'sc1', name: 'Meetups' },
    { id: 'sc2', name: 'Networking' },
  ];
  const onSelect = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('returns null when items array is empty', () => {
    const { toJSON } = render(
      <SubCategoryBar items={[]} selectedId={null} onSelect={onSelect} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders All pill and subcategory names', () => {
    const { getByText } = render(
      <SubCategoryBar items={items} selectedId={null} onSelect={onSelect} />,
    );
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Meetups')).toBeTruthy();
    expect(getByText('Networking')).toBeTruthy();
  });

  it('calls onSelect(null) when All pill is pressed', () => {
    const { getByText } = render(
      <SubCategoryBar items={items} selectedId="sc1" onSelect={onSelect} />,
    );
    fireEvent.press(getByText('All'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('calls onSelect with id when subcategory pill is pressed', () => {
    const { getByText } = render(
      <SubCategoryBar items={items} selectedId={null} onSelect={onSelect} />,
    );
    fireEvent.press(getByText('Meetups'));
    expect(onSelect).toHaveBeenCalledWith('sc1');
  });

  it('deselects subcategory when the same pill is pressed again', () => {
    const { getByText } = render(
      <SubCategoryBar items={items} selectedId="sc1" onSelect={onSelect} />,
    );
    fireEvent.press(getByText('Meetups'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('renders correct number of pills (All + items)', () => {
    const { getByText } = render(
      <SubCategoryBar items={items} selectedId={null} onSelect={onSelect} />,
    );
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Meetups')).toBeTruthy();
    expect(getByText('Networking')).toBeTruthy();
  });
});
