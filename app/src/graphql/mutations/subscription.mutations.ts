import { gql } from '@apollo/client';

export const CHECKOUT_OCCURRENCE_POD = gql`
  mutation CheckoutOccurrencePod($podId: ID!) {
    checkoutOccurrencePod(podId: $podId) {
      success
      pod {
        id
        currentSeats
        attendees {
          id
          name
          avatar
        }
      }
      subscription {
        id
        status
        billingCycle
        amountPerCycle
        totalPaid
        cyclesCompleted
        totalCycles
        nextBillingDate
      }
      paymentId
      isDummy
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($subscriptionId: ID!) {
    cancelSubscription(subscriptionId: $subscriptionId) {
      id
      status
      cancelledAt
    }
  }
`;

export const RENEW_SUBSCRIPTION = gql`
  mutation RenewSubscription($subscriptionId: ID!) {
    renewSubscription(subscriptionId: $subscriptionId) {
      id
      status
      cyclesCompleted
      totalPaid
      nextBillingDate
    }
  }
`;
