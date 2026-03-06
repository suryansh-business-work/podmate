import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonCard, SkeletonFeed, SkeletonProfile, SkeletonDetail } from '../Skeleton';

jest.mock('../../theme', () => ({
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  borderRadius: { sm: 8, md: 12, lg: 16, full: 999 },
}));

describe('Skeleton Components', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('SkeletonCard', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<SkeletonCard />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('SkeletonFeed', () => {
    it('renders with default count of 3 skeleton cards', () => {
      const { toJSON } = render(<SkeletonFeed />);
      const tree = toJSON();
      expect(tree).toBeTruthy();
    });

    it('renders with custom count', () => {
      const { toJSON } = render(<SkeletonFeed count={5} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with count of 0', () => {
      const { toJSON } = render(<SkeletonFeed count={0} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('SkeletonProfile', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<SkeletonProfile />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('SkeletonDetail', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<SkeletonDetail />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
