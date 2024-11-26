'use client';

import { NylasSchedulerEditor } from '@nylas/react';

export default function DevPage() {
  return (
    <div className="w-full h-full">
      <NylasSchedulerEditor 
        mode="app"
        requiresSlug={false}
        schedulerPreviewLink="https://book.nylas.com/us/4a04150f-1554-44c0-a268-aedfd01633ba"
        defaultSchedulerConfigState={{
          selectedConfiguration: {
            name: "Leads Flowon",
            event_duration: 30,
          } as { name: string; event_duration: number }
        }}
      />
    </div>
  );
}

