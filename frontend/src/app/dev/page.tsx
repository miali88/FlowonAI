'use client';

import React, { useEffect, useState } from 'react';
import { NylasSchedulerEditor } from "@nylas/react";

const NYLAS_CLIENT_ID = 'b39310e3-7a3d-4f9f-877d-a9193e905b81';

export default function SchedulerEditorPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full">
      {isMounted && (
        <NylasSchedulerEditor
          schedulerPreviewLink={`${window.location.origin}/?config_id={config.id}`}
          nylasSessionsConfig={{
            clientId: NYLAS_CLIENT_ID,
            redirectUri: `${window.location.origin}/scheduler-editor`,
            domain: "https://api.us.nylas.com/v3",
            hosted: true,
            accessType: 'offline',
          }}
          defaultSchedulerConfigState={{
            selectedConfiguration: {
              requires_session_auth: false,
              scheduler: {
                rescheduling_url: `${window.location.origin}/reschedule/:booking_ref`,
                cancellation_url: `${window.location.origin}/cancel/:booking_ref`
              }
            }
          }}
          onError={(error) => {
            console.error('Nylas Editor Error:', error);
          }}
        />
      )}
    </div>
  );
}

