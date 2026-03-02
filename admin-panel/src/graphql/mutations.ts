import { gql } from '@apollo/client';

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SEND_ADMIN_CREDENTIALS = gql`
  mutation SendAdminCredentials($email: String!) {
    sendAdminCredentials(email: $email) {
      success
      message
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export const CREATE_POLICY = gql`
  mutation CreatePolicy($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
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

export const UPDATE_POLICY = gql`
  mutation UpdatePolicy($id: ID!, $input: UpdatePolicyInput!) {
    updatePolicy(id: $id, input: $input) {
      id
      type
      title
      content
      isActive
      updatedAt
    }
  }
`;

export const DELETE_POLICY = gql`
  mutation DeletePolicy($id: ID!) {
    deletePolicy(id: $id)
  }
`;

export const ADMIN_CREATE_USER = gql`
  mutation AdminCreateUser($phone: String!, $name: String!, $role: UserRole!) {
    adminCreateUser(phone: $phone, name: $name, role: $role) {
      id
      phone
      name
      role
      createdAt
    }
  }
`;

export const CREATE_POD = gql`
  mutation CreatePod($input: CreatePodInput!) {
    createPod(input: $input) {
      id
      title
      description
      category
      feePerPerson
      maxSeats
      dateTime
      location
      locationDetail
      status
      createdAt
    }
  }
`;

export const ADMIN_CREATE_PLACE = gql`
  mutation AdminCreatePlace($input: CreatePlaceInput!, $ownerId: ID!) {
    adminCreatePlace(input: $input, ownerId: $ownerId) {
      id
      name
      description
      address
      city
      category
      status
      isVerified
      createdAt
    }
  }
`;

export const APPROVE_PLACE = gql`
  mutation ApprovePlace($id: ID!) {
    approvePlace(id: $id) {
      id
      status
      isVerified
    }
  }
`;

export const REJECT_PLACE = gql`
  mutation RejectPlace($id: ID!) {
    rejectPlace(id: $id) {
      id
      status
      isVerified
    }
  }
`;

export const DELETE_PLACE = gql`
  mutation DeletePlace($id: ID!) {
    deletePlace(id: $id)
  }
`;
