import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { config } from "@/config";

export async function GET(
  request: NextRequest,
  { params }: { params: { campaign_id: string } }
) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const response = await fetch(
      `${config.api.baseUrl}/campaigns/${params.campaign_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch campaign");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch campaign" }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { campaign_id: string } }
) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const body = await request.json();
    const response = await fetch(
      `${config.api.baseUrl}/campaigns/${params.campaign_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update campaign");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update campaign" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { campaign_id: string } }
) {
  try {
    const { getToken } = getAuth(request);
    const token = await getToken();

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const response = await fetch(
      `${config.api.baseUrl}/campaigns/${params.campaign_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete campaign");
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete campaign" }),
      { status: 500 }
    );
  }
} 