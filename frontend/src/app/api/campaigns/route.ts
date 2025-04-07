import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { config } from "@/config";

export async function GET(request: NextRequest) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const response = await fetch(`${config.api.baseUrl}/campaigns`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch campaigns");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch campaigns" }),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const body = await request.json();
    const response = await fetch(`${config.api.baseUrl}/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create campaign");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create campaign" }),
      { status: 500 }
    );
  }
} 