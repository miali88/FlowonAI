'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

// This would come from your API
interface PhoneNumber {
  id: string;
  number: string;
  countryCode: string;
  assignedAgent: string | null;
  status: 'active' | 'inactive';
}

// This would also come from your API
interface Agent {
  id: string;
  name: string;
}

export default function PhoneNumbersPage() {
  // Example data - replace with actual API calls
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([
    {
      id: '1',
      number: '+1 (555) 123-4567',
      countryCode: 'US',
      assignedAgent: null,
      status: 'active',
    },
  ]);

  const [agents] = useState<Agent[]>([
    { id: '1', name: 'Agent Smith' },
    { id: '2', name: 'Agent Johnson' },
  ]);

  const handleAssignAgent = (phoneNumberId: string, agentId: string | null) => {
    setPhoneNumbers(numbers =>
      numbers.map(num =>
        num.id === phoneNumberId
          ? { ...num, assignedAgent: agentId }
          : num
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">Phone Numbers</span>
        </div>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Add Number
        </Button>
      </div>

      {phoneNumbers.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600">You don't have any phone numbers</p>
        </div>
      ) : (
        // Phone Numbers Table
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Agent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phoneNumbers.map((number) => (
                <TableRow key={number.id}>
                  <TableCell>{number.number}</TableCell>
                  <TableCell>{number.countryCode}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      number.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {number.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={number.assignedAgent || undefined}
                      onValueChange={(value) => handleAssignAgent(number.id, value || null)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Assign agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">None</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}