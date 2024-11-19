'use client';

import React from 'react';
import { NylasScheduling } from '@nylas/react';
import { useParams } from 'next/navigation';

export default function CancelPage() {
  const { bookingRef } = useParams();
  
  return (
    <div>
      <NylasScheduling
        cancelBookingRef={bookingRef as string}
        // Add sessionId if using private configuration
        // sessionId={sessionId}
      />
    </div>
  );
}