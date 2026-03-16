import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../../graphql/queries';

type InitialRoute = 'Main' | 'Dashboard';

interface RoleBasedInitialRouteResult {
  initialRoute: InitialRoute;
  isReady: boolean;
}

export const useRoleBasedInitialRoute = (isAuthenticated: boolean): RoleBasedInitialRouteResult => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<InitialRoute>('Main');

  const { data, loading } = useQuery(GET_ME, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setIsReady(true);
      return;
    }

    if (!loading && data?.me) {
      const activeRole: string = data.me.activeRole ?? 'USER';
      if (activeRole === 'HOST' || activeRole === 'VENUE_OWNER') {
        setInitialRoute('Dashboard');
      } else {
        setInitialRoute('Main');
      }
      setIsReady(true);
    }
  }, [isAuthenticated, loading, data]);

  return { initialRoute, isReady };
};
