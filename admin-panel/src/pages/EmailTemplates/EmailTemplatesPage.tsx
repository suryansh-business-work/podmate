import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import { useEmailTemplates } from './useEmailTemplates';
import TemplateListTable from './TemplateListTable';
import TemplateEditor from './TemplateEditor';
import { TEMPLATE_CATEGORIES } from './EmailTemplates.types';
import type { EmailTemplate } from './EmailTemplates.types';

const EmailTemplatesPage: React.FC = () => {
  const {
    templates,
    total,
    page,
    search,
    limit,
    categoryFilter,
    loading,
    creating,
    updating,
    setPage,
    setSearch,
    setCategoryFilter,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    validateMjml,
    previewTemplate,
  } = useEmailTemplates();

  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [previewDialog, setPreviewDialog] = useState<EmailTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [error, setError] = useState('');

  const showEditor = editing !== null || isNew;

  const handleCreate = () => {
    setEditing(null);
    setIsNew(true);
    setError('');
  };

  const handleEdit = (t: EmailTemplate) => {
    setEditing(t);
    setIsNew(false);
    setError('');
  };

  const handlePreviewDialog = async (t: EmailTemplate) => {
    const sampleVars: Record<string, string> = {};
    t.variables.forEach((v) => {
      sampleVars[v.key] = v.defaultValue || `[${v.key}]`;
    });
    const result = await previewTemplate(t.mjmlBody, sampleVars);
    if (result) {
      setPreviewHtml(result.html);
      setPreviewDialog(t);
    }
  };

  const handleSave = async (data: Parameters<typeof createTemplate>[0] & { isActive?: boolean }) => {
    try {
      if (isNew) {
        await createTemplate(data);
      } else if (editing) {
        await updateTemplate(editing.id, data);
      }
      setEditing(null);
      setIsNew(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Email Templates</Typography>
      </Breadcrumbs>
      <Typography variant="h5" gutterBottom>
        Email Templates
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {showEditor ? (
        <TemplateEditor
          template={isNew ? null : editing}
          saving={creating || updating}
          onSave={handleSave}
          onCancel={handleCancel}
          onValidate={validateMjml}
          onPreview={previewTemplate}
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 250 }}
            />
            <TextField
              size="small"
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ width: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              {TEMPLATE_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              New Template
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TemplateListTable
              templates={templates}
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onEdit={handleEdit}
              onPreview={handlePreviewDialog}
              onDelete={setDeleteTarget}
            />
          )}
        </>
      )}
      <Dialog open={!!previewDialog} onClose={() => setPreviewDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Preview: {previewDialog?.name}</DialogTitle>
        <DialogContent>
          {previewHtml && (
            <iframe
              srcDoc={previewHtml}
              title="Email Preview"
              style={{ width: '100%', height: 500, border: 'none' }}
              sandbox="allow-same-origin"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplatesPage;
