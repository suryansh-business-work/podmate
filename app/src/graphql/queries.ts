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
      role
      isVerifiedHost
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($podId: ID!) {
    chatMessages(podId: $podId) {
      id
      podId
      senderId
      content
      createdAt
      sender {
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
      category
      status
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
    }
  }
`;
