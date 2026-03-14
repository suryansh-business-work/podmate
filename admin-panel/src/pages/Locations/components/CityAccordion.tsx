import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  IconButton,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { CityItem } from '../Locations.types';

interface CityAccordionProps {
  city: CityItem;
  index: number;
  total: number;
  onEdit: (city: CityItem) => void;
  onDelete: (city: CityItem) => void;
  onMove: (cityId: string, direction: 'up' | 'down') => void;
  onAddArea: (cityId: string, name: string) => void;
  onRemoveArea: (cityId: string, areaId: string) => void;
  onAddPincodeToCity: (cityId: string, pincode: string) => void;
  onRemovePincodeFromCity: (cityId: string, pincode: string) => void;
  onAddPincodeToArea: (cityId: string, areaId: string, pincode: string) => void;
  onRemovePincodeFromArea: (cityId: string, areaId: string, pincode: string) => void;
  addingArea: boolean;
}

const CityAccordion: React.FC<CityAccordionProps> = ({
  city,
  index,
  total,
  onEdit,
  onDelete,
  onMove,
  onAddArea,
  onRemoveArea,
  onAddPincodeToCity,
  onRemovePincodeFromCity,
  onAddPincodeToArea,
  onRemovePincodeFromArea,
  addingArea,
}) => {
  const [areaName, setAreaName] = useState('');
  const [cityPincode, setCityPincode] = useState('');
  const [areaPincodes, setAreaPincodes] = useState<Record<string, string>>({});

  const handleAddArea = () => {
    if (areaName.trim()) {
      onAddArea(city.id, areaName.trim());
      setAreaName('');
    }
  };

  const handleAddCityPincode = () => {
    if (cityPincode.trim()) {
      onAddPincodeToCity(city.id, cityPincode.trim());
      setCityPincode('');
    }
  };

  const handleAddAreaPincode = (areaId: string) => {
    const pin = areaPincodes[areaId]?.trim();
    if (pin) {
      onAddPincodeToArea(city.id, areaId, pin);
      setAreaPincodes((prev) => ({ ...prev, [areaId]: '' }));
    }
  };

  return (
    <Accordion defaultExpanded={city.isTopCity} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 0.5 }}>
            <IconButton
              size="small"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMove(city.id, 'up');
              }}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
            <DragIndicatorIcon fontSize="small" color="disabled" />
            <IconButton
              size="small"
              disabled={index === total - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMove(city.id, 'down');
              }}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </Box>
          {city.imageUrl && (
            <Box
              component="img"
              src={city.imageUrl}
              sx={{ width: 50, height: 35, borderRadius: 1, objectFit: 'cover' }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={600}>{city.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {city.areas.length} areas
            </Typography>
          </Box>
          {city.isTopCity && <Chip label="Top City" size="small" color="primary" />}
          <Chip
            label={city.isActive ? 'Active' : 'Inactive'}
            size="small"
            color={city.isActive ? 'success' : 'default'}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(city);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(city);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* ── City-level Pincodes ── */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          City Pincodes
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {city.pincodes.map((pin) => (
            <Chip
              key={pin}
              label={pin}
              onDelete={() => onRemovePincodeFromCity(city.id, pin)}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
          {city.pincodes.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No pincodes added
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            placeholder="e.g. 201017"
            value={cityPincode}
            onChange={(e) => setCityPincode(e.target.value)}
            sx={{ width: 160 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddCityPincode}
            disabled={!cityPincode.trim()}
          >
            Add Pincode
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ── Closest Areas ── */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Closest Areas
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {city.areas.map((area) => (
            <Chip
              key={area.id}
              label={area.name}
              onDelete={() => onRemoveArea(city.id, area.id)}
              variant="outlined"
              size="small"
            />
          ))}
          {city.areas.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No areas added yet
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            placeholder="Area name (e.g. South City)"
            helperText="Add neighborhoods or districts within this city"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddArea}
            disabled={addingArea || !areaName.trim()}
          >
            Add Area
          </Button>
        </Box>

        {/* ── Area-level Pincodes ── */}
        {city.areas.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Area Pincodes
            </Typography>
            {city.areas.map((area) => (
              <Box key={area.id} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {area.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {area.pincodes.map((pin) => (
                    <Chip
                      key={pin}
                      label={pin}
                      onDelete={() => onRemovePincodeFromArea(city.id, area.id, pin)}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                  {area.pincodes.length === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      No pincodes
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="e.g. 201017"
                    value={areaPincodes[area.id] ?? ''}
                    onChange={(e) =>
                      setAreaPincodes((prev) => ({ ...prev, [area.id]: e.target.value }))
                    }
                    sx={{ width: 140 }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleAddAreaPincode(area.id)}
                    disabled={!areaPincodes[area.id]?.trim()}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            ))}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default CityAccordion;
