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

export const RESCHEDULE_MEETING = gql`
  mutation RescheduleMeeting($id: ID!, $input: RescheduleMeetingInput!) {
    rescheduleMeeting(id: $id, input: $input) {
      id
      meetingDate
      meetingTime
      meetingLink
      googleEventId
      status
      rescheduledFrom
      rescheduledBy
      updatedAt
    }
  }
`;
