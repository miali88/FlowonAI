'use client'

import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Component for each provider dropdown
interface ProviderDropdownProps {
  title: string;
  children: ReactNode;
}

const ProviderDropdown = ({ title, children }: ProviderDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mt-6 border border-gray-700 rounded-md overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-gray-800 hover:bg-gray-700 text-left transition-colors"
      >
        <h3 className="text-xl font-semibold">{title}</h3>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );
};

export default function CallForwardingGuidePage() {
  return (
    <article className="prose prose-invert max-w-4xl mx-auto p-6">
      <h1>Setup call forwarding to launch Flowon for your business</h1>
      
      <section className="mb-8">
        <p className="text-lg font-medium">
          Learn how to launch the Flowon AI service for your business by setting your business phone number to forward to Flowon
        </p>
        <p className="text-sm text-gray-400">Updated over a month ago</p>
        
        <p className="mt-6">
          Flowon is always there to answer your calls - the hours Flowon works is up to you! You can launch Flowon at any time by setting up call forwarding for your business phone number, and turn Flowon service off at any time by updating your forwarding settings.
        </p>
        
        <p className="mt-4">
          The Flowon team will never interrupt your provided service, and you will be notified via email before approaching any overage charges.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold">Call forwarding instructions for popular web phone services</h2>
        
        <ProviderDropdown title="OpenPhone">
          <p className="font-medium">Unconditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Click "Settings" from the left-hand menu.</li>
            <li>Under "Workspace", click "Phone Numbers".</li>
            <li>Select the phone number that you want to set up call forwarding on and select "Forward all calls" under Call flow.</li>
            <li>Add the number you'd like to forward to and hit "Forward".</li>
          </ol>
          
          <p className="font-medium mt-3">Conditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Click "Settings" from the left-hand menu.</li>
            <li>Under "Workspace", click "Phone Numbers".</li>
            <li>If you want to forward calls outside of business hours to another phone number, go to Call Flow settings and click on Business hours. Under Outside business hours, add the telephone number you'd like to forward calls to.</li>
            <li>OR If you'd like to forward calls during business hours to help manage call overflow, scroll to the Unanswered calls section within Call flow. Underneath When no one answers, select Forward to another number.</li>
          </ol>
        </ProviderDropdown>
        
        <ProviderDropdown title="RingCentral">
          <p className="font-medium">Unconditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Click your profile picture at the top left.</li>
            <li>Click Call rules</li>
            <li>Click the Forward all calls toggle to turn it on.</li>
            <li>Click Save.</li>
          </ol>
          
          <p className="font-medium mt-3">Conditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Click your profile picture at the top left.</li>
            <li>Click Call rules</li>
            <li>Click Add schedule, then use the date and time selectors to set your call forwarding schedule.</li>
            <li>Click Save.</li>
          </ol>
        </ProviderDropdown>
        
        <ProviderDropdown title="Google Voice">
          <ol className="list-decimal ml-6">
            <li>Log into your Flowon Admin and go to the 'account' tab.</li>
            <li>Enable the 'Verification code for call forwarding' setting</li>
            <li>Next, go to Google Voice.</li>
            <li>In the top right, click Settings</li>
            <li>Under "Account" {'->'} "Linked numbers," click New linked number</li>
            <li>Enter the phone number to link</li>
            <li>Select 'Send code' to trigger a text message verification code</li>
            <li>Log into your Flowon Admin</li>
            <li>Go to the 'account' tab, and click 'View text messages'. This will open a modal which displays verification text messages received by your Flowon phone number.</li>
            <li>Back in Google Voice</li>
            <li>Enter the code received in the text message and click 'Verify'</li>
            <li>Return to Settings</li>
            <li>On the left, click Calls</li>
            <li>Under 'Incoming calls' change where you get calls to the new linked Flowon number</li>
          </ol>
        </ProviderDropdown>
        
        <ProviderDropdown title="Grasshopper">
          <p>Call forwarding instructions provided by Grasshopper (<a href="https://grasshopper.com/blog/how-to-forward-calls/" className="text-blue-400 hover:underline">https://grasshopper.com/blog/how-to-forward-calls/</a>):</p>
          <ol className="list-decimal ml-6">
            <li>Log into your Grasshopper account and go to Settings {'->'} Call Forwarding Settings {'->'} Extensions. You'll see a list of numbers and extensions associated with your account.</li>
            <li>Select the number or extension to set up call forwarding by clicking the corresponding "edit" button.</li>
            <li>Enter the call forwarding number, which could be another phone number (mobile or landline) or voicemail.</li>
            <li>Determine how you want Grasshopper to handle the call (e.g., announcing a call before you pick it up.)</li>
            <li>Select the time frame for which the call-forwarding rule applies (e.g., 24/7, the weekend, or custom schedule.)</li>
            <li>Save your settings and make a test call to verify it goes to the desired destination.</li>
          </ol>
        </ProviderDropdown>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold">Call forwarding instructions for popular cell phone networks</h2>
        
        <ProviderDropdown title="Verizon">
          <p className="font-medium">Unconditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Dial *72 followed by the virtual phone number.</li>
            <li>Press the call button.</li>
            <li>Wait for confirmation tone or message.</li>
            <li>Hang up.</li>
          </ol>
          
          <p className="font-medium mt-3">Conditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Busy: Dial *90 followed by the virtual phone number, press the call button.</li>
            <li>No Answer: Dial *92 followed by the virtual phone number, press the call button.</li>
          </ol>
        </ProviderDropdown>
        
        <ProviderDropdown title="T-Mobile">
          <p className="font-medium">Unconditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Dial **21* followed by the virtual phone number and #.</li>
            <li>Press the call button.</li>
            <li>Wait for confirmation.</li>
          </ol>
          
          <p className="font-medium mt-3">Conditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Busy: Dial **67* followed by the virtual phone number and #.</li>
            <li>No Answer: Dial **61* followed by the virtual phone number and #.</li>
          </ol>
        </ProviderDropdown>
        
        <ProviderDropdown title="Vodafone (UK)">
          <p className="font-medium">Divert all calls to another number (Unconditional):</p>
          
          <p className="mt-2"><strong>Set up</strong></p>
          <ol className="list-decimal ml-6">
            <li>Call **21* followed by the number you want to divert your calls to (replace the first 0 with +44) then press #</li>
            <li>You'll get a pop-up message saying call forwarding is on</li>
          </ol>
          
          <p className="mt-2"><strong>Turn off</strong></p>
          <ol className="list-decimal ml-6">
            <li>Call ##21#</li>
            <li>You'll get a pop-up message saying call forwarding is off</li>
          </ol>
          
          <p className="mt-2"><strong>Check status</strong></p>
          <ol className="list-decimal ml-6">
            <li>Call ##21#</li>
            <li>You'll get a pop-up message saying if call forwarding is on or off</li>
          </ol>
          
          <p className="font-medium mt-4">Divert all missed or unanswered calls to another number (Conditional):</p>
          
          <p className="mt-2"><strong>Set up</strong></p>
          <ol className="list-decimal ml-6">
            <li>Call **61* followed by the number you want to divert your calls to (replace the first 0 with +44) then press #</li>
            <li>You'll get a pop-up message saying call forwarding is on</li>
          </ol>
          
          <p className="mt-2"><strong>Turn off</strong></p>
          <ol className="list-decimal ml-6">
            <li>Call ##61#</li>
            <li>You'll get a pop-up message saying call forwarding is off</li>
          </ol>
          
          <p className="mt-2"><strong>Check status</strong></p>
          <ol className="list-decimal ml-6">
            <li>Call ##61#</li>
            <li>You'll get a pop-up message saying if call forwarding is on or off</li>
          </ol>
        </ProviderDropdown>
        
        <ProviderDropdown title="Sprint">
          <p className="font-medium">Unconditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Dial *72 followed by the virtual phone number.</li>
            <li>Press the call button.</li>
            <li>Listen for the confirmation tone, then hang up.</li>
          </ol>
          
          <p className="font-medium mt-3">Conditional Call Forwarding:</p>
          <ol className="list-decimal ml-6">
            <li>Busy: Dial *74 followed by the virtual phone number.</li>
            <li>No Answer: Dial *73 followed by the virtual phone number.</li>
          </ol>
        </ProviderDropdown>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold">Call forwarding instructions for landlines</h2>
        
        <ProviderDropdown title="Landlines">
          <p>These instructions work for the vast majority of landlines but there is the occasional exception:</p>
          
          <p className="font-medium mt-3">Enabling call forwarding -</p>
          <ol className="list-decimal ml-6">
            <li>Lift the handset for dial-tone, then press *72.</li>
            <li>Enter the number you would like calls forwarded to followed by #.</li>
            <li>An automatic announcement will confirm your call forwarding destination.</li>
          </ol>
          
          <p className="font-medium mt-3">Disabling call forwarding -</p>
          <ol className="list-decimal ml-6">
            <li>Lift the handset for dial-tone, then press *73.</li>
            <li>An automatic announcement will confirm that Call Forward Always has been disabled.</li>
          </ol>
        </ProviderDropdown>
      </section>
      
      <section className="mt-10 p-4 bg-gray-800 rounded-lg">
        <p className="text-center">
          No instructions for your service? Reach out to our team using the intercom chat or at 
          <a href="mailto:support@flowon.ai" className="text-blue-400 hover:underline ml-1">support@flowon.ai</a> 
          and we'll be happy to help get you set up!
        </p>
      </section>
    </article>
  );
}
