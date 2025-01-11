import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Agent } from "../AgentCards";

interface UiProps {
  selectedAgent: Agent;
  setSelectedAgent: (agent: Agent) => void;
}

const Ui: React.FC<UiProps> = ({ selectedAgent, setSelectedAgent }) => {
  // Handler for updating UI settings
  const handleUiChange = (key: string, value: any) => {
    setSelectedAgent({
      ...selectedAgent,
      ui: {
        ...selectedAgent.ui,
        [key]: value,
      },
    });
  };

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
                value={selectedAgent?.ui?.primaryColor || "#000000"}
                onChange={(e) => handleUiChange("primaryColor", e.target.value)}
                className="w-[100px]"
              />
              <Input
                type="text"
                value={selectedAgent?.ui?.primaryColor || "#000000"}
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
                value={selectedAgent?.ui?.secondaryColor || "#000000"}
                onChange={(e) =>
                  handleUiChange("secondaryColor", e.target.value)
                }
                className="w-[100px]"
              />
              <Input
                type="text"
                value={selectedAgent?.ui?.secondaryColor || "#000000"}
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const imageUrl = URL.createObjectURL(file);
                  handleUiChange("logo", imageUrl);
                }
              }}
              className="mt-2 w-[250px]"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-start">
            <button
              className="py-2 px-4 bg-primary text-black rounded-md hover:bg-primary/90 transition-colors w-[250px]"
              onClick={() => {
                // Add your save logic here
                console.log("Saving UI settings:", selectedAgent.ui);
              }}
            >
              Save Changes
            </button>
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
              background: selectedAgent?.ui?.primaryColor || "#000000",
              color: selectedAgent?.ui?.secondaryColor || "#ffffff",
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
                  background: selectedAgent?.ui?.primaryColor || "#0066ff",
                  color: selectedAgent?.ui?.secondaryColor || "#ffffff",
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
                backgroundColor: selectedAgent?.ui?.primaryColor || "#000000",
              }}
            >
              {selectedAgent?.ui?.logo ? (
                <img
                  src={selectedAgent?.ui?.logo}
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
