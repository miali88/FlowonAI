"use client";

import React, { useRef, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { Input } from "@/components/ui/input";

interface AutoSearchPlacesInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onPlaceSelect?: (placeData: any) => void;
}

const AutoSearchPlacesInput = ({
  value,
  onChange,
  onPlaceSelect,
}: AutoSearchPlacesInputProps) => {
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY as string,
    libraries: ["places"],
  });

  const handlePlacesChanged = useCallback(() => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();

      if (places && places.length > 0) {
        const place = places[0];

        // Log the place data to console
        console.log("Selected place data:", place);

        // Extract business name
        const businessName = place.name || "";

        // Update form value if onChange is provided
        if (onChange) {
          onChange(businessName);
        }

        // Pass the full place data to parent component if needed
        if (onPlaceSelect) {
          onPlaceSelect(place);
        }
      }
    }
  }, [onChange, onPlaceSelect]);

  const handleLoad = useCallback((ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  }, []);

  return (
    <div>
      {isLoaded && (
        <StandaloneSearchBox
          onLoad={handleLoad}
          onPlacesChanged={handlePlacesChanged}
        >
          <Input
            placeholder="Search for your business"
            value={value || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
          />
        </StandaloneSearchBox>
      )}
    </div>
  );
};

export default AutoSearchPlacesInput;
