import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Code, Check, X } from 'lucide-react';

const ComparisonSection = () => {
  const checkboxInputs = React.useMemo(() => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded">
        <label className="block text-sm font-medium mb-1">Questions to Ask</label>
        {[
          "What's your budget range?",
          "Are you the decision maker?",
          "What's your timeline?"
        ].map((question, index) => (
          <div key={index} className="flex items-center mb-2">
            <input 
              type="checkbox" 
              checked={true}
              readOnly
              className="mr-2"
            />
            <span>{question}</span>
          </div>
        ))}
      </div>
    </div>
  ), []);

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">
        Simple Setup, Powerful Results
      </h2>
      
      <div className="flex flex-row gap-8">
        <div className="flex-1">
          <Card className="bg-gray-100 h-full">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Code className="w-6 h-6 mr-2 text-gray-600" />
                <h3 className="text-xl font-semibold">Other AI Platforms</h3>
              </div>
              
              <div className="bg-gray-900 text-gray-200 p-4 rounded-lg font-mono text-sm mb-4">
                {`<agent>
  <system_prompt>
    You are a lead generation assistant.
    Follow this exact conversation flow:
    1. Ask about budget range
    2. Verify decision maker status
    3. Inquire about timeline
    ...
    Must use formal language.
    Must collect all required fields.
    Must follow branching logic:
    if budget < 10000 then...
  </system_prompt>
  <conversation_rules>
    <rule>Always ask follow-up</rule>
    <rule>Persist until data complete</rule>
  </conversation_rules>
</agent>`}
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  <span>Complex prompt engineering required</span>
                </div>
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  <span>Technical knowledge needed</span>
                </div>
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  <span>Time-consuming setup</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="border-2 border-blue-500 h-full">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img src="/api/placeholder/24/24" alt="Flow AI Logo" className="mr-2" />
                <h3 className="text-xl font-semibold">Flow AI</h3>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4">
                {checkboxInputs}
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Simple point-and-click setup</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>No technical knowledge required</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Ready in minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-center mt-8 text-gray-600 max-w-2xl mx-auto">
        Flow AI removes the complexity of traditional AI agent setup. Simply select your desired questions and behaviors through our intuitive interface - no programming or prompt engineering required.
      </p>
    </div>
  );
};

export default React.memo(ComparisonSection);