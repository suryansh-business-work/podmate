import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Box,
  Typography,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { CategoryItem, SubCategoryItem } from '../Categories.types';

interface CategoryRowProps {
  cat: CategoryItem;
  onEditCategory: (cat: CategoryItem) => void;
  onDeleteCategory: (cat: CategoryItem) => void;
  onDeleteSubCategory: (sub: SubCategoryItem) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  cat,
  onEditCategory,
  onDeleteCategory,
  onDeleteSubCategory,
}) => {
  const [expanded, setExpanded] = useState(false);
  const subs = cat.subcategories ?? [];

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ width: 40, pr: 0 }}>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell>
          {cat.iconUrl ? (
            <Box
              component="img"
              src={cat.iconUrl}
              alt={cat.name}
              sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'contain' }}
            />
          ) : (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                —
              </Typography>
            </Box>
          )}
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {cat.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
            {cat.description || '—'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip label={`${subs.length}`} size="small" variant="outlined" />
        </TableCell>
        <TableCell>
          <Chip
            label={cat.isActive ? 'Active' : 'Inactive'}
            color={cat.isActive ? 'success' : 'default'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <IconButton size="small" onClick={() => onEditCategory(cat)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDeleteCategory(cat)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell sx={{ py: 0, border: expanded ? undefined : 'none' }} colSpan={7}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, pl: 4 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Subcategories
              </Typography>
              {subs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  No subcategories. Click Edit to add.
                </Typography>
              ) : (
                <List
                  dense
                  disablePadding
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                >
                  {subs.map((sub, idx) => (
                    <React.Fragment key={sub.id}>
                      <ListItem
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            color="error"
                            onClick={() => onDeleteSubCategory(sub)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={sub.name} secondary={sub.description || undefined} />
                      </ListItem>
                      {idx < subs.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default CategoryRow;
