import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { TemplateVariable } from './EmailTemplates.types';

interface VariableEditorProps {
  variables: TemplateVariable[];
  onChange: (variables: TemplateVariable[]) => void;
}

const VariableEditor: React.FC<VariableEditorProps> = ({ variables, onChange }) => {
  const addVariable = () => {
    onChange([...variables, { key: '', description: '', defaultValue: '', required: false }]);
  };

  const updateVar = (index: number, field: keyof TemplateVariable, value: string | boolean) => {
    const updated = variables.map((v, i) => (i === index ? { ...v, [field]: value } : v));
    onChange(updated);
  };

  const removeVar = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          Template Variables
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={addVariable}>
          Add Variable
        </Button>
      </Box>
      {variables.map((v, i) => (
        <Box
          key={i}
          sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <TextField
            label="Key"
            size="small"
            value={v.key}
            onChange={(e) => updateVar(i, 'key', e.target.value)}
            sx={{ width: 140 }}
          />
          <TextField
            label="Description"
            size="small"
            value={v.description}
            onChange={(e) => updateVar(i, 'description', e.target.value)}
            sx={{ width: 180 }}
          />
          <TextField
            label="Default"
            size="small"
            value={v.defaultValue}
            onChange={(e) => updateVar(i, 'defaultValue', e.target.value)}
            sx={{ width: 140 }}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={v.required}
                onChange={(e) => updateVar(i, 'required', e.target.checked)}
              />
            }
            label="Req"
          />
          <IconButton size="small" color="error" onClick={() => removeVar(i)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      {variables.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No variables defined. Use {'{{variableName}}'} syntax in your MJML body.
        </Typography>
      )}
    </Box>
  );
};

export default VariableEditor;
