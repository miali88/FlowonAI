export const schedulerConfig = {
  ID: "AAAA-BBBB-1111-2222",
  participants: [
    {
      name: "Nylas",
      email: "nylas@example.com",
      is_organizer: true,
      availability: {
        calendar_ids: ["primary"]
      },
      booking: {
        calendar_id: "primary"
      }
    }
  ],
  availability: {
    duration_minutes: 30
  },
  event_booking: {
    title: "My test event"
  },
  scheduler: {
    rescheduling_url: "https://www.example.com/reschduling/:booking_ref",
    cancellation_url: "https://www.example.com/cancelling/:booking_ref"
  },
  name: "Your Custom Page Name"
}; 