"use client"

export function CalendlyWidget() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Schedule meetings in chat when visitor shows interest</h2>
        {/* <p className="text-gray-600">Your agent can present a calender for your customers to book an appointment</p> */}
      </div>
      <div className="container mx-auto px-4">
        <img
          src="/images/calendlychat.png"
          alt="Calendly chat integration"
          className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
        />
      </div>
    </section>
  );
}
