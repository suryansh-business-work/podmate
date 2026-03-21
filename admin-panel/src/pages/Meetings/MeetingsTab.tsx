import React, { useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MEETINGS, GET_MEETING_COUNTS } from '../../graphql/queries';
import { UPDATE_MEETING, DELETE_MEETING, RESCHEDULE_MEETING } from '../../graphql/mutations';
import { useDebounce } from '../../hooks/useDebounce';
import type { Meeting, PaginatedMeetings, MeetingCountsData, MeetingOrder } from './Meetings.types';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import MeetingViewDialog from './MeetingViewDialog';
import MeetingEditDialog from './MeetingEditDialog';
import MeetingRescheduleDialog from './MeetingRescheduleDialog';
import MeetingsTable from './MeetingsTable';
import MeetingStatsCards from './MeetingStatsCards';
import MeetingFilters from './MeetingFilters';

const MeetingsTab: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<MeetingOrder>('DESC');
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
  const [viewMeeting, setViewMeeting] = useState<Meeting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [rescheduleMeeting, setRescheduleMeeting] = useState<Meeting | null>(null);

  const { data: countsData } = useQuery<MeetingCountsData>(GET_MEETING_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data, loading, refetch } = useQuery<PaginatedMeetings>(GET_MEETINGS, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      sortBy,
      order,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [updateReq, { loading: updating }] = useMutation(UPDATE_MEETING);
  const [deleteReq] = useMutation(DELETE_MEETING);
  const [rescheduleReq, { loading: rescheduling }] = useMutation(RESCHEDULE_MEETING);

  const items = data?.meetings?.items ?? [];
  const total = data?.meetings?.total ?? 0;
  const counts = countsData?.meetingCounts;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditMeeting(meeting);
  };

  const handleSaveEdit = async (input: {
    status?: string;
    adminNote?: string;
    meetingLink?: string;
    cancelReason?: string;
  }) => {
    if (!editMeeting) return;
    try {
      await updateReq({ variables: { id: editMeeting.id, input } });
      await refetch();
      setEditMeeting(null);
    } catch {
      /* handled by Apollo */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReq({ variables: { id: deleteTarget.id } });
      await refetch();
      setDeleteTarget(null);
    } catch {
      /* handled */
    }
  };

  const handleSaveReschedule = async (meetingDate: string, meetingTime: string) => {
    if (!rescheduleMeeting) return;
    try {
      await rescheduleReq({
        variables: {
          id: rescheduleMeeting.id,
          input: { meetingDate, meetingTime },
        },
      });
      await refetch();
      setRescheduleMeeting(null);
    } catch {
      /* handled by Apollo */
    }
  };

  return (
    <Box>
      {counts && <MeetingStatsCards counts={counts} />}

      <MeetingFilters
        searchInput={searchInput}
        statusFilter={statusFilter}
        onSearchChange={(v) => {
          setSearchInput(v);
          setPage(0);
        }}
        onStatusChange={(v) => {
          setStatusFilter(v);
          setPage(0);
        }}
      />

      {loading && !data && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}
      {!loading && items.length === 0 && <Alert severity="info">No meeting requests found.</Alert>}

      {items.length > 0 && (
        <MeetingsTable
          items={items}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          sortBy={sortBy}
          order={order}
          onPageChange={setPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setPage(0);
          }}
          onSort={handleSort}
          onView={setViewMeeting}
          onEdit={handleEdit}
          onReschedule={setRescheduleMeeting}
          onDelete={setDeleteTarget}
        />
      )}

      <MeetingViewDialog
        meeting={viewMeeting}
        onClose={() => setViewMeeting(null)}
        onEdit={handleEdit}
      />

      <MeetingEditDialog
        meeting={editMeeting}
        saving={updating}
        onClose={() => setEditMeeting(null)}
        onSave={handleSaveEdit}
      />

      <MeetingRescheduleDialog
        meeting={rescheduleMeeting}
        saving={rescheduling}
        onClose={() => setRescheduleMeeting(null)}
        onSave={handleSaveReschedule}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete Meeting"
        entityName={deleteTarget?.user?.name ?? 'Unknown'}
        entityType="meeting"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default MeetingsTab;
