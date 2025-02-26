import { Loader } from "@googlemaps/loader";

let loader: any;
export const getLoader = () => {
  if (!loader) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";

    if (!apiKey) {
      console.error("Google Maps API key is missing");
      return null;
    }

    loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });
  }
  return loader;
};
