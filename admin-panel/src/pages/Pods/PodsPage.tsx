import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TablePagination,
  TextField,
  InputAdornment,
  Alert,
  Breadcrumbs,
  Link,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@apollo/client';
import { GET_PODS } from '../../graphql/queries';
import { useDebounce } from '../../hooks/useDebounce';
import { PodsData, Order } from './Pods.types';
import PodsTable from './PodsTable';
import CreatePodDialog from './CreatePodDialog';

const PodsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<Order>('DESC');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery<PodsData>(GET_PODS, {
    variables: { page: page + 1, limit: rowsPerPage, search: debouncedSearch || undefined, sortBy, order },
    fetchPolicy: 'cache-and-network',
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setOrder('ASC');
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} color="inherit">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>Pods</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700}>Pods</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search pods..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(0); }}
            sx={{ width: 300 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Create Pod</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <Card>
        <PodsTable pods={data?.pods.items ?? []} loading={loading && !data} sortBy={sortBy} order={order} onSort={handleSort} />
        {data && (
          <TablePagination
            component="div"
            count={data.pods.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Card>

      <CreatePodDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => refetch()} />
    </Box>
  );
};

export default PodsPage;
