import { gql } from '@apollo/client';

export const GET_PODS = gql`
  query GetPods($category: String) {
    pods(category: $category) {
      id
      title
      description
      category
      imageUrl
      feePerPerson
      maxSeats
      currentSeats
      dateTime
      location
      locationDetail
      rating
      reviewCount
      status
      host {
        id
        name
        avatar
        isVerifiedHost
      }
    }
  }
`;

export const GET_POD = gql`
  query GetPod($id: ID!) {
    pod(id: $id) {
      id
      title
      description
      category
      imageUrl
      feePerPerson
      maxSeats
      currentSeats
      dateTime
      location
      locationDetail
      rating
      reviewCount
      status
      refundPolicy
      host {
        id
        name
        avatar
        isVerifiedHost
      }
      attendees {
        id
        name
        avatar
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      phone
      name
      avatar
      isVerifiedHost
    }
  }
`;
