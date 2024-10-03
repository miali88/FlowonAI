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

export function DialogDemo() {
  const [dataSource, setDataSource] = useState<string>("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Agent</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            <Input id="agentName" placeholder="Enter agent name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agentPurpose" className="text-right">
              Agent Purpose
            </Label>
            <Select>
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
            <Select onValueChange={(value) => setDataSource(value)}>
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
              <Input id="tag" placeholder="Enter tag" className="col-span-3" />
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
            <Input id="openingLine" placeholder="Enter opening line" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="voice" className="text-right">
              Voice
            </Label>
            <Input id="voice" placeholder="Enter voice style" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
