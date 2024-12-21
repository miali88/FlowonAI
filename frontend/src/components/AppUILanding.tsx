export default function AppUILanding() {
  return (
    <div className="mt-8 w-full max-w-[900px] mx-auto">
      {/* Flex container - increased gap further */}
      <div className="flex items-center justify-between gap-32">
        {/* Chat Bubbles Section - Left Side - increased width */}
        <div 
          className="relative w-[48%]"
          style={{
            perspective: '1000px'
          }}
        >
          <div 
            className="w-full scale-75"
            style={{
              transform: 'rotateY(-20deg) rotateX(10deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Chat Content - Updated animation timing */}
            <div className="space-y-3">
              {/* Assistant Message */}
              <div className="flex items-start gap-4 animate-fadeIn opacity-0" 
                   style={{ animation: 'fadeIn 1s ease-out forwards' }}>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-purple-100 rounded-3xl rounded-tl-sm p-3 text-gray-800 chat-bubble"
                       style={{ transform: 'translateZ(10px)' }}>
                    <p className="text-lg">J Cooper's Legal Practice, how can I help?</p>
                  </div>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start justify-end gap-4 opacity-0"
                   style={{ animation: 'fadeIn 1s ease-out 0.8s forwards' }}>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-blue-500 rounded-3xl rounded-tr-sm p-3 text-white chat-bubble"
                       style={{ transform: 'translateZ(20px)' }}>
                    <p className="text-lg">Need some legal advice for my business</p>
                  </div>
                </div>
              </div>

              {/* Assistant Response */}
              <div className="flex items-start gap-4 opacity-0"
                   style={{ animation: 'fadeIn 1s ease-out 1.6s forwards' }}>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-purple-100 rounded-3xl rounded-tl-sm p-3 text-gray-800 chat-bubble"
                       style={{ transform: 'translateZ(30px)' }}>
                    <p className="text-lg">Sure, let me start by taking some details...</p>
                  </div>
                </div>
              </div>

              {/* Phone Icon */}
              <div className="flex justify-center mt-6 opacity-0"
                   style={{ animation: 'fadeIn 1s ease-out 2.4s forwards' }}>
                <img 
                  src="/images/phone.png" 
                  alt="Phone Icon" 
                  className="w-20 h-20 object-contain"
                  style={{ transform: 'translateZ(40px)' }}
                />
              </div>
            </div>

            {/* Reflection Effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-xl"
              style={{
                transform: 'translateZ(-1px)'
              }}
            />
            
            {/* Decorative Glowing Elements */}
            <div 
              className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"
              style={{
                transform: 'translateZ(20px)'
              }}
            />
            <div 
              className="absolute -left-4 -bottom-4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
              style={{
                transform: 'translateZ(40px)'
              }}
            />
          </div>
        </div>

        {/* Text Widget Section - Right Side - increased width */}
        <div 
          className="relative w-[40%] animate-slideFromRight"
          style={{
            perspective: '1000px'
          }}
        >
          <div 
            className="w-full scale-90"
            style={{
              transform: 'rotateY(-20deg) rotateX(10deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Main Image */}
            <img 
              src="/images/textwidget_letscreate.png"
              alt="Text Widget Demo"
              className="w-full h-auto rounded-xl shadow-2xl"
            />
            
            {/* Reflection Effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-xl"
              style={{
                transform: 'translateZ(-1px)'
              }}
            />
            
            {/* Decorative Glowing Elements */}
            <div 
              className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"
              style={{
                transform: 'translateZ(20px)'
              }}
            />
            <div 
              className="absolute -left-4 -bottom-4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
              style={{
                transform: 'translateZ(40px)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
