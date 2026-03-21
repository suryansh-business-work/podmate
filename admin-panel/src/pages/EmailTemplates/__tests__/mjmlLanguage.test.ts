import { describe, it, expect } from 'vitest';
import {
  MJML_LANGUAGE_ID,
  mjmlLanguageConfig,
  mjmlTokensProvider,
  getMjmlCompletionItems,
} from '../mjmlLanguage';

describe('mjmlLanguage', () => {
  describe('MJML_LANGUAGE_ID', () => {
    it('is defined as mjml', () => {
      expect(MJML_LANGUAGE_ID).toBe('mjml');
    });
  });

  describe('mjmlLanguageConfig', () => {
    it('has block comment configuration', () => {
      expect(mjmlLanguageConfig.comments?.blockComment).toEqual(['<!--', '-->']);
    });

    it('has bracket pairs', () => {
      expect(mjmlLanguageConfig.brackets).toEqual([
        ['<', '>'],
        ['{', '}'],
      ]);
    });

    it('has auto-closing pairs', () => {
      expect(mjmlLanguageConfig.autoClosingPairs).toHaveLength(4);
    });
  });

  describe('mjmlTokensProvider', () => {
    it('has correct postfix', () => {
      expect(mjmlTokensProvider.tokenPostfix).toBe('.mjml');
    });

    it('is case insensitive', () => {
      expect(mjmlTokensProvider.ignoreCase).toBe(true);
    });

    it('has root, comment, and tag tokenizer states', () => {
      const states = Object.keys(mjmlTokensProvider.tokenizer as Record<string, unknown>);
      expect(states).toContain('root');
      expect(states).toContain('comment');
      expect(states).toContain('tag');
    });
  });

  describe('getMjmlCompletionItems', () => {
    it('returns tag snippets', () => {
      const items = getMjmlCompletionItems([]);
      const tags = items.filter((i) => i.kind === 'tag');
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.some((t) => t.label === 'mj-section')).toBe(true);
      expect(tags.some((t) => t.label === 'mj-text')).toBe(true);
      expect(tags.some((t) => t.label === 'mj-button')).toBe(true);
    });

    it('returns variable items for provided keys', () => {
      const items = getMjmlCompletionItems(['userName', 'otp']);
      const vars = items.filter((i) => i.kind === 'variable');
      expect(vars).toHaveLength(2);
      expect(vars[0].label).toBe('{{userName}}');
      expect(vars[0].insertText).toBe('{{userName}}');
      expect(vars[1].label).toBe('{{otp}}');
    });

    it('returns empty variables when no keys provided', () => {
      const items = getMjmlCompletionItems([]);
      const vars = items.filter((i) => i.kind === 'variable');
      expect(vars).toHaveLength(0);
    });

    it('tag snippets contain valid MJML insertText', () => {
      const items = getMjmlCompletionItems([]);
      const tags = items.filter((i) => i.kind === 'tag');
      for (const tag of tags) {
        expect(tag.insertText).toContain(tag.label.split(' ')[0]);
        expect(tag.detail.length).toBeGreaterThan(0);
      }
    });

    it('mj-button snippet uses brand color', () => {
      const items = getMjmlCompletionItems([]);
      const button = items.find((i) => i.label === 'mj-button');
      expect(button?.insertText).toContain('#F50247');
    });
  });
});
