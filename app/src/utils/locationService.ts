// Service available pincodes
export const SERVICE_AVAILABLE_PINCODES = [
  '201017', // Ghaziabad - Raj Nagar Extension
];

export interface LocationData {
  city: string;
  pincode: string;
  state?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

// Check if pincode is in service area
export function isServiceAvailable(pincode: string): boolean {
  return SERVICE_AVAILABLE_PINCODES.includes(pincode);
}

// Get location from browser's navigator
export async function getLocationFromNavigator(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Fetch address from OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          );
          
          if (!response.ok) {
            resolve(null);
            return;
          }

          const data = await response.json();
          const address = data.address || {};
          
          const locationData: LocationData = {
            city: address.city || address.town || address.village || '',
            pincode: address.postcode || '',
            state: address.state || '',
            area: address.suburb || address.neighbourhood || '',
            latitude,
            longitude,
          };

          resolve(locationData);
        } catch (error) {
          console.error('Error fetching location:', error);
          resolve(null);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

// Get location from pincode using postal API
export async function getLocationFromPincode(pincode: string): Promise<LocationData | null> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data || data.length === 0 || data[0].Status !== 'Success') {
      return null;
    }

    const postOffice = data[0].PostOffice?.[0];
    
    if (!postOffice) {
      return null;
    }

    return {
      city: postOffice.District || postOffice.Division || '',
      pincode: postOffice.Pincode || pincode,
      state: postOffice.State || '',
      area: postOffice.Name || '',
    };
  } catch (error) {
    console.error('Error fetching pincode data:', error);
    return null;
  }
}

// Storage keys
export const STORAGE_KEYS = {
  LOCATION: 'partywings_location',
  PINCODE: 'partywings_pincode',
  SERVICE_AVAILABLE: 'partywings_service_available',
};

// Save location to localStorage
export function saveLocation(location: LocationData, isServiceAvailable: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
    localStorage.setItem(STORAGE_KEYS.PINCODE, location.pincode);
    localStorage.setItem(STORAGE_KEYS.SERVICE_AVAILABLE, String(isServiceAvailable));
  } catch (error) {
    console.error('Error saving location:', error);
  }
}

// Get saved location from localStorage
export function getSavedLocation(): { location: LocationData | null; isServiceAvailable: boolean } {
  try {
    const locationStr = localStorage.getItem(STORAGE_KEYS.LOCATION);
    const serviceAvailable = localStorage.getItem(STORAGE_KEYS.SERVICE_AVAILABLE);
    
    if (!locationStr) {
      return { location: null, isServiceAvailable: false };
    }

    const location = JSON.parse(locationStr) as LocationData;
    return {
      location,
      isServiceAvailable: serviceAvailable === 'true',
    };
  } catch (error) {
    console.error('Error getting saved location:', error);
    return { location: null, isServiceAvailable: false };
  }
}
