'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import QueuedTasks from './components/QueuedTasks';

interface QueuedTask {
  url: string;
  status: 'pending' | 'success' | 'failed';
  agentUrl?: string;
}

export default function CreateAgentFromURL() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<QueuedTask[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    // Add task to queue immediately
    const newTask: QueuedTask = { url, status: 'pending' };
    setTasks([...tasks, newTask]);
    setUrl(''); // Clear URL field immediately

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/auto_create_agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      // Update task status based on response
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.url === url 
            ? { 
                ...task, 
                status: 'success',
                agentUrl: `https://flowon.ai/iframe?agentId=${data.agent_id}` 
              } 
            : task
        )
      );

      toast.success('Agent created successfully');
    } catch (error) {
      // Update task status to failed
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.url === url 
            ? { ...task, status: 'failed' } 
            : task
        )
      );
      console.error('Error:', error);
      toast.error('Failed to create agent');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">Create Agent from URL</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Website URL
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Agent...' : 'Create Agent from URL'}
        </Button>
      </form>

      <QueuedTasks tasks={tasks} />
    </div>
  );
}
