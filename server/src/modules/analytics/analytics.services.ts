import type { HostAnalytics, VenueAnalytics } from './analytics.models';
import { UserModel, UserRole } from '../user/user.models';
import { PodModel } from '../pod/pod.models';
import { PlaceModel, PlaceStatus } from '../place/place.models';
import { PaymentModel } from '../payment/payment.models';
import { ReviewModel } from '../review/review.models';

export async function getHostAnalytics(userId: string): Promise<HostAnalytics> {
  const hostPods = await PodModel.find({ hostId: userId }).lean();

  const cancelledPods = hostPods.filter((p) => p.status === 'CANCELLED').length;
  const completedOrConfirmed = hostPods.filter(
    (p) => p.status === 'COMPLETED' || p.status === 'CONFIRMED',
  );

  const podIds = hostPods.map((p) => p._id);

  const payments = await PaymentModel.find({
    podId: { $in: podIds },
    type: 'PAYMENT',
    status: 'COMPLETED',
  }).lean();
  const totalEarning = payments.reduce(
    (sum, p) => sum + ((p as unknown as Record<string, number>).amount ?? 0),
    0,
  );

  const podCount = completedOrConfirmed.length || 1;
  const perPodAverageEarning = Math.round((totalEarning / podCount) * 100) / 100;

  const reviews = await ReviewModel.find({
    targetType: 'POD',
    targetId: { $in: podIds },
    parentId: '',
  })
    .select('rating')
    .lean();
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce(
            (sum, r) => sum + ((r as unknown as Record<string, number>).rating ?? 0),
            0,
          ) /
            reviews.length) *
            10,
        ) / 10
      : 0;

  const user = await UserModel.findById(userId).lean();
  let profileHealth = 0;
  if (user) {
    if (user.name) profileHealth += 20;
    if (user.avatar) profileHealth += 20;
    if (user.email) profileHealth += 20;
    if (user.dob) profileHealth += 20;
    if (user.username) profileHealth += 20;
  }

  const numberOfPodHosts = await UserModel.countDocuments({
    roles: UserRole.HOST,
    isActive: true,
  });

  return {
    numberOfPodHosts,
    cancelledPods,
    totalEarning,
    perPodAverageEarning,
    rating: avgRating,
    hostProfileHealth: profileHealth,
  };
}

export async function getVenueAnalytics(userId: string): Promise<VenueAnalytics> {
  const myPlaces = await PlaceModel.find({ ownerId: userId }).lean();
  const totalRegisteredVenues = myPlaces.length;
  const cancelledVenues = myPlaces.filter((p) => p.status === PlaceStatus.REJECTED).length;

  const approvedPlaceIds = myPlaces
    .filter((p) => p.status === PlaceStatus.APPROVED)
    .map((p) => p._id);

  const venuePods = await PodModel.find({
    placeId: { $in: approvedPlaceIds },
  }).lean();

  const upcomingStatuses = ['NEW', 'PENDING', 'CONFIRMED', 'OPEN'];
  const totalUpcomingPartyRequests = venuePods.filter((p) =>
    upcomingStatuses.includes(p.status),
  ).length;
  const acceptedVenuePartyRequests = venuePods.filter(
    (p) => p.status === 'CONFIRMED' || p.status === 'COMPLETED',
  ).length;

  const placeReviews = await ReviewModel.find({
    targetType: 'PLACE',
    targetId: { $in: approvedPlaceIds },
    parentId: '',
  })
    .select('rating')
    .lean();
  const venueRating =
    placeReviews.length > 0
      ? Math.round(
          (placeReviews.reduce(
            (sum, r) => sum + ((r as unknown as Record<string, number>).rating ?? 0),
            0,
          ) /
            placeReviews.length) *
            10,
        ) / 10
      : 0;

  const venuePayments = await PaymentModel.find({
    podId: { $in: venuePods.map((p) => p._id) },
    type: 'EARNING',
    status: 'COMPLETED',
  }).lean();
  const totalEarnings = venuePayments.reduce(
    (sum, p) => sum + ((p as unknown as Record<string, number>).amount ?? 0),
    0,
  );

  return {
    totalRegisteredVenues,
    totalUpcomingPartyRequests,
    acceptedVenuePartyRequests,
    cancelledVenues,
    venueRating,
    totalEarnings,
  };
}
