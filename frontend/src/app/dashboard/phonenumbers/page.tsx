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
import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function PhoneNumbersPage() {
  const { userId } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/twilio/user_numbers`, {
          method: 'GET',
          headers: {
            'x-user-id': userId,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching phone numbers:', errorData);
          return;
        }

        const data = await response.json();
        setPhoneNumbers(data.numbers);
      } catch (error) {
        console.error('Failed to fetch phone numbers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneNumbers();
  }, [userId]);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/livekit/agents`, {
          headers: {
            'x-user-id': userId
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAgents(data.data);
        }
      } catch (error) {
        setAgentsError('Failed to fetch agents');
        console.error('Error fetching agents:', error);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, [userId]);

  if (loading || agentsLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

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
          <p className="mt-4 text-gray-600">No numbers purchased. Please add a number.</p>
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