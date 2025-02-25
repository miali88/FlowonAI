"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function GooglePlacesDebug() {
  const [apiKeyStatus, setApiKeyStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [apiKeyValue, setApiKeyValue] = useState<string>("");
  const [scriptStatus, setScriptStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [serviceStatus, setServiceStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    setApiKeyValue(apiKey || "");

    if (!apiKey) {
      setApiKeyStatus("error");
      setErrorMessage(
        "Google Places API key is missing. Check your .env.local file and Next.js config."
      );
      return;
    } else {
      setApiKeyStatus("success");
    }

    // Check if Google Maps script is loaded
    if (typeof window !== "undefined" && !window.google) {
      setScriptStatus("loading");
      const googleMapsScript = document.createElement("script");
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;

      googleMapsScript.onload = () => {
        setScriptStatus("success");
        checkServices();
      };

      googleMapsScript.onerror = () => {
        setScriptStatus("error");
        setErrorMessage(
          "Failed to load Google Maps script. This could be due to an invalid API key or network issues."
        );
      };

      document.head.appendChild(googleMapsScript);
    } else if (window.google) {
      setScriptStatus("success");
      checkServices();
    }
  }, []);

  const checkServices = () => {
    try {
      // Try to initialize the services
      const autocompleteService = new google.maps.places.AutocompleteService();

      // Create a hidden map div for PlacesService
      const mapDiv = document.createElement("div");
      mapDiv.style.display = "none";
      document.body.appendChild(mapDiv);

      const map = new google.maps.Map(mapDiv, {
        center: { lat: 0, lng: 0 },
        zoom: 1,
      });

      const placesService = new google.maps.places.PlacesService(map);

      // Test a simple autocomplete request
      autocompleteService.getPlacePredictions(
        {
          input: "test",
          types: ["establishment"],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            setServiceStatus("success");
          } else {
            setServiceStatus("error");
            setErrorMessage(
              `Autocomplete service test failed with status: ${status}`
            );
          }
        }
      );
    } catch (err) {
      setServiceStatus("error");
      setErrorMessage(
        `Error initializing Google Places services: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const getStatusIcon = (status: "loading" | "success" | "error") => {
    if (status === "loading") return "⏳";
    if (status === "success")
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Google Places API Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>{getStatusIcon(apiKeyStatus)}</span>
            <span className="font-medium">API Key Status:</span>
            <span>
              {apiKeyStatus === "loading"
                ? "Checking..."
                : apiKeyStatus === "success"
                ? "Available"
                : "Missing or Invalid"}
            </span>
          </div>

          {apiKeyValue && (
            <div className="pl-7">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {apiKeyValue.substring(0, 10)}...
                {apiKeyValue.substring(apiKeyValue.length - 5)}
              </code>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>{getStatusIcon(scriptStatus)}</span>
          <span className="font-medium">Google Maps Script:</span>
          <span>
            {scriptStatus === "loading"
              ? "Loading..."
              : scriptStatus === "success"
              ? "Loaded"
              : "Failed to Load"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>{getStatusIcon(serviceStatus)}</span>
          <span className="font-medium">Places Services:</span>
          <span>
            {serviceStatus === "loading"
              ? "Initializing..."
              : serviceStatus === "success"
              ? "Working"
              : "Failed"}
          </span>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="pt-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
