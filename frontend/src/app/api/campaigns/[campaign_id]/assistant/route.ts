import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { config } from "@/config";

export async function POST(
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
      `${config.api.baseUrl}/campaigns/${params.campaign_id}/assistant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create/update campaign assistant");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in campaign assistant route:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create/update campaign assistant" }),
      { status: 500 }
    );
  }
} 