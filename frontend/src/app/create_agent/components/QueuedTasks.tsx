'use client';

interface QueuedTask {
  url: string;
  status: 'pending' | 'success' | 'failed';
  agentUrl?: string;
}

export default function QueuedTasks({ tasks }: { tasks: QueuedTask[] }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Queued Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <p className="font-medium">{task.url}</p>
            <p className="text-sm mt-1">
              Status: {task.status}
              {task.agentUrl && (
                <a href={task.agentUrl} target="_blank" rel="noopener noreferrer" 
                   className="ml-4 text-blue-500 hover:underline">
                  View Agent
                </a>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 