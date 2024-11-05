'use client';

export function ConversationLogs() {
  const conversations = [
    {
      agentName: "Car Mechanic Assistant",
      time: "2 mins ago",
      status: "Appointment Booked",
      summary: [
        "Service requested: Oil change",
        "Vehicle: Luxury sports car",
        "Preferred timing: Next week, Tuesday morning",
        "Contact details collected",
        "Appointment confirmed and scheduled"
      ]
    },
    {
      agentName: "Restaurant Booking Agent",
      time: "15 mins ago",
      status: "Reservation Complete",
      summary: [
        "Table for 4 people",
        "Date: This Friday evening",
        "Dietary requirements: 2 vegetarian meals",
        "Special occasion: Birthday celebration",
        "Booking confirmed and reminder scheduled"
      ]
    },
    {
      agentName: "Property Advisor",
      time: "1 hour ago",
      status: "Lead Qualified",
      summary: [
        "Interest: 2-bedroom apartment",
        "Location preference: City center",
        "Budget range identified",
        "Viewing appointment requested",
        "Follow-up scheduled with agent"
      ]
    }
  ];

  return (
    <section className="py-24 bg-black/5 backdrop-blur-lg">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Smart Conversation Summaries</h2>
            <p className="text-xl text-gray-600">
              See how your AI agents extract and organize key information from every interaction
            </p>
          </div>

          {/* Conversation Summaries */}
          <div className="space-y-6">
            {conversations.map((conv, index) => (
              <div 
                key={index} 
                className="bg-black/20 backdrop-blur-xl rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 text-lg">AI</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{conv.agentName}</h3>
                      <span className="text-sm text-gray-400">{conv.time}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-400">
                    {conv.status}
                  </span>
                </div>
                
                <div className="pl-4 border-l-2 border-blue-500/20">
                  {conv.summary.map((point, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Information Accuracy', value: '98%' },
              { label: 'Avg. Resolution Time', value: '3.5m' },
              { label: 'Customer Satisfaction', value: '4.9/5' },
            ].map((stat, index) => (
              <div key={index} className="bg-black/20 backdrop-blur-xl rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 