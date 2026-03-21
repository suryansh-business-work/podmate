import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TablePagination from '@mui/material/TablePagination';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { EmailTemplate } from './EmailTemplates.types';

interface TemplateListTableProps {
  templates: EmailTemplate[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (t: EmailTemplate) => void;
  onPreview: (t: EmailTemplate) => void;
  onDelete: (t: EmailTemplate) => void;
}

const TemplateListTable: React.FC<TemplateListTableProps> = ({
  templates,
  total,
  page,
  limit,
  onPageChange,
  onEdit,
  onPreview,
  onDelete,
}) => (
  <Paper>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Variables</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((t) => (
            <TableRow key={t.id} hover>
              <TableCell>{t.name}</TableCell>
              <TableCell>
                <code>{t.slug}</code>
              </TableCell>
              <TableCell>
                <Chip label={t.category} size="small" />
              </TableCell>
              <TableCell>{t.variables.length}</TableCell>
              <TableCell>
                <Chip
                  label={t.isActive ? 'Active' : 'Inactive'}
                  color={t.isActive ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>{new Date(t.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell align="right">
                <Tooltip title="Preview">
                  <IconButton size="small" onClick={() => onPreview(t)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(t)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => onDelete(t)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      component="div"
      count={total}
      page={page - 1}
      rowsPerPage={limit}
      onPageChange={(_, p) => onPageChange(p + 1)}
      rowsPerPageOptions={[20]}
    />
  </Paper>
);

export default TemplateListTable;
