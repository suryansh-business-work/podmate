import type { languages } from 'monaco-editor';

export const MJML_LANGUAGE_ID = 'mjml';

export const mjmlLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    blockComment: ['<!--', '-->'],
  },
  brackets: [
    ['<', '>'],
    ['{', '}'],
  ],
  autoClosingPairs: [
    { open: '<', close: '>' },
    { open: '{', close: '}' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '<', close: '>' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

export const mjmlTokensProvider: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.mjml',
  ignoreCase: true,

  tokenizer: {
    root: [
      [/\{\{\s*\w+\s*\}\}/, 'variable'],
      [/<!--/, 'comment', '@comment'],
      [
        /(<)(\/?)(\w[\w-]*)/,
        ['delimiter', 'delimiter', { token: 'tag', switchTo: '@tag' }],
      ],
      [/[^<{]+/, ''],
    ],
    comment: [
      [/-->/, 'comment', '@pop'],
      [/./, 'comment'],
    ],
    tag: [
      [/\{\{\s*\w+\s*\}\}/, 'variable'],
      [/[ \t\r\n]+/, ''],
      [
        /([\w-]+)(\s*=\s*)("(?:[^"]*)")/,
        ['attribute.name', 'delimiter', 'attribute.value'],
      ],
      [
        /([\w-]+)(\s*=\s*)('(?:[^']*)')/,
        ['attribute.name', 'delimiter', 'attribute.value'],
      ],
      [/[\w-]+/, 'attribute.name'],
      [/\/?>/, 'delimiter', '@pop'],
    ],
  },
};

const MJML_TAG_SNIPPETS: Array<{
  label: string;
  insertText: string;
  detail: string;
}> = [
  {
    label: 'mj-section',
    insertText: '<mj-section>\n  $0\n</mj-section>',
    detail: 'MJML section container',
  },
  {
    label: 'mj-column',
    insertText: '<mj-column>\n  $0\n</mj-column>',
    detail: 'MJML column inside section',
  },
  {
    label: 'mj-text',
    insertText: '<mj-text>$0</mj-text>',
    detail: 'MJML text block',
  },
  {
    label: 'mj-image',
    insertText: '<mj-image src="$1" alt="$2" />',
    detail: 'MJML image component',
  },
  {
    label: 'mj-button',
    insertText:
      '<mj-button background-color="#F50247" color="#ffffff" href="$1">\n  $0\n</mj-button>',
    detail: 'MJML button with brand color',
  },
  {
    label: 'mj-divider',
    insertText: '<mj-divider border-color="#eeeeee" padding="20px 0" />',
    detail: 'MJML horizontal divider',
  },
  {
    label: 'mj-table',
    insertText: '<mj-table>\n  <tr>\n    <td>$0</td>\n  </tr>\n</mj-table>',
    detail: 'MJML table component',
  },
  {
    label: 'mj-spacer',
    insertText: '<mj-spacer height="$1" />',
    detail: 'MJML vertical spacer',
  },
  {
    label: 'mj-raw',
    insertText: '<mj-raw>$0</mj-raw>',
    detail: 'MJML raw HTML pass-through',
  },
  {
    label: 'mj-hero',
    insertText:
      '<mj-hero background-color="$1" background-url="$2">\n  <mj-text>$0</mj-text>\n</mj-hero>',
    detail: 'MJML hero section',
  },
  {
    label: 'mj-wrapper',
    insertText: '<mj-wrapper>\n  $0\n</mj-wrapper>',
    detail: 'MJML wrapper for grouping sections',
  },
  {
    label: 'mj-social',
    insertText:
      '<mj-social font-size="15px" icon-size="30px" mode="horizontal">\n  <mj-social-element name="facebook" href="$1" />\n  <mj-social-element name="twitter" href="$2" />\n</mj-social>',
    detail: 'MJML social icons',
  },
];

export interface MjmlCompletionItem {
  label: string;
  kind: 'tag' | 'variable';
  insertText: string;
  detail: string;
}

export function getMjmlCompletionItems(
  templateVariables: string[],
): MjmlCompletionItem[] {
  const items: MjmlCompletionItem[] = [];

  for (const snippet of MJML_TAG_SNIPPETS) {
    items.push({ ...snippet, kind: 'tag' });
  }

  for (const variable of templateVariables) {
    items.push({
      label: `{{${variable}}}`,
      kind: 'variable',
      insertText: `{{${variable}}}`,
      detail: `Template variable: ${variable}`,
    });
  }

  return items;
}
