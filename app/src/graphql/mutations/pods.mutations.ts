import { gql } from '@apollo/client';

export const CREATE_POD = gql`
  mutation CreatePod($input: CreatePodInput!) {
    createPod(input: $input) {
      id
      title
      description
      category
    }
  }
`;

export const JOIN_POD = gql`
  mutation JoinPod($podId: ID!) {
    joinPod(podId: $podId) {
      id
      currentSeats
      attendees {
        id
        name
        avatar
      }
    }
  }
`;

export const CHECKOUT_POD = gql`
  mutation CheckoutPod($podId: ID!) {
    checkoutPod(podId: $podId) {
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
      paymentId
      isDummy
    }
  }
`;

export const DELETE_POD = gql`
  mutation DeletePod($id: ID!) {
    deletePod(id: $id)
  }
`;

export const SAVE_POD = gql`
  mutation SavePod($podId: ID!) {
    savePod(podId: $podId) {
      id
      savedPodIds
    }
  }
`;

export const UNSAVE_POD = gql`
  mutation UnsavePod($podId: ID!) {
    unsavePod(podId: $podId) {
      id
      savedPodIds
    }
  }
`;

export const TRACK_POD_VIEW = gql`
  mutation TrackPodView($podId: ID!) {
    trackPodView(podId: $podId) {
      id
      viewCount
    }
  }
`;

export const REOPEN_POD = gql`
  mutation ReopenPod($id: ID!) {
    reopenPod(id: $id) {
      id
      status
      dateTime
      currentSeats
    }
  }
`;
