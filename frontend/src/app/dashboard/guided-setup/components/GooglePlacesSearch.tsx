"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle, Edit, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GooglePlacesSearchProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (placeData: PlaceData) => void;
  className?: string;
  placeholder?: string;
}

export interface PlaceData {
  placeId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  businessHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export default function GooglePlacesSearch({
  value,
  onChange,
  onPlaceSelect,
  className,
  placeholder = "Search for your business...",
}: GooglePlacesSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualBusinessName, setManualBusinessName] = useState("");
  const [manualBusinessAddress, setManualBusinessAddress] = useState("");
  const [manualBusinessPhone, setManualBusinessPhone] = useState("");
  const [manualBusinessWebsite, setManualBusinessWebsite] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [scriptLoadAttempted, setScriptLoadAttempted] = useState(false);

  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  // Get API key on component mount
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    console.log("API Key available:", !!key);
    if (key) {
      setApiKey(key);
    } else {
      console.error("Google Places API key is missing");
      setError("Google Places API key is missing. Please use manual entry.");
    }
  }, []);

  // Load Google Maps script manually if not already loaded
  useEffect(() => {
    if (!apiKey || scriptLoadAttempted) return;

    setScriptLoadAttempted(true);

    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("Google Maps already loaded, initializing services");
      setScriptLoaded(true);
      return;
    }

    console.log("Loading Google Maps script manually");
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google Maps script loaded successfully");
      setScriptLoaded(true);
    };

    script.onerror = (e) => {
      console.error("Error loading Google Maps script:", e);
      setError(
        "Failed to load Google Maps API. Please use manual entry instead."
      );
      setIsManualMode(true);
    };

    document.head.appendChild(script);

    return () => {
      // Clean up if component unmounts during loading
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey, scriptLoadAttempted]);

  // Initialize services after script loads
  useEffect(() => {
    if (!scriptLoaded || !window.google || !window.google.maps) {
      console.log("Script not loaded yet or Google Maps not available");
      return;
    }

    try {
      console.log("Initializing Google Places services");

      // Check if the places library is available
      if (!window.google.maps.places) {
        console.error("Google Maps Places library not available");
        setError(
          "Google Maps Places library not available. Please use manual entry."
        );
        setIsManualMode(true);
        return;
      }

      // Initialize autocomplete service
      try {
        autocompleteService.current =
          new window.google.maps.places.AutocompleteService();
        console.log(
          "Autocomplete service initialized:",
          !!autocompleteService.current
        );
      } catch (err) {
        console.error("Failed to initialize AutocompleteService:", err);
        setError(
          "Failed to initialize Google Places Autocomplete. Please use manual entry."
        );
        setIsManualMode(true);
        return;
      }

      // Create a hidden map div for PlacesService (required by Google API)
      if (!mapDivRef.current) {
        const mapDiv = document.createElement("div");
        mapDiv.style.display = "none";
        document.body.appendChild(mapDiv);
        mapDivRef.current = mapDiv;

        try {
          const map = new window.google.maps.Map(mapDiv, {
            center: { lat: 0, lng: 0 },
            zoom: 1,
          });

          placesService.current = new window.google.maps.places.PlacesService(
            map
          );
          console.log("Places service initialized:", !!placesService.current);
        } catch (err) {
          console.error("Failed to initialize Map or PlacesService:", err);
          // We can still proceed with just autocomplete
        }
      }

      // Test the autocomplete service with a simple query
      if (autocompleteService.current) {
        autocompleteService.current.getPlacePredictions(
          { input: "test" },
          (predictions, status) => {
            console.log("Autocomplete test status:", status);
            if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
              console.error("Autocomplete service test failed:", status);
              if (status === "REQUEST_DENIED") {
                setError(
                  "API key may be restricted or invalid. Please use manual entry."
                );
              } else {
                setError(
                  `Autocomplete service test failed: ${status}. Please use manual entry.`
                );
              }
              setIsManualMode(true);
            }
          }
        );
      }
    } catch (err) {
      console.error("Error initializing Google Places services:", err);
      setError(
        "Failed to initialize Google Places services. Please use manual entry instead."
      );
      setIsManualMode(true);
    }
  }, [scriptLoaded]);

  // Auto-switch to manual mode if script fails to load after 5 seconds
  useEffect(() => {
    if (apiKey && !scriptLoaded) {
      const timer = setTimeout(() => {
        if (!scriptLoaded) {
          console.log("Script loading timeout - switching to manual mode");
          setError(
            "Google Places API failed to load. Using manual entry mode."
          );
          setIsManualMode(true);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [apiKey, scriptLoaded]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    if (!autocompleteService.current) {
      console.error("Autocomplete service not available");
      setError(
        "Google Places service is not available. Please use manual entry instead."
      );
      setIsManualMode(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log("Searching for:", searchQuery);

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: searchQuery,
          types: ["establishment"],
        },
        (predictions, status) => {
          setIsLoading(false);
          console.log("Autocomplete status:", status);

          if (
            !status ||
            status !== window.google.maps.places.PlacesServiceStatus.OK
          ) {
            console.error("Autocomplete error:", status);
            setSearchResults([]);

            if (status === "REQUEST_DENIED") {
              setError(
                "API key may be restricted or invalid. Please use manual entry."
              );
            } else if (status === "ZERO_RESULTS") {
              setError("No results found. Try a different search term.");
            } else {
              setError(
                `Search failed: ${status}. Please use manual entry instead.`
              );
            }
            return;
          }

          if (!predictions || predictions.length === 0) {
            setSearchResults([]);
            setError(
              "No results found. Try a different search term or use manual entry."
            );
            return;
          }

          console.log("Found predictions:", predictions.length);
          setSearchResults(predictions);
        }
      );
    } catch (err) {
      console.error("Error during search:", err);
      setIsLoading(false);
      setError(
        "An error occurred during search. Please use manual entry instead."
      );
    }
  };

  const handlePlaceSelect = (
    prediction: google.maps.places.AutocompletePrediction
  ) => {
    if (!prediction || !prediction.place_id) return;

    if (!placesService.current) {
      console.error("Places service not available");
      // Fall back to basic information from the prediction
      const placeData: PlaceData = {
        placeId: prediction.place_id,
        name:
          prediction.structured_formatting?.main_text || prediction.description,
        address: prediction.structured_formatting?.secondary_text || "",
      };

      onChange(placeData.name);
      onPlaceSelect(placeData);
      setSearchResults([]);
      setSearchQuery(placeData.name);
      return;
    }

    setIsLoading(true);

    try {
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: [
            "name",
            "formatted_address",
            "place_id",
            "formatted_phone_number",
            "website",
            "opening_hours",
          ],
        },
        (place, detailsStatus) => {
          setIsLoading(false);

          if (
            !detailsStatus ||
            detailsStatus !==
              window.google.maps.places.PlacesServiceStatus.OK ||
            !place
          ) {
            console.error("Place details error:", detailsStatus);

            // Fall back to basic information from the prediction
            const placeData: PlaceData = {
              placeId: prediction.place_id,
              name:
                prediction.structured_formatting?.main_text ||
                prediction.description,
              address: prediction.structured_formatting?.secondary_text || "",
            };

            onChange(placeData.name);
            onPlaceSelect(placeData);
            setSearchResults([]);
            setSearchQuery(placeData.name);
            return;
          }

          console.log("Selected place:", place);

          // Format business hours if available
          const businessHours: {
            [key: string]: { open: string; close: string };
          } = {};

          if (place.opening_hours?.periods) {
            const daysOfWeek = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];

            place.opening_hours.periods.forEach((period) => {
              if (
                period.open &&
                period.close &&
                typeof period.open.day === "number"
              ) {
                const day = daysOfWeek[period.open.day];
                const openTime =
                  period.open.time.substring(0, 2) +
                  ":" +
                  period.open.time.substring(2);
                const closeTime =
                  period.close.time.substring(0, 2) +
                  ":" +
                  period.close.time.substring(2);

                businessHours[day] = {
                  open: openTime,
                  close: closeTime,
                };
              }
            });
          }

          // Create place data object
          const placeData: PlaceData = {
            placeId: place.place_id || prediction.place_id,
            name:
              place.name ||
              prediction.structured_formatting?.main_text ||
              prediction.description,
            address:
              place.formatted_address ||
              prediction.structured_formatting?.secondary_text ||
              "",
            phoneNumber: place.formatted_phone_number || "",
            website: place.website || "",
            businessHours:
              Object.keys(businessHours).length > 0 ? businessHours : undefined,
          };

          // Update the input value with the selected place name
          onChange(placeData.name);
          onPlaceSelect(placeData);
          setSearchResults([]);
          setSearchQuery(placeData.name);
        }
      );
    } catch (err) {
      console.error("Error getting place details:", err);
      setIsLoading(false);

      // Fall back to basic information from the prediction
      const placeData: PlaceData = {
        placeId: prediction.place_id,
        name:
          prediction.structured_formatting?.main_text || prediction.description,
        address: prediction.structured_formatting?.secondary_text || "",
      };

      onChange(placeData.name);
      onPlaceSelect(placeData);
      setSearchResults([]);
      setSearchQuery(placeData.name);
    }
  };

  const handleManualSubmit = () => {
    if (!manualBusinessName) {
      setError("Business name is required");
      return;
    }

    // Create a manual place data object
    const placeData: PlaceData = {
      placeId: `manual-${Date.now()}`,
      name: manualBusinessName,
      address: manualBusinessAddress,
      phoneNumber: manualBusinessPhone,
      website: manualBusinessWebsite,
    };

    // Update the input value with the business name
    onChange(manualBusinessName);
    onPlaceSelect(placeData);
    setIsManualMode(false);
    setSearchQuery(manualBusinessName);
  };

  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (!isManualMode) {
      // Switching to manual mode
      setManualBusinessName(value || "");
    }
  };

  const handleScriptLoad = () => {
    console.log("Google Maps script loaded successfully");
    setScriptLoaded(true);
  };

  const handleScriptError = (e: Error) => {
    console.error("Failed to load Google Maps script:", e);
    setError(
      "Failed to load Google Maps API. Please use manual entry instead."
    );
    setIsManualMode(true);
  };

  return (
    <div className={cn("relative", className)}>
      {!scriptLoadAttempted && apiKey && (
        <div className="text-xs text-gray-500 mb-2">
          Loading Google Places API...
        </div>
      )}

      {!apiKey && (
        <div className="text-xs text-red-500 mb-2">
          API key not found. Using manual mode.
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleManualMode}
              className="ml-2"
            >
              {isManualMode ? "Cancel Manual Entry" : "Enter Manually"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isManualMode ? (
        <>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-gray-400" />
              )}
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              variant="outline"
              disabled={isLoading || !searchQuery.trim() || !scriptLoaded}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={toggleManualMode}
              variant="outline"
              title="Enter business details manually"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
              {searchResults.map((prediction) => (
                <button
                  key={prediction.place_id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handlePlaceSelect(prediction)}
                >
                  <div className="font-medium">
                    {prediction.structured_formatting?.main_text ||
                      prediction.description}
                  </div>
                  {prediction.structured_formatting?.secondary_text && (
                    <div className="text-sm text-gray-500 truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="border p-4 rounded-md space-y-3">
          <h3 className="font-medium text-sm">Manual Business Entry</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Business Name*
              </label>
              <Input
                value={manualBusinessName}
                onChange={(e) => setManualBusinessName(e.target.value)}
                placeholder="Enter business name"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Business Address
              </label>
              <Input
                value={manualBusinessAddress}
                onChange={(e) => setManualBusinessAddress(e.target.value)}
                placeholder="Enter business address"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Phone Number
              </label>
              <Input
                value={manualBusinessPhone}
                onChange={(e) => setManualBusinessPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Website</label>
              <Input
                value={manualBusinessWebsite}
                onChange={(e) => setManualBusinessWebsite(e.target.value)}
                placeholder="Enter website URL"
                className="w-full"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleManualSubmit}
                variant="default"
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Business
              </Button>
              <Button
                type="button"
                onClick={toggleManualMode}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {value && value !== searchQuery && !isManualMode && (
        <div className="mt-2 text-sm">
          <span className="font-medium">Selected business:</span> {value}
        </div>
      )}
    </div>
  );
}
