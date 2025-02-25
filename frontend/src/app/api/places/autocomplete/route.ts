import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is not configured" },
      { status: 500 }
    );
  }

  try {
    // Direct call to Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&types=establishment&key=${apiKey}`;

    console.log("Calling Google Places API:", url);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Google Places API response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from Google Places API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch from Google Places API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
