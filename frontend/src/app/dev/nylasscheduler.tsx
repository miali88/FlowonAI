'use client';

import { NylasScheduling } from '@nylas/react';
import React from 'react';

export default function Scheduler() {
  // Set the scheduler configuration ID if using public configuration (`requires_session_auth=false`)
  const configId = '<SCHEDULER_CONFIG_ID>';
  return <NylasScheduling configurationId={configId} />;
}
