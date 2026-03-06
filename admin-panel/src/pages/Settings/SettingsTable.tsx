import React from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppSetting, formatDate } from './Settings.types';

interface SettingsTableProps {
  settings: AppSetting[];
  onEdit: (setting: AppSetting) => void;
  onDelete: (key: string) => void;
}

const SettingsTable: React.FC<SettingsTableProps> = ({ settings, onEdit, onDelete }) => (
  <Card>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!settings.length ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No settings found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            settings.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {s.key}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                    {s.value}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={s.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(s.updatedAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(s)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(s.key)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Card>
);

export default SettingsTable;
