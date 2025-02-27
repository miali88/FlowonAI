import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In a real application, this would be fetched from a database or external service
    // For now, we'll use a constant
    const rosiePhoneNumber = "(814) 261-0317";

    return NextResponse.json({
      phoneNumber: rosiePhoneNumber,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching Rosie phone number:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Rosie phone number",
        success: false,
      },
      { status: 500 }
    );
  }
}
