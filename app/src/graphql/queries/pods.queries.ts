import { gql } from '@apollo/client';

export const GET_PODS = gql`
  query GetPods($category: String, $page: Int, $limit: Int, $search: String) {
    pods(category: $category, page: $page, limit: $limit, search: $search) {
      items {
        id
        title
        description
        category
        imageUrl
        mediaUrls
        feePerPerson
        maxSeats
        currentSeats
        dateTime
        location
        locationDetail
        latitude
        longitude
        rating
        reviewCount
        status
        podType
        recurrence
        occurrenceCount
        host {
          id
          name
          avatar
          isVerifiedHost
        }
        attendees {
          id
        }
      }
      total
      page
      limit
      totalPages
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
      mediaUrls
      feePerPerson
      maxSeats
      currentSeats
      dateTime
      location
      locationDetail
      latitude
      longitude
      rating
      reviewCount
      status
      refundPolicy
      podType
      startDate
      endDate
      recurrence
      occurrenceCount
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

export const GET_MY_PODS = gql`
  query GetMyPods {
    myPods {
      id
      title
      imageUrl
      mediaUrls
      category
      status
    }
  }
`;
