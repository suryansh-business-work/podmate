import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EMAIL_TEMPLATES } from '../../graphql/queries';
import {
  CREATE_EMAIL_TEMPLATE,
  UPDATE_EMAIL_TEMPLATE,
  DELETE_EMAIL_TEMPLATE,
  VALIDATE_MJML,
  PREVIEW_EMAIL_TEMPLATE,
  SEED_DEFAULT_TEMPLATES,
} from '../../graphql/mutations';
import type {
  EmailTemplate,
  PaginatedEmailTemplates,
  MjmlValidationResult,
  TemplatePreviewResult,
} from './EmailTemplates.types';

export function useEmailTemplates() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, loading, refetch } = useQuery<{
    emailTemplates: PaginatedEmailTemplates;
  }>(GET_EMAIL_TEMPLATES, {
    variables: {
      page,
      limit,
      search: search || undefined,
      category: categoryFilter || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [createMut, { loading: creating }] = useMutation(CREATE_EMAIL_TEMPLATE);
  const [updateMut, { loading: updating }] = useMutation(UPDATE_EMAIL_TEMPLATE);
  const [deleteMut] = useMutation(DELETE_EMAIL_TEMPLATE);
  const [validateMut] = useMutation<{ validateMjml: MjmlValidationResult }>(VALIDATE_MJML);
  const [previewMut] = useMutation<{ previewEmailTemplate: TemplatePreviewResult }>(
    PREVIEW_EMAIL_TEMPLATE,
  );
  const [seedMut, { loading: seeding }] = useMutation<{
    seedDefaultTemplates: { created: string[]; skipped: string[]; errors: string[] };
  }>(SEED_DEFAULT_TEMPLATES);

  const templates = data?.emailTemplates?.items ?? [];
  const total = data?.emailTemplates?.total ?? 0;

  const createTemplate = useCallback(
    async (input: {
      slug: string;
      name: string;
      subject: string;
      mjmlBody: string;
      variables: Array<{
        key: string;
        description: string;
        defaultValue: string;
        required: boolean;
      }>;
      category: string;
    }) => {
      await createMut({ variables: { input } });
      refetch();
    },
    [createMut, refetch],
  );

  const updateTemplate = useCallback(
    async (id: string, input: Partial<EmailTemplate>) => {
      const {
        id: _id,
        slug: _slug,
        createdAt: _c,
        updatedAt: _u,
        __typename,
        ...rest
      } = input as EmailTemplate & { __typename?: string };
      void _id;
      void _slug;
      void _c;
      void _u;
      void __typename;
      await updateMut({ variables: { id, input: rest } });
      refetch();
    },
    [updateMut, refetch],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      await deleteMut({ variables: { id } });
      refetch();
    },
    [deleteMut, refetch],
  );

  const validateMjml = useCallback(
    async (mjmlBody: string): Promise<MjmlValidationResult | null> => {
      const res = await validateMut({ variables: { mjmlBody } });
      return res.data?.validateMjml ?? null;
    },
    [validateMut],
  );

  const previewTemplate = useCallback(
    async (
      mjmlBody: string,
      variables: Record<string, string>,
    ): Promise<TemplatePreviewResult | null> => {
      const res = await previewMut({
        variables: { mjmlBody, variables: JSON.stringify(variables) },
      });
      return res.data?.previewEmailTemplate ?? null;
    },
    [previewMut],
  );

  const seedDefaultTemplates = useCallback(async () => {
    const res = await seedMut();
    refetch();
    return res.data?.seedDefaultTemplates ?? { created: [], skipped: [], errors: [] };
  }, [seedMut, refetch]);

  return {
    templates,
    total,
    page,
    limit,
    search,
    categoryFilter,
    loading,
    creating,
    updating,
    seeding,
    setPage,
    setSearch,
    setCategoryFilter,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    validateMjml,
    previewTemplate,
    seedDefaultTemplates,
  };
}
