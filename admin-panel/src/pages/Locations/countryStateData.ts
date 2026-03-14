/**
 * Static Country → State hierarchy maintained locally in the admin panel.
 * Cities are fetched dynamically from the server under each state.
 */

export interface CountryStateData {
  name: string;
  states: string[];
}

export const COUNTRIES_AND_STATES: CountryStateData[] = [
  {
    name: 'India',
    states: [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      'Delhi',
      'Chandigarh',
      'Puducherry',
      'Jammu and Kashmir',
      'Ladakh',
      'Andaman and Nicobar Islands',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Lakshadweep',
    ],
  },
  {
    name: 'United States',
    states: [
      'Alabama',
      'Alaska',
      'Arizona',
      'Arkansas',
      'California',
      'Colorado',
      'Connecticut',
      'Delaware',
      'Florida',
      'Georgia',
      'Hawaii',
      'Idaho',
      'Illinois',
      'Indiana',
      'Iowa',
      'Kansas',
      'Kentucky',
      'Louisiana',
      'Maine',
      'Maryland',
      'Massachusetts',
      'Michigan',
      'Minnesota',
      'Mississippi',
      'Missouri',
      'Montana',
      'Nebraska',
      'Nevada',
      'New Hampshire',
      'New Jersey',
      'New Mexico',
      'New York',
      'North Carolina',
      'North Dakota',
      'Ohio',
      'Oklahoma',
      'Oregon',
      'Pennsylvania',
      'Rhode Island',
      'South Carolina',
      'South Dakota',
      'Tennessee',
      'Texas',
      'Utah',
      'Vermont',
      'Virginia',
      'Washington',
      'West Virginia',
      'Wisconsin',
      'Wyoming',
      'District of Columbia',
    ],
  },
  {
    name: 'United Kingdom',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  },
  {
    name: 'United Arab Emirates',
    states: [
      'Abu Dhabi',
      'Ajman',
      'Dubai',
      'Fujairah',
      'Ras Al Khaimah',
      'Sharjah',
      'Umm Al Quwain',
    ],
  },
  {
    name: 'Canada',
    states: [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Nova Scotia',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan',
      'Northwest Territories',
      'Nunavut',
      'Yukon',
    ],
  },
  {
    name: 'Australia',
    states: [
      'New South Wales',
      'Queensland',
      'South Australia',
      'Tasmania',
      'Victoria',
      'Western Australia',
      'Australian Capital Territory',
      'Northern Territory',
    ],
  },
  {
    name: 'Singapore',
    states: ['Singapore'],
  },
];

/** Get sorted list of all country names. */
export function getCountryNames(): string[] {
  return COUNTRIES_AND_STATES.map((c) => c.name).sort();
}

/** Get sorted states for a given country. */
export function getStatesForCountry(country: string): string[] {
  const entry = COUNTRIES_AND_STATES.find(
    (c) => c.name.toLowerCase() === country.toLowerCase(),
  );
  return entry ? [...entry.states].sort() : [];
}
