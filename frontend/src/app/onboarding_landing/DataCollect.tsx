import { Button } from "@/components/ui/button"
import { ClipboardList, BarChart2, BrainCircuit, Check } from "lucide-react"

export default function DataCollect() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Supercharge Your Customer Intelligence</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Transform traditional forms into engaging conversations that capture deeper insights
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Forms Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800 hover:border-purple-500/50 transition-all">
                    <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <ClipboardList className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Smart Forms</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-purple-400" />
                        <span>Dynamic form fields that adapt in real-time</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-purple-400" />
                        <span>Conditional logic for personalized flows</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-purple-400" />
                        <span>3x higher completion rates</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Surveys Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800 hover:border-blue-500/50 transition-all">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <BarChart2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">AI Surveys</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-blue-400" />
                        <span>Natural conversation flow</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-blue-400" />
                        <span>Rich data visualization</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-blue-400" />
                        <span>Sentiment analysis included</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Quizzes Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800 hover:border-cyan-500/50 transition-all">
                    <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <BrainCircuit className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Interactive Quizzes</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-cyan-400" />
                        <span>Gamified data collection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-cyan-400" />
                        <span>Detailed response analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-cyan-400" />
                        <span>Customer preference insights</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Insights Banner */}
              <div className="mt-12 bg-gradient-to-r from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-2">Turn Responses into Revenue</h3>
                    <p className="text-gray-300">
                      Get actionable insights from every interaction. Understand your customers better than ever before.
                    </p>
                  </div>
                  <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold whitespace-nowrap">
                    Start Collecting Data
                  </Button>
                </div>
              </div>
            </div>
    </section>
  )
}
