import * as analyticsService from '../analytics.services';
import { UserModel } from '../../user/user.models';
import { PodModel } from '../../pod/pod.models';
import { PlaceModel } from '../../place/place.models';
import { PaymentModel } from '../../payment/payment.models';
import { ReviewModel } from '../../review/review.models';

jest.mock('../../user/user.models', () => ({
  UserModel: { findById: jest.fn(), countDocuments: jest.fn() },
  UserRole: { USER: 'USER', HOST: 'HOST', VENUE_OWNER: 'VENUE_OWNER', ADMIN: 'ADMIN' },
}));

jest.mock('../../pod/pod.models', () => ({
  PodModel: { find: jest.fn() },
}));

jest.mock('../../place/place.models', () => ({
  PlaceModel: { find: jest.fn() },
  PlaceStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' },
}));

jest.mock('../../payment/payment.models', () => ({
  PaymentModel: { find: jest.fn() },
}));

jest.mock('../../review/review.models', () => ({
  ReviewModel: { find: jest.fn() },
}));

describe('analytics.services - getHostAnalytics', () => {
  const userId = 'host-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns host analytics with no pods', async () => {
    (PodModel.find as jest.Mock).mockReturnValue({ lean: () => [] });
    (PaymentModel.find as jest.Mock).mockReturnValue({ lean: () => [] });
    (ReviewModel.find as jest.Mock).mockReturnValue({
      select: () => ({ lean: () => [] }),
    });
    (UserModel.findById as jest.Mock).mockReturnValue({
      lean: () => ({ name: 'Host', avatar: 'a', email: 'e', dob: 'd', username: 'u' }),
    });
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(10);

    const result = await analyticsService.getHostAnalytics(userId);

    expect(result.numberOfPodHosts).toBe(10);
    expect(result.cancelledPods).toBe(0);
    expect(result.totalEarning).toBe(0);
    expect(result.perPodAverageEarning).toBe(0);
    expect(result.rating).toBe(0);
    expect(result.hostProfileHealth).toBe(100);
  });

  it('calculates cancelled pods and earnings correctly', async () => {
    const pods = [
      { _id: 'p1', status: 'CANCELLED' },
      { _id: 'p2', status: 'COMPLETED' },
      { _id: 'p3', status: 'CONFIRMED' },
    ];
    (PodModel.find as jest.Mock).mockReturnValue({ lean: () => pods });
    (PaymentModel.find as jest.Mock).mockReturnValue({
      lean: () => [{ amount: 500 }, { amount: 300 }],
    });
    (ReviewModel.find as jest.Mock).mockReturnValue({
      select: () => ({ lean: () => [{ rating: 4 }, { rating: 5 }] }),
    });
    (UserModel.findById as jest.Mock).mockReturnValue({
      lean: () => ({ name: 'Host', avatar: '', email: '', dob: '', username: '' }),
    });
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(5);

    const result = await analyticsService.getHostAnalytics(userId);

    expect(result.cancelledPods).toBe(1);
    expect(result.totalEarning).toBe(800);
    expect(result.perPodAverageEarning).toBe(400);
    expect(result.rating).toBe(4.5);
    expect(result.hostProfileHealth).toBe(20);
  });

  it('handles partial profile health', async () => {
    (PodModel.find as jest.Mock).mockReturnValue({ lean: () => [] });
    (PaymentModel.find as jest.Mock).mockReturnValue({ lean: () => [] });
    (ReviewModel.find as jest.Mock).mockReturnValue({
      select: () => ({ lean: () => [] }),
    });
    (UserModel.findById as jest.Mock).mockReturnValue({
      lean: () => ({ name: 'A', avatar: 'a', email: '', dob: '', username: '' }),
    });
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(0);

    const result = await analyticsService.getHostAnalytics(userId);
    expect(result.hostProfileHealth).toBe(40);
  });

  it('handles null user gracefully', async () => {
    (PodModel.find as jest.Mock).mockReturnValue({ lean: () => [] });
    (PaymentModel.find as jest.Mock).mockReturnValue({ lean: () => [] });
    (ReviewModel.find as jest.Mock).mockReturnValue({
      select: () => ({ lean: () => [] }),
    });
    (UserModel.findById as jest.Mock).mockReturnValue({ lean: () => null });
    (UserModel.countDocuments as jest.Mock).mockResolvedValue(0);

    const result = await analyticsService.getHostAnalytics(userId);
    expect(result.hostProfileHealth).toBe(0);
  });
});

describe('analytics.services - getVenueAnalytics', () => {
  const userId = 'owner-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns venue analytics with no venues', async () => {
    (PlaceModel.find as jest.Mock).mockReturnValue({ lean: () => [] });
    (PodModel.find as jest.Mock).mockReturnValue({ lean: () => [] });
    (ReviewModel.find as jest.Mock).mockReturnValue({
      select: () => ({ lean: () => [] }),
    });
    (PaymentModel.find as jest.Mock).mockReturnValue({ lean: () => [] });

    const result = await analyticsService.getVenueAnalytics(userId);

    expect(result.totalRegisteredVenues).toBe(0);
    expect(result.totalUpcomingPartyRequests).toBe(0);
    expect(result.acceptedVenuePartyRequests).toBe(0);
    expect(result.cancelledVenues).toBe(0);
    expect(result.venueRating).toBe(0);
    expect(result.totalEarnings).toBe(0);
  });

  it('calculates venue stats correctly', async () => {
    const places = [
      { _id: 'v1', status: 'APPROVED' },
      { _id: 'v2', status: 'REJECTED' },
      { _id: 'v3', status: 'APPROVED' },
    ];
    const venuePods = [
      { _id: 'vp1', status: 'CONFIRMED', placeId: 'v1' },
      { _id: 'vp2', status: 'CANCELLED', placeId: 'v1' },
      { _id: 'vp3', status: 'PENDING', placeId: 'v3' },
    ];

    (PlaceModel.find as jest.Mock).mockReturnValue({ lean: () => places });
    (PodModel.find as jest.Mock).mockReturnValue({ lean: () => venuePods });
    (ReviewModel.find as jest.Mock).mockReturnValue({
      select: () => ({ lean: () => [{ rating: 3 }, { rating: 4 }] }),
    });
    (PaymentModel.find as jest.Mock).mockReturnValue({
      lean: () => [{ amount: 200 }],
    });

    const result = await analyticsService.getVenueAnalytics(userId);

    expect(result.totalRegisteredVenues).toBe(3);
    expect(result.cancelledVenues).toBe(1);
    expect(result.totalUpcomingPartyRequests).toBe(2);
    expect(result.acceptedVenuePartyRequests).toBe(1);
    expect(result.venueRating).toBe(3.5);
    expect(result.totalEarnings).toBe(200);
  });
});
