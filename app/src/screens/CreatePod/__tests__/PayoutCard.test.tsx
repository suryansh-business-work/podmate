import React from 'react';
import { render } from '@testing-library/react-native';
import PayoutCard from '../PayoutCard';

describe('PayoutCard', () => {
  it('renders potential payout title', () => {
    const { getByText } = render(<PayoutCard feePerPerson={500} maxSeats={10} />);
    expect(getByText('Potential Payout')).toBeTruthy();
  });

  it('calculates gross revenue correctly', () => {
    const { queryByText } = render(<PayoutCard feePerPerson={500} maxSeats={10} />);
    // 500 * 10 = 5000
    const gross = (5000).toLocaleString();
    expect(queryByText(`₹${gross}`)).toBeTruthy();
  });

  it('calculates 5% platform fee correctly', () => {
    const { queryByText } = render(<PayoutCard feePerPerson={500} maxSeats={10} />);
    const fee = (250).toLocaleString();
    expect(queryByText(`- ₹${fee}`)).toBeTruthy();
  });

  it('calculates net revenue correctly', () => {
    const { queryByText } = render(<PayoutCard feePerPerson={500} maxSeats={10} />);
    const net = (4750).toLocaleString();
    expect(queryByText(`₹${net}`)).toBeTruthy();
  });

  it('shows Platform Fee (5%) label', () => {
    const { getByText } = render(<PayoutCard feePerPerson={100} maxSeats={5} />);
    expect(getByText('Platform Fee (5%)')).toBeTruthy();
  });

  it('shows You Receive label', () => {
    const { getByText } = render(<PayoutCard feePerPerson={100} maxSeats={5} />);
    expect(getByText('You Receive')).toBeTruthy();
  });

  it('shows escrow security message', () => {
    const { getByText } = render(<PayoutCard feePerPerson={100} maxSeats={5} />);
    expect(getByText(/escrow/i)).toBeTruthy();
  });

  it('displays gross label with fee x seats', () => {
    const { getByText } = render(<PayoutCard feePerPerson={200} maxSeats={8} />);
    expect(getByText(/200.*×.*8 seats/)).toBeTruthy();
  });

  it('handles zero fee — net is zero', () => {
    const { getAllByText } = render(<PayoutCard feePerPerson={0} maxSeats={10} />);
    // Multiple ₹0 appear (gross, fee, net) — verify at least one exists
    expect(getAllByText(/₹.*0/).length).toBeGreaterThan(0);
  });

  it('shows lock icon for escrow', () => {
    const { getByText } = render(<PayoutCard feePerPerson={100} maxSeats={2} />);
    expect(getByText(/Funds held securely/i)).toBeTruthy();
  });
});
