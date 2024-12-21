// Language Options
export const LANGUAGE_OPTIONS = [
    { id: "en-GB", name: "English GB" },
    { id: "en-US", name: "English US" },
    { id: "fr", name: "French" },
    { id: "de", name: "German" },
    { id: "ar", name: "Arabic" },
    { id: "nl", name: "Dutch" },
    { id: "zh", name: "Mandarin" },
  ];
  
  // Agent Purpose Options
export const AGENT_PURPOSE_OPTIONS = [
  { id: "telephone-agent", title: "Telephone Agent" },
  { id: "feedback-widget", title: "Feedback Widget" },
  { id: "voice-web-agent", title: "Voice Web Agent" },
  { id: "text-chatbot-agent", title: "Text Chatbot Agent" },
];
  
  // Voice Options
export const VOICE_OPTIONS = {
    "en-GB": [
      { id: "95856005-0332-41b0-935f-352e296aa0df", name: "Alex K", file: "/voices/AlexK.wav", voiceProvider: "cartesia" },
      { id: "79a125e8-cd45-4c13-8a67-188112f4dd22", name: "Beatrice W", file: "/voices/BeatriceW.wav", voiceProvider: "cartesia" },
      { id: "a01c369f-6d2d-4185-bc20-b32c225eab70", name: "Felicity A", file: "/voices/FelicityA.wav", voiceProvider: "cartesia" },
      { id: "2mltbVQP21Fq8XgIfRQJ", name: "Axell", file: "/voices/axell.mp3", voiceProvider: "elevenlabs"},
      { id: "Tx7VLgfksXHVnoY6jDGU", name: "Joe", file: "/voices/joe.mp3", voiceProvider: "elevenlabs"},
      { id: "4u5cJuSmHP9d6YRolsOu", name: "Jay", file: "/voices/jay.mp3", voiceProvider: "elevenlabs"},
      { id: "19STyYD15bswVz51nqLf", name: "Samara", file: "/voices/samara.mp3", voiceProvider: "elevenlabs"},
    ],
    "en-US": [
      { id: "e00d0e4c-a5c8-443f-a8a3-473eb9a62355", name: "US Voice 1", file: "/voices/USVoice1.wav", voiceProvider: "cartesia" },
      { id: "d46abd1d-2d02-43e8-819f-51fb652c1c61", name: "US Voice 2", file: "/voices/USVoice2.wav", voiceProvider: "cartesia" },
      { id: "tnSpp4vdxKPjI9w0GnoV", name: "Hope", file: "/voices/hope.mp3", voiceProvider: "elevenlabs"},
      { id: "Ize3YDdGqJYYKQSDLORJ", name: "Jessica", file: "/voices/jessica.mp3", voiceProvider: "elevenlabs"}
    ],
    "fr": [
      { id: "ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3", name: "Male", file: "/voices/cartesia_french1.wav", voiceProvider: "cartesia" },
      { id: "a249eaff-1e96-4d2c-b23b-12efa4f66f41", name: "Female", file: "/voices/cartesia_french2.wav", voiceProvider: "cartesia" },
    ],
    "de": [
      { id: "de-voice1", name: "German Voice 1", file: "/voices/cartesia_german1.wav", voiceProvider: "cartesia" }
    ],
    "ar": [
      { id: "ar-voice1", name: "Arabic Voice 1", file: "/voices/cartesia_arabic1.wav", voiceProvider: "cartesia" },
      { id: "tavIIPLplRB883FzWU0V", name: "Mona", file: "/voices/mona.mp3", voiceProvider: "elevenlabs"}
    ],
    "nl": [
      { id: "nl-voice1", name: "Dutch Voice 1", file: "/voices/cartesia_dutch1.wav", voiceProvider: "cartesia" }
    ],
    "zh": [
      { id: "zh-voice1", name: "Mandarin Voice 1", file: "/voices/cartesia_mandarin1.wav", voiceProvider: "cartesia" }
    ],
  };

