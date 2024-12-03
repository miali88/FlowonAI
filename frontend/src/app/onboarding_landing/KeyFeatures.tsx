import { MessageSquare, Clock, Settings, UserCircle } from "lucide-react"

export default function KeyFeatures() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Key Features</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 hover:border hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-6 h-6 text-white/80" />
              <h3 className="text-xl font-semibold text-white">AI-Powered Chat</h3>
            </div>
            <p className="text-gray-300">
              Natural conversations that understand context and user intent
            </p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 hover:border hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-white/80" />
              <h3 className="text-xl font-semibold text-white">Fast Setup</h3>
            </div>
            <p className="text-gray-300">
              Complete onboarding in minutes instead of hours
            </p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 hover:border hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-6 h-6 text-white/80" />
              <h3 className="text-xl font-semibold text-white">Customizable</h3>
            </div>
            <p className="text-gray-300">
              Fully adaptable to your brand and workflow
            </p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 hover:border hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <UserCircle className="w-6 h-6 text-white/80" />
              <h3 className="text-xl font-semibold text-white">Smart Data Collection</h3>
            </div>
            <p className="text-gray-300">
              Intelligently gather user information without repetitive questions
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
