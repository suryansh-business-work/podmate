import { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_UNREAD_NOTIFICATION_COUNT } from '../graphql/queries';

const POLL_INTERVAL_MS = 30_000;

interface UnreadCountData {
  unreadNotificationCount: number;
}

interface UseInAppNotificationsOptions {
  isAuthenticated: boolean;
}

interface UseInAppNotificationsResult {
  unreadCount: number;
  loading: boolean;
}

export function useInAppNotifications({
  isAuthenticated,
}: UseInAppNotificationsOptions): UseInAppNotificationsResult {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, loading, refetch } = useQuery<UnreadCountData>(
    GET_UNREAD_NOTIFICATION_COUNT,
    {
      skip: !isAuthenticated,
      fetchPolicy: 'cache-and-network',
    },
  );

  useEffect(() => {
    if (!isAuthenticated) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    pollRef.current = setInterval(() => {
      refetch();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isAuthenticated, refetch]);

  return {
    unreadCount: data?.unreadNotificationCount ?? 0,
    loading,
  };
}
