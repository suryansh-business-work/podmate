import { gql } from '@apollo/client';

export const GET_ACTIVE_CITIES = gql`
  query GetActiveCities {
    activeCities {
      id
      name
      imageUrl
      clubCount
      isTopCity
      pincodes
      areas {
        id
        name
        pincodes
      }
    }
  }
`;

export const GET_TOP_CITIES = gql`
  query GetTopCities {
    topCities {
      id
      name
      imageUrl
      clubCount
      isTopCity
      pincodes
      areas {
        id
        name
        pincodes
      }
    }
  }
`;

export const RESOLVE_LOCATION = gql`
  query ResolveLocation($latitude: Float!, $longitude: Float!) {
    resolveLocation(latitude: $latitude, longitude: $longitude) {
      city
      state
      country
      pincode
      area
      address
      latitude
      longitude
      matchedCityId
      matchedCityName
      matchedAreaId
      matchedAreaName
      isServiceAvailable
    }
  }
`;

export const RESOLVE_LOCATION_BY_PINCODE = gql`
  query ResolveLocationByPincode($pincode: String!, $country: String) {
    resolveLocationByPincode(pincode: $pincode, country: $country) {
      city
      state
      country
      pincode
      area
      address
      latitude
      longitude
      matchedCityId
      matchedCityName
      matchedAreaId
      matchedAreaName
      isServiceAvailable
    }
  }
`;

export const SEARCH_GOOGLE_PLACES = gql`
  query SearchGooglePlaces($input: String!, $sessionToken: String) {
    searchGooglePlaces(input: $input, sessionToken: $sessionToken) {
      placeId
      description
      mainText
      secondaryText
    }
  }
`;

export const GOOGLE_PLACE_DETAILS = gql`
  query GooglePlaceDetails($placeId: String!) {
    googlePlaceDetails(placeId: $placeId) {
      city
      state
      country
      pincode
      area
      address
      latitude
      longitude
      matchedCityId
      matchedCityName
      matchedAreaId
      matchedAreaName
      isServiceAvailable
    }
  }
`;
