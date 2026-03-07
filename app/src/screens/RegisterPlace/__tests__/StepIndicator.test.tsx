import React from 'react';
import { render } from '@testing-library/react-native';
import StepIndicator from '../StepIndicator';

/* STEPS = ['Venue Details', 'Documents', 'Policies'] */

describe('StepIndicator', () => {
  it('renders all step labels', () => {
    const { getByText } = render(<StepIndicator step={0} />);
    expect(getByText('Venue Details')).toBeTruthy();
    expect(getByText('Documents')).toBeTruthy();
    expect(getByText('Policies')).toBeTruthy();
  });

  it('shows step number for steps at or after current', () => {
    const { getByText } = render(<StepIndicator step={0} />);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it('shows check icon for completed steps (step=1)', () => {
    const { getByText, queryByText } = render(<StepIndicator step={1} />);
    // Step 0 is completed → shows check icon instead of number
    expect(getByText('check')).toBeTruthy();
    // Step 1 current → shows number 2
    expect(getByText('2')).toBeTruthy();
    // Step 2 future → shows number 3
    expect(getByText('3')).toBeTruthy();
    // Number 1 should not be visible (replaced by check)
    expect(queryByText('1')).toBeNull();
  });

  it('shows check icons for all completed steps (step=2)', () => {
    const { getAllByText, getByText } = render(<StepIndicator step={2} />);
    // Steps 0 and 1 completed → 2 check icons
    const checks = getAllByText('check');
    expect(checks.length).toBe(2);
    // Step 2 is current → shows number 3
    expect(getByText('3')).toBeTruthy();
  });

  it('all steps completed shows check for all past steps (step=3)', () => {
    const { getAllByText } = render(<StepIndicator step={3} />);
    // All 3 steps completed → 3 check icons
    const checks = getAllByText('check');
    expect(checks.length).toBe(3);
  });

  it('renders connecting lines between steps', () => {
    // There should be 2 lines (between 3 steps)
    // We verify the component doesn't crash and renders all labels
    const { getByText } = render(<StepIndicator step={1} />);
    expect(getByText('Venue Details')).toBeTruthy();
    expect(getByText('Policies')).toBeTruthy();
  });
});
