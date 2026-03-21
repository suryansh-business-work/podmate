import { v4 as uuidv4 } from 'uuid';
import type {
  Meeting,
  CreateMeetingInput,
  UpdateMeetingInput,
  RescheduleMeetingInput,
} from './meeting.models';
import { MeetingModel, toMeeting } from './meeting.models';
import { sendEmail } from '../../lib/email';
import {
  meetingConfirmationTemplate,
  meetingAdminNotificationTemplate,
} from '../../lib/emailTemplates';
import {
  createGoogleMeetEvent,
  updateGoogleMeetEvent,
  deleteGoogleMeetEvent,
} from './googleCalendar.service';
import logger from '../../lib/logger';

export interface MeetingPaginationInput {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedMeetings {
  items: Meeting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MeetingCounts {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

const MEETING_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
];

const MAX_MEETINGS_PER_SLOT = 1;

export async function createMeeting(
  userId: string,
  userName: string,
  input: CreateMeetingInput,
): Promise<Meeting> {
  const existingSlot = await MeetingModel.countDocuments({
    meetingDate: input.meetingDate,
    meetingTime: input.meetingTime,
    status: { $in: ['PENDING', 'CONFIRMED'] },
  });

  if (existingSlot >= MAX_MEETINGS_PER_SLOT) {
    throw new Error('This time slot is already booked. Please select another slot.');
  }

  const now = new Date().toISOString();
  const doc = await MeetingModel.create({
    _id: uuidv4(),
    userId,
    userEmail: input.email.trim(),
    meetingDate: input.meetingDate.trim(),
    meetingTime: input.meetingTime.trim(),
    meetingLink: '',
    status: 'PENDING',
    purpose: input.purpose ?? 'GENERAL',
    adminNote: '',
    cancelReason: '',
    completedAt: '',
    createdAt: now,
    updatedAt: now,
  });

  const meeting = toMeeting(doc.toObject({ virtuals: true })) as Meeting;
  logger.info(
    `Meeting request created by user ${userId} for ${input.meetingDate} at ${input.meetingTime}`,
  );

  // Send confirmation email to user
  const userEmailContent = meetingConfirmationTemplate(
    userName,
    input.meetingDate,
    input.meetingTime,
  );
  sendEmail({
    to: input.email.trim(),
    subject: userEmailContent.subject,
    text: userEmailContent.text,
    html: userEmailContent.html,
  }).catch((err) => logger.error('Failed to send meeting confirmation email:', err));

  // Send notification to admin
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? '';
  if (adminEmail) {
    const adminEmailContent = meetingAdminNotificationTemplate(
      userName,
      input.email.trim(),
      input.meetingDate,
      input.meetingTime,
    );
    sendEmail({
      to: adminEmail,
      subject: adminEmailContent.subject,
      text: adminEmailContent.text,
      html: adminEmailContent.html,
    }).catch((err) => logger.error('Failed to send admin meeting notification:', err));
  }

  return meeting;
}

export async function getMyMeetings(userId: string): Promise<Meeting[]> {
  const docs = await MeetingModel.find({ userId }).sort({ createdAt: -1 }).lean({ virtuals: true });
  return docs.map(toMeeting).filter(Boolean) as Meeting[];
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  const doc = await MeetingModel.findById(id).lean({ virtuals: true });
  return toMeeting(doc);
}

export async function getBookedSlots(meetingDate: string): Promise<Array<{ meetingTime: string }>> {
  const docs = await MeetingModel.find({
    meetingDate,
    status: { $in: ['PENDING', 'CONFIRMED'] },
  })
    .select('meetingTime')
    .lean();

  const slotCounts = new Map<string, number>();
  for (const doc of docs) {
    const count = slotCounts.get(doc.meetingTime) ?? 0;
    slotCounts.set(doc.meetingTime, count + 1);
  }

  const bookedSlots: Array<{ meetingTime: string }> = [];
  for (const [time, count] of slotCounts.entries()) {
    if (count >= MAX_MEETINGS_PER_SLOT) {
      bookedSlots.push({ meetingTime: time });
    }
  }

  return bookedSlots;
}

export function getAvailableSlots(): string[] {
  return MEETING_SLOTS;
}

export async function getPaginatedMeetings(
  input: MeetingPaginationInput,
): Promise<PaginatedMeetings> {
  const filter: Record<string, unknown> = {};
  if (input.status) filter.status = input.status;
  if (input.search) {
    filter.$or = [
      { userEmail: { $regex: input.search, $options: 'i' } },
      { meetingDate: { $regex: input.search, $options: 'i' } },
    ];
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const sortOrder = input.order === 'ASC' ? 1 : -1;
  const total = await MeetingModel.countDocuments(filter);
  const totalPages = Math.ceil(total / input.limit);
  const skip = (input.page - 1) * input.limit;

  const docs = await MeetingModel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(input.limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toMeeting).filter(Boolean) as Meeting[],
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  };
}

export async function updateMeeting(
  id: string,
  input: UpdateMeetingInput,
  userName?: string,
  userEmail?: string,
): Promise<Meeting> {
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.status !== undefined) {
    update.status = input.status;
    if (input.status === 'COMPLETED') {
      update.completedAt = new Date().toISOString();
    }
  }
  if (input.adminNote !== undefined) update.adminNote = input.adminNote;
  if (input.meetingLink !== undefined) update.meetingLink = input.meetingLink;
  if (input.cancelReason !== undefined) update.cancelReason = input.cancelReason;

  // Auto-create Google Meet event when confirming
  if (input.status === 'CONFIRMED' && userEmail) {
    const existingMeeting = await getMeetingById(id);
    if (existingMeeting && !existingMeeting.googleEventId) {
      const meetResult = await createGoogleMeetEvent(
        `PartyWings Meeting - ${userName ?? 'User'}`,
        `1:1 meeting with ${userName ?? 'User'} (${userEmail})`,
        existingMeeting.meetingDate,
        existingMeeting.meetingTime,
        userEmail,
      );

      if (meetResult) {
        update.meetingLink = meetResult.meetLink;
        update.googleEventId = meetResult.eventId;
      }
    }
  }

  // Cancel Google Calendar event when cancelling
  if (input.status === 'CANCELLED') {
    const existingMeeting = await getMeetingById(id);
    if (existingMeeting?.googleEventId) {
      deleteGoogleMeetEvent(existingMeeting.googleEventId).catch((err) =>
        logger.error('Failed to delete Google Calendar event:', err),
      );
    }
  }

  const updated = await MeetingModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toMeeting(updated);
  if (!result) throw new Error('Meeting not found');
  logger.info(`Meeting updated: ${result.id}`);

  // If meeting is confirmed, notify user with meeting link
  if (input.status === 'CONFIRMED' && userEmail) {
    const meetingLink = (update.meetingLink as string) || result.meetingLink;
    if (meetingLink) {
      const { meetingInviteTemplate } = await import('../../lib/emailTemplates');
      const emailContent = meetingInviteTemplate(
        userName ?? 'User',
        result.meetingDate,
        result.meetingTime,
        meetingLink,
      );
      sendEmail({
        to: userEmail,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      }).catch((err) => logger.error('Failed to send meeting invite email:', err));
    }
  }

  return result;
}

export async function rescheduleMeeting(
  id: string,
  input: RescheduleMeetingInput,
  rescheduledBy: string,
  userName?: string,
  userEmail?: string,
): Promise<Meeting> {
  const meeting = await getMeetingById(id);
  if (!meeting) throw new Error('Meeting not found');

  if (meeting.status === 'COMPLETED' || meeting.status === 'CANCELLED') {
    throw new Error('Cannot reschedule a completed or cancelled meeting');
  }

  // Check slot availability
  const existingSlot = await MeetingModel.countDocuments({
    meetingDate: input.meetingDate,
    meetingTime: input.meetingTime,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    _id: { $ne: id },
  });

  if (existingSlot >= MAX_MEETINGS_PER_SLOT) {
    throw new Error('This time slot is already booked. Please select another slot.');
  }

  const previousDateTime = `${meeting.meetingDate} at ${meeting.meetingTime}`;

  const update: Record<string, unknown> = {
    meetingDate: input.meetingDate.trim(),
    meetingTime: input.meetingTime.trim(),
    rescheduledFrom: previousDateTime,
    rescheduledBy,
    updatedAt: new Date().toISOString(),
  };

  // Update Google Calendar event if it exists
  if (meeting.googleEventId) {
    const meetResult = await updateGoogleMeetEvent(
      meeting.googleEventId,
      input.meetingDate,
      input.meetingTime,
    );
    if (meetResult) {
      update.meetingLink = meetResult.meetLink;
    }
  }

  const updated = await MeetingModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toMeeting(updated);
  if (!result) throw new Error('Meeting not found');

  logger.info(`Meeting rescheduled: ${result.id} from ${previousDateTime}`);

  // Notify user about reschedule
  const email = userEmail ?? meeting.userEmail;
  if (email) {
    const { meetingRescheduleTemplate } = await import('../../lib/emailTemplates');
    const emailContent = meetingRescheduleTemplate(
      userName ?? 'User',
      previousDateTime,
      input.meetingDate,
      input.meetingTime,
      result.meetingLink,
    );
    sendEmail({
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    }).catch((err) => logger.error('Failed to send reschedule email:', err));
  }

  return result;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const result = await MeetingModel.deleteOne({ _id: id });
  if (result.deletedCount > 0) logger.info(`Meeting deleted: ${id}`);
  return result.deletedCount > 0;
}

export async function getMeetingCounts(): Promise<MeetingCounts> {
  const [pending, confirmed, completed, cancelled, total] = await Promise.all([
    MeetingModel.countDocuments({ status: 'PENDING' }),
    MeetingModel.countDocuments({ status: 'CONFIRMED' }),
    MeetingModel.countDocuments({ status: 'COMPLETED' }),
    MeetingModel.countDocuments({ status: 'CANCELLED' }),
    MeetingModel.countDocuments(),
  ]);
  return { pending, confirmed, completed, cancelled, total };
}
