import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Agent } from "./workspace";

interface UiProps {
  selectedAgent: Agent;
  setSelectedAgent: (agent: Agent) => void;
}

const Ui: React.FC<UiProps> = ({ selectedAgent, setSelectedAgent }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Updated color derivation to handle nested data structure
  const primaryColor =
    selectedAgent?.data?.[0]?.chat_ui?.primaryColor ||
    selectedAgent?.chat_ui?.primaryColor ||
    "#000000";

  const secondaryColor =
    selectedAgent?.data?.[0]?.chat_ui?.secondaryColor ||
    selectedAgent?.chat_ui?.secondaryColor ||
    "#ffffff";

  const agentLogo =
    selectedAgent?.ui?.logo ||
    selectedAgent?.agent_logo ||
    selectedAgent?.data?.[0]?.agent_logo;

  // Updated handler to manage both ui and chat_ui colors
  const handleUiChange = (key: string, value: any) => {
    setSelectedAgent({
      ...selectedAgent,
      data: selectedAgent.data
        ? [
            {
              ...selectedAgent.data[0],
              chat_ui: {
                ...selectedAgent.data[0]?.chat_ui,
                [key]: value,
              },
            },
            ...selectedAgent.data.slice(1),
          ]
        : [],
      ui: {
        ...selectedAgent.ui,
        [key]: value,
      },
    });
  };

  // Updated save handler to separate colors and logo
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const agentId = selectedAgent.id || selectedAgent?.data[0]?.id;

      if (!agentId) {
        throw new Error("Agent ID is undefined");
      }

      // Single API call with both chat_ui and agent_logo
      const response = await fetch(`${API_BASE_URL}/agent/${agentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": selectedAgent.userId,
        },
        body: JSON.stringify({
          chat_ui: {
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
          },
          agent_logo: agentLogo,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`);
      }

      const updatedAgent = await response.json();
      setSelectedAgent(updatedAgent.data[0]);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  console.log(selectedAgent, "TESTT");

  return (
    <div className="flex gap-6">
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>UI Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Color */}
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-4">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => handleUiChange("primaryColor", e.target.value)}
                className="w-[100px]"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => handleUiChange("primaryColor", e.target.value)}
                className="w-[120px] font-mono"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex items-center gap-4">
              <Input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) =>
                  handleUiChange("secondaryColor", e.target.value)
                }
                className="w-[100px]"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) =>
                  handleUiChange("secondaryColor", e.target.value)
                }
                className="w-[120px] font-mono"
              />
            </div>
          </div>

          {/* Avatar Upload */}

          {/* Logo Upload */}
          <div>
            <Label htmlFor="logo">Logo Image</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const base64String = await convertFileToBase64(file);
                    handleUiChange("logo", base64String);
                  } catch (error) {
                    console.error("Error converting file to base64:", error);
                    setSaveError("Failed to process logo image");
                  }
                }
              }}
              className="mt-2 w-[250px]"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 flex flex-col gap-2">
            <button
              className="py-2 px-4 bg-primary text-black rounded-md hover:bg-primary/90 transition-colors w-[250px] disabled:opacity-50"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <div className="w-1/3">
        <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          {/* Top Bar */}
          <div
            className="px-4 h-[50px] flex items-center"
            style={{
              background: primaryColor,
              color: secondaryColor,
            }}
          >
            Chat with {selectedAgent?.agentName}
          </div>

          {/* Message Container */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-white">
            {/* Assistant Message */}
            <div className="flex flex-col max-w-[85%]">
              <div
                className="p-6 rounded-2xl w-fit"
                style={{
                  background: "#f0f0f0",
                  color: "#333",
                }}
              >
                Hey there! Welcome to Everzocial, your go-to digital marketing
                agency in Cincinnati 👋 Ready to supercharge your online
                presence? What's your biggest marketing challenge right now?
              </div>
            </div>

            {/* User Message */}
            <div className="flex flex-col items-end max-w-[85%] ml-auto">
              <div
                className="p-6 rounded-2xl w-fit"
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                Hello
              </div>
            </div>

            {/* Assistant Message */}
            <div className="flex flex-col max-w-[85%]">
              <div
                className="p-6 rounded-2xl w-fit"
                style={{
                  background: "#f0f0f0",
                  color: "#333",
                }}
              >
                Hello again! Let’s get back on track—what marketing goals are
                you aiming to achieve in the next 6 months? Whether it's
                boosting your online presence, improving engagement, or
                something else, I'm here to help you strategize.
              </div>
            </div>
          </div>

          {/* Input Container */}
          <div className="p-4 bg-white">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Message..."
                className="flex-1 p-3 border bg-white text-black border-black rounded-md"
              />
              <button
                className="px-3 rounded-md flex items-center justify-center min-w-[40px]"
                style={{
                  background: primaryColor,
                  color: secondaryColor,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Powered by footer */}
          <div className="p-2 text-center text-sm bg-[#F5F5F5] text-gray-500 border-t border-gray-200">
            powered by Flowon.AI
          </div>
        </div>
      </div>

      {/* Logo Preview Section */}
      <div className="w-1/6">
        <Card>
          <CardHeader>
            <CardTitle>Logo Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              {agentLogo ? (
                <img
                  src={agentLogo}
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="text-white text-sm">No logo uploaded</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ui;
