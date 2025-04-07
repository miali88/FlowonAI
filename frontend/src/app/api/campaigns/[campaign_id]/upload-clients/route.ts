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

    const formData = await request.formData();
    const response = await fetch(
      `${config.api.baseUrl}/campaigns/${params.campaign_id}/upload-clients`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload clients");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error uploading clients:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload clients" }),
      { status: 500 }
    );
  }
} 