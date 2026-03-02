import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers($page: Int, $limit: Int, $search: String, $sortBy: String, $order: String) {
    users(page: $page, limit: $limit, search: $search, sortBy: $sortBy, order: $order) {
      items {
        id
        phone
        email
        name
        age
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
    dashboardStats {
      totalUsers
      totalPods
      activePods
      totalRevenue
    }
  }
`;

export const GET_POLICIES = gql`
  query GetPolicies($type: String) {
    policies(type: $type) {
      id
      type
      title
      content
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_PLACES = gql`
  query GetPlaces($page: Int, $limit: Int, $search: String, $status: String, $sortBy: String, $order: String) {
    places(page: $page, limit: $limit, search: $search, status: $status, sortBy: $sortBy, order: $order) {
      items {
        id
        name
        description
        address
        city
        imageUrl
        owner {
          id
          name
          phone
        }
        category
        phone
        email
        status
        isVerified
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;
