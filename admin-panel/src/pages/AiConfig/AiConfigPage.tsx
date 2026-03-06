import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  Stack,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import { useQuery, useMutation } from '@apollo/client';
import { GET_APP_SETTINGS, GET_OPENAI_MODELS } from '../../graphql/queries';
import { UPSERT_SETTING, TEST_OPENAI_CONNECTION } from '../../graphql/mutations';
import type { AiConfig } from './AiConfig.types';
import { DEFAULT_AI_CONFIG } from './AiConfig.types';

interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

interface SettingsData {
  appSettings: AppSetting[];
}

interface TestConnectionResult {
  success: boolean;
  message: string;
}

const AiConfigPage: React.FC = () => {
  const [aiConfig, setAiConfig] = useState<AiConfig>({ ...DEFAULT_AI_CONFIG });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  const { data, loading } = useQuery<SettingsData>(GET_APP_SETTINGS, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: modelsData, loading: modelsLoading } = useQuery<{ openAiModels: string[] }>(
    GET_OPENAI_MODELS,
    { fetchPolicy: 'cache-and-network' },
  );
  const [upsertSetting, { loading: saving }] = useMutation(UPSERT_SETTING);
  const [testOpenAi, { loading: testingOpenAi }] = useMutation(TEST_OPENAI_CONNECTION);

  const populateFromSettings = useCallback((settings: AppSetting[]) => {
    const get = (key: string) => settings.find((s) => s.key === key)?.value ?? '';
    setAiConfig({
      apiKey: get('openai_api_key') || DEFAULT_AI_CONFIG.apiKey,
      model: get('openai_model') || DEFAULT_AI_CONFIG.model,
      prePrompt: get('chatbot_pre_prompt') || DEFAULT_AI_CONFIG.prePrompt,
    });
  }, []);

  useEffect(() => {
    if (data?.appSettings) populateFromSettings(data.appSettings);
  }, [data, populateFromSettings]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const entries = [
        { key: 'openai_api_key', value: aiConfig.apiKey },
        { key: 'openai_model', value: aiConfig.model },
        { key: 'chatbot_pre_prompt', value: aiConfig.prePrompt },
      ];
      await Promise.all(
        entries.map((e) =>
          upsertSetting({
            variables: { input: { key: e.key, value: e.value, category: 'openai' } },
          }),
        ),
      );
      setSuccess('AI configuration saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleTest = async () => {
    setTestResult(null);
    try {
      const result = await testOpenAi();
      const data = (result?.data as Record<string, TestConnectionResult> | undefined)
        ?.testOpenAiConnection;
      if (data) setTestResult(data);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          href="/dashboard"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          AI / Chatbot
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} mb={3}>
        AI / Chatbot Configuration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {testResult && (
        <Alert
          severity={testResult.success ? 'success' : 'error'}
          sx={{ mb: 2 }}
          onClose={() => setTestResult(null)}
        >
          {testResult.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" mb={1}>
            OpenAI Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Configure the OpenAI API key, model, and system prompt used by the AI chatbot.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <TextField
              label="API Key"
              type="password"
              value={aiConfig.apiKey}
              onChange={(e) => setAiConfig((p) => ({ ...p, apiKey: e.target.value }))}
              fullWidth
              helperText="Your OpenAI API key (starts with sk-)"
            />
            <TextField
              select
              label="Model"
              value={aiConfig.model}
              onChange={(e) => setAiConfig((p) => ({ ...p, model: e.target.value }))}
              fullWidth
              helperText={modelsLoading ? 'Loading models...' : 'Select an OpenAI chat model'}
            >
              {(modelsData?.openAiModels ?? []).length === 0 && (
                <MenuItem value={aiConfig.model || 'gpt-4o-mini'}>
                  {aiConfig.model || 'gpt-4o-mini'}
                </MenuItem>
              )}
              {(modelsData?.openAiModels ?? []).map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="System Prompt (Pre-Prompt)"
              value={aiConfig.prePrompt}
              onChange={(e) => setAiConfig((p) => ({ ...p, prePrompt: e.target.value }))}
              fullWidth
              multiline
              rows={6}
              helperText="This system prompt is sent to OpenAI before every conversation. It defines the chatbot's personality, context, and behavior."
            />
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
            <Button
              variant="outlined"
              startIcon={testingOpenAi ? <CircularProgress size={18} /> : <NetworkCheckIcon />}
              onClick={handleTest}
              disabled={testingOpenAi}
            >
              Test Connection
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              Save
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AiConfigPage;
