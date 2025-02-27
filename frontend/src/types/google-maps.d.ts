declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }

    interface MapOptions {
      center: LatLng | LatLngLiteral;
      zoom: number;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (
            predictions: AutocompletePrediction[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      interface AutocompletionRequest {
        input: string;
        types?: string[];
        componentRestrictions?: ComponentRestrictions;
        bounds?: LatLngBounds | LatLngBoundsLiteral;
        location?: LatLng;
        radius?: number;
        sessionToken?: AutocompleteSessionToken;
      }

      interface ComponentRestrictions {
        country: string | string[];
      }

      class AutocompleteSessionToken {}

      interface AutocompletePrediction {
        description: string;
        place_id: string;
        structured_formatting?: {
          main_text: string;
          main_text_matched_substrings: {
            offset: number;
            length: number;
          }[];
          secondary_text: string;
        };
        matched_substrings?: {
          offset: number;
          length: number;
        }[];
        terms?: {
          offset: number;
          value: string;
        }[];
        types?: string[];
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement | Map);
        getDetails(
          request: PlaceDetailsRequest,
          callback: (
            result: PlaceResult | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields?: string[];
        sessionToken?: AutocompleteSessionToken;
      }

      interface PlaceResult {
        place_id?: string;
        name?: string;
        formatted_address?: string;
        formatted_phone_number?: string;
        international_phone_number?: string;
        website?: string;
        url?: string;
        opening_hours?: {
          open_now?: boolean;
          periods?: {
            open?: {
              day: number;
              time: string;
              hours?: number;
              minutes?: number;
            };
            close?: {
              day: number;
              time: string;
              hours?: number;
              minutes?: number;
            };
          }[];
          weekday_text?: string[];
        };
        address_components?: {
          long_name: string;
          short_name: string;
          types: string[];
        }[];
        geometry?: {
          location: LatLng;
          viewport: LatLngBounds;
        };
        types?: string[];
        photos?: {
          height: number;
          width: number;
          html_attributions: string[];
          getUrl(opts: { maxHeight?: number; maxWidth?: number }): string;
        }[];
        rating?: number;
        user_ratings_total?: number;
      }

      enum PlacesServiceStatus {
        OK = "OK",
        ZERO_RESULTS = "ZERO_RESULTS",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        INVALID_REQUEST = "INVALID_REQUEST",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
        NOT_FOUND = "NOT_FOUND",
      }

      interface LatLngBounds {
        contains(latLng: LatLng): boolean;
        equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
        extend(point: LatLng): LatLngBounds;
        getCenter(): LatLng;
        getNorthEast(): LatLng;
        getSouthWest(): LatLng;
        intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
        isEmpty(): boolean;
        toJSON(): LatLngBoundsLiteral;
        toSpan(): LatLng;
        toString(): string;
        union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
      }

      interface LatLngBoundsLiteral {
        east: number;
        north: number;
        south: number;
        west: number;
      }
    }
  }
}
