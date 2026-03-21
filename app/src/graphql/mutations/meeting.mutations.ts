import { gql } from '@apollo/client';

export const REQUEST_MEETING = gql`
  mutation RequestMeeting($input: CreateMeetingInput!) {
    requestMeeting(input: $input) {
      id
      userEmail
      meetingDate
      meetingTime
      purpose
      status
      createdAt
    }
  }
`;
