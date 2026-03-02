import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers($page: Int, $limit: Int, $search: String, $sortBy: String, $order: String) {
    users(page: $page, limit: $limit, search: $search, sortBy: $sortBy, order: $order) {
      items {
        id
        phone
        name
        avatar
        role
        isVerifiedHost
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_PODS = gql`
  query GetPods(
    $category: String
    $page: Int
    $limit: Int
    $search: String
    $sortBy: String
    $order: String
  ) {
    pods(
      category: $category
      page: $page
      limit: $limit
      search: $search
      sortBy: $sortBy
      order: $order
    ) {
      items {
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
        createdAt
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
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    users(page: 1, limit: 1) {
      total
    }
    pods(page: 1, limit: 1) {
      total
    }
  }
`;
