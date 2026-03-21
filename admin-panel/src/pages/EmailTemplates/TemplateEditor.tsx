import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VariableEditor from './VariableEditor';
import MjmlCodeEditor from './MjmlCodeEditor';
import type {
  EmailTemplate,
  TemplateVariable,
  MjmlValidationError,
} from './EmailTemplates.types';
import { TEMPLATE_CATEGORIES, DEFAULT_MJML_BODY } from './EmailTemplates.types';

interface TemplateEditorProps {
  template: EmailTemplate | null;
  saving: boolean;
  onSave: (data: {
    slug: string;
    name: string;
    subject: string;
    mjmlBody: string;
    variables: TemplateVariable[];
    category: string;
    isActive?: boolean;
  }) => void;
  onCancel: () => void;
  onValidate: (mjml: string) => Promise<{
    valid: boolean;
    html: string;
    errors: MjmlValidationError[];
  } | null>;
  onPreview: (
    mjml: string,
    vars: Record<string, string>,
  ) => Promise<{ html: string; errors: MjmlValidationError[] } | null>;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  saving,
  onSave,
  onCancel,
  onValidate,
  onPreview,
}) => {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [mjmlBody, setMjmlBody] = useState(DEFAULT_MJML_BODY);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [category, setCategory] = useState('general');
  const [isActive, setIsActive] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');
  const [validationErrors, setValidationErrors] = useState<MjmlValidationError[]>([]);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (template) {
      setSlug(template.slug);
      setName(template.name);
      setSubject(template.subject);
      setMjmlBody(template.mjmlBody);
      setVariables(template.variables.map((v) => ({ ...v })));
      setCategory(template.category);
      setIsActive(template.isActive);
    }
  }, [template]);

  const handleValidate = useCallback(async () => {
    setValidating(true);
    const result = await onValidate(mjmlBody);
    setValidating(false);
    if (result) {
      setValidationErrors(result.errors);
      if (result.valid) setPreviewHtml(result.html);
    }
  }, [mjmlBody, onValidate]);

  const handlePreview = useCallback(async () => {
    const sampleVars: Record<string, string> = {};
    variables.forEach((v) => {
      sampleVars[v.key] = v.defaultValue || `[${v.key}]`;
    });
    const result = await onPreview(mjmlBody, sampleVars);
    if (result) {
      setPreviewHtml(result.html);
      setValidationErrors(result.errors);
    }
  }, [mjmlBody, variables, onPreview]);

  const handleSave = () => {
    onSave({
      slug,
      name,
      subject,
      mjmlBody,
      variables,
      category,
      ...(template ? { isActive } : {}),
    });
  };

  const variableKeys = variables.map((v) => v.key);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Slug"
          size="small"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={!!template}
          sx={{ width: 200 }}
          helperText="e.g. email-otp, meeting-invite"
        />
        <TextField
          label="Name"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ width: 250 }}
        />
        <TextField
          label="Category"
          size="small"
          select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ width: 160 }}
        >
          {TEMPLATE_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        {template && (
          <FormControlLabel
            control={
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            }
            label="Active"
          />
        )}
      </Box>
      <TextField
        label="Subject"
        size="small"
        fullWidth
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        helperText="Use {{variable}} for dynamic subject lines"
      />
      <VariableEditor variables={variables} onChange={setVariables} />
      <Divider />
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 500 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" gutterBottom>
            MJML Code
          </Typography>
          <MjmlCodeEditor
            value={mjmlBody}
            onChange={setMjmlBody}
            variableKeys={variableKeys}
          />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2">Preview</Typography>
            <Button size="small" variant="outlined" onClick={handlePreview}>
              Preview
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={handleValidate}
              disabled={validating}
              startIcon={validating ? <CircularProgress size={14} /> : undefined}
            >
              Validate
            </Button>
          </Box>
          {validationErrors.length > 0 && (
            <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 1 }}>
              {validationErrors.map((e, i) => (
                <div key={i}>
                  Line {e.line}: {e.message}
                </div>
              ))}
            </Alert>
          )}
          {validationErrors.length === 0 && previewHtml && (
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 1 }}>
              MJML is valid
            </Alert>
          )}
          <Box
            sx={{
              flex: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'auto',
              bgcolor: 'background.paper',
            }}
          >
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="Email Preview"
                style={{ width: '100%', height: '100%', border: 'none', minHeight: 400 }}
                sandbox="allow-same-origin"
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                }}
              >
                Click Preview to see the rendered email
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 1 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : template ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
};

export default TemplateEditor;
