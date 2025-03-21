import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function AppUILanding() {
  const t = useTranslations('appUILanding');
  
  return (
    <div className="mt-8 w-full max-w-[900px] mx-auto pb-40 md:pb-32">
      {/* Modified flex container to center content */}
      <div className="flex items-center justify-center">
        {/* Chat Bubbles Section - Adjusted width */}
        <div 
          className="relative w-[80%] sm:w-[45%] md:w-[40%]"
          style={{
            perspective: '1000px'
          }}
        >
          <div 
            className="w-full scale-[0.65] sm:scale-[0.45] md:scale-75"
            style={{
              transform: 'rotateY(-20deg) rotateX(10deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Chat Content - Updated animation timing */}
            <div className="space-y-2 md:space-y-3">
              {/* Assistant Message */}
              <div className="flex items-start gap-2 md:gap-4 animate-fadeIn opacity-0" 
                   style={{ animation: 'fadeIn 1s ease-out forwards' }}>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-purple-100 rounded-2xl md:rounded-3xl rounded-tl-sm p-2 md:p-3 text-gray-800 chat-bubble"
                       style={{ transform: 'translateZ(10px)' }}>
                    <p className="text-base md:text-lg">{t('agentGreeting')}</p>
                  </div>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start justify-end gap-2 md:gap-4 opacity-0"
                   style={{ animation: 'fadeIn 1s ease-out 0.8s forwards' }}>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-blue-500 rounded-2xl md:rounded-3xl rounded-tr-sm p-2 md:p-3 text-white chat-bubble"
                       style={{ transform: 'translateZ(20px)' }}>
                    <p className="text-base md:text-lg">{t('userMessage')}</p>
                  </div>
                </div>
              </div>

              {/* Assistant Response */}
              <div className="flex items-start gap-2 md:gap-4 opacity-0"
                   style={{ animation: 'fadeIn 1s ease-out 1.6s forwards' }}>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-purple-100 rounded-2xl md:rounded-3xl rounded-tl-sm p-2 md:p-3 text-gray-800 chat-bubble"
                       style={{ transform: 'translateZ(30px)' }}>
                    <p className="text-base md:text-lg">{t('agentResponse')}</p>
                  </div>
                </div>
              </div>

              {/* Phone Icon - Added responsive sizing */}
              <div className="flex justify-center mt-4 md:mt-6 opacity-0"
                   style={{ animation: 'fadeIn 1s ease-out 2.4s forwards' }}>
                <Image 
                  src="/images/phone.png"
                  alt={t('phoneIconAlt')}
                  width={60}
                  height={60}
                  className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                  priority={false}
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

        {/* Text Widget Section - Commented out for now */}
        {/*
          <div 
            className="relative w-[45%] md:w-[40%] animate-slideFromRight"
            style={{
              perspective: '1000px'
            }}
          >
            <div 
              className="w-full scale-100 md:scale-90"
              style={{
                transform: 'rotateY(-20deg) rotateX(10deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              <img 
                src="/images/textwidget_letscreate.png"
                alt="Text Widget Demo"
                className="w-full h-auto rounded-xl shadow-2xl"
              />
              
              <div 
                className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-xl"
                style={{
                  transform: 'translateZ(-1px)'
                }}
              />
              
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
        */}
      </div>
    </div>
  );
}
