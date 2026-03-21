import React, { useRef, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import type { editor as monacoEditor, IDisposable, Position } from 'monaco-editor';
import {
  MJML_LANGUAGE_ID,
  mjmlLanguageConfig,
  mjmlTokensProvider,
  getMjmlCompletionItems,
} from './mjmlLanguage';

interface MjmlCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  variableKeys: string[];
}

let languageRegistered = false;

const MjmlCodeEditor: React.FC<MjmlCodeEditorProps> = ({ value, onChange, variableKeys }) => {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const disposablesRef = useRef<IDisposable[]>([]);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    if (languageRegistered) return;
    languageRegistered = true;

    monaco.languages.register({ id: MJML_LANGUAGE_ID });
    monaco.languages.setLanguageConfiguration(MJML_LANGUAGE_ID, mjmlLanguageConfig);
    monaco.languages.setMonarchTokensProvider(MJML_LANGUAGE_ID, mjmlTokensProvider);

    monaco.editor.defineTheme('mjml-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'tag.mjml', foreground: '#F50247', fontStyle: 'bold' },
        { token: 'attribute.name.mjml', foreground: '#9CDCFE' },
        { token: 'attribute.value.mjml', foreground: '#CE9178' },
        { token: 'variable.mjml', foreground: '#DCDCAA', fontStyle: 'bold' },
        { token: 'comment.mjml', foreground: '#6A9955' },
        { token: 'delimiter.mjml', foreground: '#808080' },
      ],
      colors: {},
    });
  }, []);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      const completionDisposable = monaco.languages.registerCompletionItemProvider(
        MJML_LANGUAGE_ID,
        {
          triggerCharacters: ['<', '{', ' '],
          provideCompletionItems: (_model: monacoEditor.ITextModel, position: Position) => {
            const items = getMjmlCompletionItems(variableKeys);
            const suggestions = items.map((item) => ({
              label: item.label,
              kind:
                item.kind === 'tag'
                  ? monaco.languages.CompletionItemKind.Snippet
                  : monaco.languages.CompletionItemKind.Variable,
              insertText: item.insertText,
              insertTextRules:
                item.kind === 'tag'
                  ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                  : monaco.languages.CompletionItemInsertTextRule.None,
              detail: item.detail,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            }));
            return { suggestions };
          },
        },
      );
      disposablesRef.current.push(completionDisposable);
    },
    [variableKeys],
  );

  useEffect(() => {
    return () => {
      disposablesRef.current.forEach((d) => d.dispose());
      disposablesRef.current = [];
    };
  }, []);

  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange(val ?? '');
    },
    [onChange],
  );

  return (
    <Box
      sx={{
        flex: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        minHeight: 400,
      }}
    >
      <Editor
        height="100%"
        language={MJML_LANGUAGE_ID}
        theme="mjml-dark"
        value={value}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          folding: true,
          matchBrackets: 'always',
          suggestOnTriggerCharacters: true,
        }}
      />
    </Box>
  );
};

export default MjmlCodeEditor;
