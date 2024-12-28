"use client"

import Image from 'next/image'

export function SecurityChat() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Guardrails in place to keep sensitive data safe</h2>
        <p className="text-gray-600"></p>
      </div>
      <div className="container mx-auto px-4">
        <div className="relative w-fit mx-auto">
          <img
            src="/images/securitychat.png"
            alt="Security chat integration"
            className="w-full max-w-sm rounded-lg shadow-lg"
          />
          <Image
            src="/icons/lock.png"
            alt="Security lock icon"
            width={120}
            height={120}
            className="absolute -right-12 top-1/2 transform -translate-y-1/2"
          />
        </div>
      </div>
    </section>
  );
}
