import { toEmailTemplate } from '../emailTemplate.models';

describe('toEmailTemplate', () => {
  it('returns null for null input', () => {
    expect(toEmailTemplate(null)).toBeNull();
  });

  it('converts a document with _id to EmailTemplate with id', () => {
    const doc = {
      _id: 'test-id-123',
      slug: 'test-template',
      name: 'Test Template',
      subject: 'Test Subject',
      mjmlBody: '<mj-section><mj-column><mj-text>Hello</mj-text></mj-column></mj-section>',
      variables: [{ key: 'userName', description: 'Name', defaultValue: '', required: true }],
      category: 'general',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const result = toEmailTemplate(doc);

    expect(result).not.toBeNull();
    expect(result!.id).toBe('test-id-123');
    expect(result!.slug).toBe('test-template');
    expect(result!.name).toBe('Test Template');
    expect(result!.variables).toHaveLength(1);
    expect(result!.isActive).toBe(true);
  });

  it('uses id property when present on the document', () => {
    const doc = {
      _id: 'raw-id',
      id: 'virtual-id',
      slug: 'test',
      name: 'Test',
      subject: 'Sub',
      mjmlBody: '<mj-section><mj-column><mj-text>Body</mj-text></mj-column></mj-section>',
      variables: [],
      category: 'general',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const result = toEmailTemplate(doc);

    expect(result!.id).toBe('virtual-id');
  });

  it('preserves all fields from the document', () => {
    const doc = {
      _id: 'id-1',
      slug: 'my-slug',
      name: 'My Template',
      subject: 'My Subject {{userName}}',
      mjmlBody: '<mj-section><mj-column><mj-text>Body</mj-text></mj-column></mj-section>',
      variables: [
        { key: 'userName', description: 'User name', defaultValue: 'Guest', required: false },
        { key: 'otp', description: 'OTP code', defaultValue: '', required: true },
      ],
      category: 'authentication',
      isActive: false,
      createdAt: '2024-06-15T12:00:00.000Z',
      updatedAt: '2024-06-15T14:30:00.000Z',
    };

    const result = toEmailTemplate(doc);

    expect(result!.slug).toBe('my-slug');
    expect(result!.subject).toBe('My Subject {{userName}}');
    expect(result!.variables).toHaveLength(2);
    expect(result!.category).toBe('authentication');
    expect(result!.isActive).toBe(false);
    expect(result!.createdAt).toBe('2024-06-15T12:00:00.000Z');
    expect(result!.updatedAt).toBe('2024-06-15T14:30:00.000Z');
  });

  it('handles document with empty variables array', () => {
    const doc = {
      _id: 'id-2',
      slug: 'no-vars',
      name: 'No Variables',
      subject: 'Static Subject',
      mjmlBody: '<mj-section><mj-column><mj-text>Static</mj-text></mj-column></mj-section>',
      variables: [],
      category: 'general',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const result = toEmailTemplate(doc);

    expect(result!.variables).toEqual([]);
  });
});
