import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Client, clients } from "../data/clients";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  status: string;
}

export function AddClients() {
  const [selectedClients, setSelectedClients] = useState<Client[]>(clients);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setSelectedClients(data.clients);
      setIsUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "Clients imported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleIntegrationClick = async (integration: Integration) => {
    try {
      const response = await fetch(`/api/integrations/${integration.id.toLowerCase()}/connect`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Connection failed');

      const data = await response.json();
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      }
      setIsIntegrationDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to integration",
        variant: "destructive",
      });
    }
  };

  const integrations = [
    {
      id: "HUBSPOT",
      name: "HubSpot",
      icon: "",
      description: "Import contacts from HubSpot",
      category: "CRM",
      status: "Not Connected",
    },
    {
      id: "PIPEDRIVE",
      name: "Pipedrive",
      icon: "",
      description: "Import contacts from Pipedrive",
      category: "CRM",
      status: "Not Connected",
    },
    {
      id: "GOOGLE_SHEETS",
      name: "Google Sheets",
      icon: "",
      description: "Import contacts from Google Sheets",
      category: "Spreadsheet",
      status: "Not Connected",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Clients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-24"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload CSV
          </Button>
          <Button
            variant="outline"
            className="h-24"
            onClick={() => setIsIntegrationDialogOpen(true)}
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Connect to Third Party
          </Button>
        </div>
        
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.number}</TableCell>
                  <TableCell>{client.language}</TableCell>
                  <TableCell>
                    {client.personalDetails.company} - {client.personalDetails.position}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upload CSV File</DialogTitle>
          </DialogHeader>
          <div 
            {...getRootProps()} 
            className={`flex flex-col items-center justify-center h-[calc(100vh-400px)] border-2 border-dashed ${isDragActive ? 'border-primary' : 'border-gray-300'} rounded-lg transition-colors duration-300 cursor-pointer`}
          >
            <input {...getInputProps()} />
            <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-gray-400'} mb-4`} />
            {selectedFile ? (
              <div className="text-center">
                <p className="font-semibold mb-2">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  Type: {selectedFile.type || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center">
                {isDragActive 
                  ? "Drop the files here" 
                  : "Drag and drop files here, or click to select files"}
              </p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleFileUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Connect to Third Party</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((integration) => (
              <Button
                key={integration.id}
                variant="outline"
                className="h-24"
                onClick={() => handleIntegrationClick(integration)}
              >
                {integration.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 