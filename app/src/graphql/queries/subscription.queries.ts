import { gql } from '@apollo/client';

export const GET_MY_SUBSCRIPTIONS = gql`
  query GetMySubscriptions($page: Int, $limit: Int) {
    mySubscriptions(page: $page, limit: $limit) {
      items {
        id
        podId
        status
        billingCycle
        amountPerCycle
        totalPaid
        cyclesCompleted
        totalCycles
        nextBillingDate
        startDate
        endDate
        cancelledAt
        pod {
          id
          title
          imageUrl
          category
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_SUBSCRIPTION_FOR_POD = gql`
  query GetSubscriptionForPod($podId: ID!) {
    subscriptionForPod(podId: $podId) {
      id
      status
      billingCycle
      amountPerCycle
      totalPaid
      cyclesCompleted
      totalCycles
      nextBillingDate
      startDate
      endDate
      cancelledAt
    }
  }
`;
