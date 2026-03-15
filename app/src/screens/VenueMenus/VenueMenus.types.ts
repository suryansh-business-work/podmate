import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export interface VenueMenuScreenProps {
  onBack: () => void;
}

export type MenuCategory = 'FOOD' | 'DRINKS' | 'COMBOS' | 'CUSTOM';

export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  isActive: boolean;
}

export const MENU_CATEGORIES: { key: MenuCategory; label: string; icon: MaterialIconName }[] = [
  { key: 'FOOD', label: 'Food Packages', icon: 'restaurant' },
  { key: 'DRINKS', label: 'Drink Packages', icon: 'local-bar' },
  { key: 'COMBOS', label: 'Combo Deals', icon: 'local-offer' },
  { key: 'CUSTOM', label: 'Custom', icon: 'tune' },
];
