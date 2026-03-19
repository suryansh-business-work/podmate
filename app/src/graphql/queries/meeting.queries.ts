import { gql } from '@apollo/client';

export const GET_MY_MEETINGS = gql`
  query GetMyMeetings {
    myMeetings {
      id
      userEmail
      meetingDate
      meetingTime
      meetingLink
      status
      adminNote
      cancelReason
      createdAt
    }
  }
`;

export const GET_BOOKED_SLOTS = gql`
  query GetBookedSlots($meetingDate: String!) {
    bookedSlots(meetingDate: $meetingDate) {
      meetingTime
    }
  }
`;

export const GET_AVAILABLE_MEETING_SLOTS = gql`
  query GetAvailableMeetingSlots {
    availableMeetingSlots
  }
`;
