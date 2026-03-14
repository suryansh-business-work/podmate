import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES } from '../../graphql/queries';
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  CREATE_SUBCATEGORY,
  UPDATE_SUBCATEGORY,
  DELETE_SUBCATEGORY,
} from '../../graphql/mutations';
import type { CategoryItem, SubCategoryItem, PaginatedCategoriesData } from './Categories.types';
import CategoryFormDialog from './components/CategoryFormDialog';
import type { SubCategoryEntry } from './components/CategoryFormDialog';
import CategoryRow from './components/CategoryRow';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

const CategoriesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState<SubCategoryItem | null>(null);

  const { data, loading, error, refetch } = useQuery<PaginatedCategoriesData>(GET_CATEGORIES, {
    variables: { page: 1, limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
      setDeleteTarget(null);
      refetch();
    },
  });
  const [createSubCategory] = useMutation(CREATE_SUBCATEGORY);
  const [updateSubCategory] = useMutation(UPDATE_SUBCATEGORY);
  const [deleteSubCategory, { loading: deletingSub }] = useMutation(DELETE_SUBCATEGORY, {
    onCompleted: () => {
      setDeleteSubTarget(null);
      refetch();
    },
  });

  const items: CategoryItem[] = data?.categories?.items ?? [];

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleSave = async (formData: {
    name: string;
    description: string;
    iconUrl: string;
    isActive: boolean;
    subcategories: SubCategoryEntry[];
    removedSubCategoryIds: string[];
  }) => {
    const { subcategories, removedSubCategoryIds, ...categoryInput } = formData;

    let categoryId: string;

    if (editingCategory) {
      await updateCategory({ variables: { id: editingCategory.id, input: categoryInput } });
      categoryId = editingCategory.id;
    } else {
      const result = await createCategory({ variables: { input: categoryInput } });
      categoryId = result.data.createCategory.id;
    }

    for (const id of removedSubCategoryIds) {
      await deleteSubCategory({ variables: { id } });
    }

    for (const sub of subcategories) {
      if (sub.id) {
        await updateSubCategory({
          variables: { id: sub.id, input: { name: sub.name, description: sub.description } },
        });
      } else {
        await createSubCategory({
          variables: { input: { name: sub.name, description: sub.description, categoryId } },
        });
      }
    }

    setDialogOpen(false);
    refetch();
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Categories</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Category Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage categories and subcategories used across the platform
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <TableCell sx={{ fontWeight: 600 }}>Icon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subcategories</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No categories yet. Add one to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    onEditCategory={(c) => {
                      setEditingCategory(c);
                      setDialogOpen(true);
                    }}
                    onDeleteCategory={(c) => setDeleteTarget(c)}
                    onDeleteSubCategory={(sub) => setDeleteSubTarget(sub)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        editingCategory={editingCategory}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete Category"
        entityName={deleteTarget?.name ?? ''}
        entityType="category"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteCategory({ variables: { id: deleteTarget.id } });
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteSubTarget)}
        title="Delete Subcategory"
        entityName={deleteSubTarget?.name ?? ''}
        entityType="subcategory"
        loading={deletingSub}
        onClose={() => setDeleteSubTarget(null)}
        onConfirm={() => {
          if (deleteSubTarget) deleteSubCategory({ variables: { id: deleteSubTarget.id } });
        }}
      />
    </Box>
  );
};

export default CategoriesPage;
