'use client'

import React from 'react';
import { 
  Users, 
  Clock, 
  Battery, 
  Smile, 
  PhoneCall,
  CheckCircle,
  BarChart,
  Coffee,
  Calendar,
  MessageSquare,
  ClipboardList,
  Bell,
  CheckCircle2
} from 'lucide-react';

const WorkloadSection = () => {
  const benefits = [
    {
      icon: <PhoneCall className="w-6 h-6 text-blue-400" />,
      title: "Handle 80% of Routine Inquiries",
      description: "Automatically manage common questions and requests, letting your staff focus on complex tasks",
      stats: "80%",
      statsLabel: "Routine Tasks Automated"
    },
    {
      icon: <Battery className="w-6 h-6 text-green-400" />,
      title: "Reduce Staff Burnout",
      description: "Eliminate repetitive tasks and after-hours work, improving employee satisfaction",
      stats: "60%",
      statsLabel: "Reduction in Repetitive Tasks"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-400" />,
      title: "24/7 Coverage Without Overtime",
      description: "Provide round-the-clock service without demanding extra hours from your team",
      stats: "100%",
      statsLabel: "Time Coverage"
    },
    {
      icon: <BarChart className="w-6 h-6 text-yellow-400" />,
      title: "Increased Productivity",
      description: "Free up your team to focus on high-value activities and strategic tasks",
      stats: "3x",
      statsLabel: "Staff Efficiency"
    }
  ];

  const tasks = [
    {
      icon: <Calendar className="w-10 h-10 text-blue-400" />,
      title: "Smart Scheduling",
      handled: "Intelligent appointment management",
      features: [
        "Automatic calendar optimization",
        "Smart conflict resolution",
        "Reminder system",
        "Multi-timezone support"
      ]
    },
    {
      icon: <MessageSquare className="w-10 h-10 text-green-400" />,
      title: "Customer Support",
      handled: "24/7 intelligent responses",
      features: [
        "Common query resolution",
        "Multi-language support",
        "Context-aware responses",
        "Instant reply system"
      ]
    },
    {
      icon: <ClipboardList className="w-10 h-10 text-purple-400" />,
      title: "Data Management",
      handled: "Automated information handling",
      features: [
        "Customer detail collection",
        "Data organization",
        "Information verification",
        "Secure storage"
      ]
    },
    {
      icon: <Bell className="w-10 h-10 text-yellow-400" />,
      title: "Follow-up System",
      handled: "Proactive engagement",
      features: [
        "Automated check-ins",
        "Status updates",
        "Satisfaction surveys",
        "Re-engagement campaigns"
      ]
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Let Your Team Focus on What Matters
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Reduce staff workload by automating routine tasks and customer interactions
          </p>
        </div>

        {/* Main Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 border border-zinc-800 hover:border-zinc-600 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                {benefit.icon}
                <h3 className="text-lg font-semibold text-white">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                {benefit.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {benefit.stats}
                </span>
                <span className="text-sm text-gray-400">
                  {benefit.statsLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Without Flowon</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400">
                <Coffee className="w-5 h-5 text-gray-500" />
                Staff overwhelmed with routine tasks
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Coffee className="w-5 h-5 text-gray-500" />
                Limited availability outside business hours
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Coffee className="w-5 h-5 text-gray-500" />
                Delayed response times
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Coffee className="w-5 h-5 text-gray-500" />
                High operational costs
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <Smile className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">With Flowon</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Staff focused on high-value tasks
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <CheckCircle className="w-5 h-5 text-green-500" />
                24/7 customer support coverage
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Instant response to inquiries
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Reduced operational costs
              </li>
            </ul>
          </div>
        </div>

        {/* Tasks Handled Section */}
        <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-800">
          <h3 className="text-2xl font-semibold text-white mb-12 text-center">
            Tasks Automated by Flowon
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tasks.map((task, index) => (
              <div 
                key={index} 
                className="group bg-zinc-800/50 rounded-xl p-6 hover:bg-zinc-800/80 transition-all duration-300 relative"
              >
                {/* Icon positioned at the top with larger size and better spacing */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-zinc-900/90 rounded-xl p-4 border border-zinc-700">
                    {task.icon}
                  </div>
                </div>

                {/* Content with adjusted spacing to accommodate floating icon */}
                <div className="text-center pt-8 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {task.title}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {task.handled}
                  </p>
                </div>

                {/* Features list with improved spacing */}
                <ul className="space-y-3">
                  {task.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Bottom gradient line with adjusted position */}
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-zinc-600/50 to-transparent mt-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkloadSection; 