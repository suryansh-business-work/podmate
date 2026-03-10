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

  it('calculates default 5% platform fee correctly', () => {
    const { queryByText } = render(<PayoutCard feePerPerson={500} maxSeats={10} />);
    const fee = (250).toLocaleString();
    expect(queryByText(`- ₹${fee}`)).toBeTruthy();
  });

  it('calculates net revenue correctly with default fee', () => {
    const { queryByText } = render(<PayoutCard feePerPerson={500} maxSeats={10} />);
    const net = (4750).toLocaleString();
    expect(queryByText(`₹${net}`)).toBeTruthy();
  });

  it('shows Platform Fee (5%) label by default', () => {
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

  /* ── Dynamic platform fee prop tests ── */
  it('calculates with custom platformFeePercent', () => {
    const { queryByText } = render(
      <PayoutCard feePerPerson={1000} maxSeats={10} platformFeePercent={10} />,
    );
    // Gross: 10000, Fee: 10% of 10000 = 1000, Net: 9000
    expect(queryByText(`- ₹${(1000).toLocaleString()}`)).toBeTruthy();
    expect(queryByText(`₹${(9000).toLocaleString()}`)).toBeTruthy();
  });

  it('shows custom fee percentage label', () => {
    const { getByText } = render(
      <PayoutCard feePerPerson={100} maxSeats={5} platformFeePercent={8} />,
    );
    expect(getByText('Platform Fee (8%)')).toBeTruthy();
  });

  it('does not show override indicator when feeSource is GLOBAL', () => {
    const { queryByText } = render(
      <PayoutCard feePerPerson={100} maxSeats={5} feeSource="GLOBAL" />,
    );
    expect(queryByText(/override active/i)).toBeNull();
  });

  it('shows override indicator when feeSource is USER_OVERRIDE', () => {
    const { getByText } = render(
      <PayoutCard
        feePerPerson={100}
        maxSeats={5}
        platformFeePercent={8}
        feeSource="USER_OVERRIDE"
      />,
    );
    expect(getByText(/override active/i)).toBeTruthy();
  });

  it('shows override indicator for POD_OVERRIDE source', () => {
    const { getByText } = render(
      <PayoutCard
        feePerPerson={100}
        maxSeats={5}
        platformFeePercent={6}
        feeSource="POD_OVERRIDE"
      />,
    );
    expect(getByText(/override active/i)).toBeTruthy();
  });

  it('does not show override indicator when feeSource undefined', () => {
    const { queryByText } = render(<PayoutCard feePerPerson={100} maxSeats={5} />);
    expect(queryByText(/override active/i)).toBeNull();
  });

  it('calculates with boundary 2% fee', () => {
    const { queryByText } = render(
      <PayoutCard feePerPerson={1000} maxSeats={10} platformFeePercent={2} />,
    );
    // Gross: 10000, Fee: 200, Net: 9800
    expect(queryByText(`- ₹${(200).toLocaleString()}`)).toBeTruthy();
  });

  it('calculates with boundary 15% fee', () => {
    const { queryByText } = render(
      <PayoutCard feePerPerson={1000} maxSeats={10} platformFeePercent={15} />,
    );
    // Gross: 10000, Fee: 1500, Net: 8500
    expect(queryByText(`- ₹${(1500).toLocaleString()}`)).toBeTruthy();
  });
});
