export default function StatsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="text-purple-400 text-sm font-medium mb-2">Average Time</div>
              <div className="text-4xl font-bold text-white mb-1">2.5min</div>
              <div className="text-white/60 text-sm">Onboarding Completion</div>
              <div className="absolute top-4 right-4">
                <span className="text-green-400 text-sm font-medium">↑ 95%</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="text-blue-400 text-sm font-medium mb-2">Total Users</div>
              <div className="text-4xl font-bold text-white mb-1">10k+</div>
              <div className="text-white/60 text-sm">Successful Onboardings</div>
              <div className="absolute top-4 right-4">
                <span className="text-green-400 text-sm font-medium">↑ 80%</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="text-cyan-400 text-sm font-medium mb-2">Satisfaction</div>
              <div className="text-4xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-white/60 text-sm">User Rating</div>
              <div className="absolute top-4 right-4">
                <span className="text-green-400 text-sm font-medium">↑ 98%</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="text-teal-400 text-sm font-medium mb-2">Analytics</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Completion</span>
                  <span className="text-white font-medium">85%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Engagement</span>
                  <span className="text-white font-medium">92%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
