export interface AreaItem {
  id: string;
  name: string;
  cityId: string;
}

export interface CityItem {
  id: string;
  name: string;
  state: string;
  country: string;
  imageUrl: string;
  isTopCity: boolean;
  isActive: boolean;
  sortOrder: number;
  areas: AreaItem[];
}

export interface CityFormData {
  name: string;
  state: string;
  country: string;
  imageUrl: string;
  isTopCity: boolean;
  isActive: boolean;
}

export const defaultCityForm: CityFormData = {
  name: '',
  state: '',
  country: '',
  imageUrl: '',
  isTopCity: false,
  isActive: true,
};
