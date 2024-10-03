import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react"; // Import Loader2 icon

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function DialogDemo() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<string>("");
  const [formData, setFormData] = useState({
    agentName: "",
    agentPurpose: "",
    dataSource: "",
    tag: "",
    openingLine: "", // Ensure openingLine is in the initial state
    voice: "", // Add voice to the initial state
  });
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === "dataSource") {
      setDataSource(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    setResponseMessage("");

    try {
      const dataToSend = { ...formData, userId: user.id };
      
      if (dataToSend.dataSource === "all") {
        delete dataToSend.tag;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/new_agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setResponseMessage('Agent created successfully. Please refresh the page.');
        // Close the dialog after a short delay
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      } else {
        setResponseMessage('Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      setResponseMessage('Error creating agent');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>Create New Agent</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new agent. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentName" className="text-right">
                Agent Name
              </Label>
              <Input
                id="agentName"
                placeholder="Enter agent name"
                className="col-span-3"
                value={formData.agentName}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentPurpose" className="text-right">
                Agent Purpose
              </Label>
              <Select onValueChange={(value) => handleSelectChange("agentPurpose", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select agent purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="question-answer">Question & Answer</SelectItem>
                  <SelectItem value="customer-service">Customer Service</SelectItem>
                  <SelectItem value="product-recommendation">Product Recommendation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataSource" className="text-right">
                Data Source
              </Label>
              <Select onValueChange={(value) => handleSelectChange("dataSource", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="tagged">Items with tag...</SelectItem>
                  <SelectItem value="natural-language">Describe using natural language</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dataSource === "tagged" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tag" className="text-right">
                  Tag
                </Label>
                <Input
                  id="tag"
                  placeholder="Enter tag"
                  className="col-span-3"
                  value={formData.tag}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {dataSource === "natural-language" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 text-sm text-gray-500 italic">
                  You can tag items using natural language in the knowledge base. Please tag, then select them here.
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="openingLine" className="text-right">
                Opening Line
              </Label>
              <Input
                id="openingLine"
                placeholder="Enter opening line"
                className="col-span-3"
                value={formData.openingLine}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="voice" className="text-right">
                Voice
              </Label>
              <Input
                id="voice"
                placeholder="Enter voice style"
                className="col-span-3"
                value={formData.voice}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Agent'
              )}
            </Button>
          </DialogFooter>
          {responseMessage && (
            <div className={`mt-4 text-center ${
              responseMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}>
              {responseMessage}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
