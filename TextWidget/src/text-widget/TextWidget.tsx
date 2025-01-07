"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./TextWidget.module.css";
import LiveKitTextEntry from "./LiveKitTextEntry";
import { IoSend } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import Footer from "./Footer";
import CalendlyWidget from "./CalendlyWidget";

import CloseIcon from "../assets/close-icon.svg";

interface Message {
  text: string;
  isBot: boolean;
  responseId?: string;
  hasSource?: boolean;
}

interface FormField {
  type: string;
  label: string;
}

interface ChatInterfaceProps {
  agentId?: string;
  apiBaseUrl?: string;
  suggestedQuestions?: string[];
}

interface Source {
  content: string;
  source_url: string;
  source_file?: string;
}

const LoadingBubbles = () => (
  <div className={styles.loadingBubbles} data-loading-spinner>
    <div className={styles.bubble}></div>
    <div className={styles.bubble}></div>
    <div className={styles.bubble}></div>
  </div>
);

const SUGGESTED_QUESTIONS = [
  "How can I get started?",
  "Tell me more about your company",
  "What services do you offer?",
  "Who's on your team at WeCreate?",
];

const DEBUG_SHOW_FORM = false; // Set to true to always show the form for debugging
const DEBUG_SHOW_CALENDLY = false; // Set to true to always show Calendly widget for debugging

const TextWidget: React.FC<ChatInterfaceProps> = ({ agentId, apiBaseUrl }) => {
  console.log("Received suggestedQuestions:", SUGGESTED_QUESTIONS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [activeSuggestions, setActiveSuggestions] =
    useState<string[]>(SUGGESTED_QUESTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [participantIdentity, setParticipantIdentity] = useState<string | null>(
    null
  );
  const [showCalendly, setShowCalendly] = useState(false);
  const [openingLine, setOpeningLine] = useState<string | null>(null);
  const [currentOpeningResponseId, setCurrentOpeningResponseId] = useState<
    string | null
  >(null);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<string | null>(
    null
  );
  const [sources, setSources] = useState<Source[]>([]);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [showSourcesInChat, setShowSourcesInChat] = useState<boolean>(false);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add effect to fetch agent metadata
  useEffect(() => {
    const fetchAgentMetadata = async () => {
      try {
        console.log("Fetching agent metadata for agentId:", agentId);
        const response = await fetch(
          `${apiBaseUrl}/livekit/agent_content/${agentId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch agent metadata: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received agent metadata:", data);

        if (!data.data || !data.data[0] || !data.data[0].openingLine) {
          throw new Error("No opening line found in agent metadata");
        }

        const openingLineFromData = data.data[0].openingLine;
        const agentNameFromData = data.data[0].agentName;
        const showSourcesFromData = data.data[0].showSourcesInChat || false;
        
        setOpeningLine(openingLineFromData);
        setAgentName(agentNameFromData);
        setShowSourcesInChat(showSourcesFromData);
      } catch (error) {
        console.error("Error fetching agent metadata:", error);
      }
    };

    if (agentId) {
      fetchAgentMetadata();
    }
  }, [agentId, apiBaseUrl]);

  // Add console log to check when opening line changes
  useEffect(() => {
    console.log("Opening line state changed to:", openingLine);
    if (openingLine) {
      setMessages([
        { text: openingLine, isBot: true, responseId: "1a", hasSource: false },
      ]);
    }
  }, [openingLine]);

  // Add form fields fetch effect
  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/conversation/form_fields/${agentId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch form fields");
        }
        const data = await response.json();
        console.log("Retrieved form fields:", data);
        setFormFields(data.fields || []);
      } catch (error) {
        console.error("Error fetching form fields:", error);
      }
    };

    if (agentId) {
      fetchFormFields();
    }
  }, [agentId, apiBaseUrl]);

  useEffect(() => {
    if (participantIdentity || DEBUG_SHOW_FORM) {
      const eventSource = new EventSource(
        `${apiBaseUrl}/conversation/events/${participantIdentity}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "show_chat_input") {
          setShowForm(true);
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [participantIdentity, apiBaseUrl]);

  useEffect(() => {
    if (agentName) {
      console.log("Updating suggestions with agentName:", agentName);
      setActiveSuggestions((prev) => [
        ...prev.filter((q) => !q.includes("Who's on your team")),
        `Who's on your team at ${agentName}?`,
      ]);
    }
  }, [agentName]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || !roomName) return;

    // Check if the user wants to schedule a meeting
    if (
      inputText.toLowerCase().includes("schedule") ||
      inputText.toLowerCase().includes("book") ||
      inputText.toLowerCase().includes("meeting")
    ) {
      setShowCalendly(true);
      return;
    }

    const userMessage: Message = { text: inputText, isBot: false };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = inputText;
    setInputText("");

    // Add empty bot message immediately to show loading state
    setMessages((prev) => [...prev, { text: "", isBot: true }]);

    let accumulatedResponse = "";

    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          agent_id: agentId,
          room_name: roomName,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.slice(6).trim();

            if (content === "[DONE]") {
              console.log("Complete response:", accumulatedResponse);
              break;
            }

            try {
              const data = JSON.parse(content);
              if (data.response?.answer) {
                const newText = data.response.answer;
                const responseId = data.response?.response_id;
                const hasSource = data.response?.has_source;
                accumulatedResponse += newText;

                // Check if the bot's response should trigger Calendly
                handleBotResponse(accumulatedResponse);

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.isBot) {
                    lastMessage.text = accumulatedResponse;
                    lastMessage.responseId = responseId;
                    lastMessage.hasSource = hasSource;
                  }
                  return newMessages;
                });
              }
            } catch (parseError) {
              console.warn("Failed to parse chunk:", content, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your message.",
          isBot: true,
          hasSource: false,
        },
      ]);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!roomName) return;

    // Remove the clicked suggestion
    setActiveSuggestions((prev) => prev.filter((s) => s !== suggestion));

    // Add user message to UI immediately
    setMessages((prev) => [...prev, { text: suggestion, isBot: false }]);

    // Send directly to chat API
    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: suggestion,
          agent_id: agentId,
          room_name: roomName,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      // Add initial empty bot message
      const botMessage: Message = { text: "", isBot: true, hasSource: false };
      setMessages((prev) => [...prev, botMessage]);

      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.slice(6).trim();

            if (content === "[DONE]") {
              console.log("Complete response:", accumulatedResponse);
              break;
            }

            try {
              const data = JSON.parse(content);
              if (data.response?.answer) {
                const newText = data.response.answer;
                const responseId = data.response.response_id;
                const hasSource = data.response.has_source;
                accumulatedResponse += newText;

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.isBot) {
                    lastMessage.text = accumulatedResponse;
                    lastMessage.responseId = responseId;
                    lastMessage.hasSource = hasSource;
                  }
                  return newMessages;
                });
              }
            } catch (parseError) {
              console.warn("Failed to parse chunk:", content, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your message.",
          isBot: true,
          hasSource: false,
        },
      ]);
    }
  };

  const handleRoomConnected = (newRoomName: string) => {
    setRoomName(newRoomName);
    setParticipantIdentity(newRoomName); // Assuming roomName is used as participantIdentity
    console.log("Room connected:", newRoomName);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiBaseUrl}/conversation/chat_message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          user_id: null,
          room_name: roomName,
          participant_identity: participantIdentity, // Include participantIdentity
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      // Add success message to chat
      setMessages((prev) => [
        ...prev,
        {
          text: "Thank you for submitting the form! We will get back to you shortly",
          isBot: true,
          hasSource: false,
        },
      ]);

      // Clear form data and hide form
      setFormData({});
      setShowForm(false);
    } catch (error) {
      console.error("Failed to submit form:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error submitting the form. Please try again.",
          isBot: true,
          hasSource: false,
        },
      ]);
    }
  };

  const handleInputChange = (fieldLabel: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }));
  };

  // Add this function to handle bot responses that should trigger Calendly
  const handleBotResponse = (response: string) => {
    // Check if the bot's response contains keywords that should trigger Calendly
    if (
      response.toLowerCase().includes("schedule a meeting") ||
      response.toLowerCase().includes("book a call")
    ) {
      setShowCalendly(true);
    }
  };

  async function fetchSources(responseId: string) {
    if (responseId) {
      try {
        const sourcesResponse = await fetch(
          `${apiBaseUrl}/chat/get_sources?agent_id=${agentId}&room_name=${roomName}&response_id=${responseId}`
        );

        if (!sourcesResponse.ok) {
          console.error(`Error fetching sources: ${sourcesResponse.status}`);
          const errorText = await sourcesResponse.text();
          console.error(`Error details: ${errorText}`);
          return;
        }

        const sourcesData = await sourcesResponse.json();
        setSources(sourcesData.sources);
        console.log("Sources fetched:", sourcesData.sources);
      } catch (error) {
        console.error("Error fetching sources:", error);
      }
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        minHeight: "-webkit-fill-available",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <LiveKitTextEntry
        agentId={agentId || ""}
        apiBaseUrl={apiBaseUrl || ""}
        onRoomConnected={handleRoomConnected}
      />
      <div className={styles.chatContainer}>
        <div className={styles.messageContainer} ref={messageContainerRef}>
          {messages.map((message, index) =>
            message.text ? (
              <div
                className={
                  message.isBot
                    ? styles.messageAssistantBubbleContainer
                    : styles.messageUserBubbleContainer
                }
                onMouseEnter={() =>
                  message.isBot &&
                  message.responseId &&
                  setHoveredMessageIndex(message.responseId)
                }
                onMouseLeave={() => setHoveredMessageIndex(null)}
              >
                <div
                  key={index}
                  className={`${styles.messageBubble} ${
                    message.isBot ? styles.assistantMessage : styles.userMessage
                  }`}
                >
                  <div className={styles.messageBubbleContent}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>

                  {/* Show form if needed */}
                  {message.isBot &&
                    (showForm || DEBUG_SHOW_FORM) &&
                    index === messages.length - 1 && (
                      <form
                        onSubmit={handleFormSubmit}
                        className={styles.formContainer}
                      >
                        {formFields.map((field, index) => (
                          <div key={index} className={styles.formField}>
                            <label htmlFor={field.label}>{field.label}</label>
                            <input
                              type={field.type}
                              id={field.label}
                              value={formData[field.label] || ""}
                              onChange={(e) =>
                                handleInputChange(field.label, e.target.value)
                              }
                              required
                            />
                          </div>
                        ))}
                        <button type="submit" className={styles.submitButton}>
                          Submit
                        </button>
                      </form>
                    )}
                </div>
                {message.isBot &&
                  message.hasSource &&
                  message.responseId &&
                  showSourcesInChat &&
                  hoveredMessageIndex === message.responseId && (
                    <button
                      className={styles.showSourcesButton}
                      onClick={() => {
                        fetchSources(message.responseId as string);
                        setCurrentOpeningResponseId(
                          message.responseId as string
                        );
                      }}
                    >
                      <svg
                        className={styles.sourceIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      View references
                    </button>
                  )}
              </div>
            ) : message.isBot ? (
              <LoadingBubbles key={index} />
            ) : null
          )}

          {/* Show Calendly widget after messages if needed */}
          {(showCalendly || DEBUG_SHOW_CALENDLY) && (
            <div className={styles.inlineCalendlyContainer}>
              <button
                className={styles.closeButton}
                onClick={() => setShowCalendly(false)}
              >
                Close Calendar
              </button>
              <CalendlyWidget />
            </div>
          )}

          {currentOpeningResponseId && (
            <div className={styles.sourceContainer}>
              <div className={styles.sourceContainerHeader}>
                <h2>References</h2>
                <button
                  className={styles.sourceCloseButton}
                  onClick={() => setCurrentOpeningResponseId(null)}
                >
                  <img width={20} height={20} src={CloseIcon} alt="Close" />
                </button>
              </div>
              <div className={styles.sourcesList}>
                {sources.map((source, index) => (
                  <div key={index} className={styles.sourceItem}>
                    {source.source_url && (
                      <div className={styles.sourceUrlContainer}>
                        <span>URL: </span>
                        <a
                          href={source.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.sourceLink}
                        >
                          {source.source_url}
                          <svg
                            className={styles.externalIcon}
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                    {source.source_file && (
                      <div className={styles.sourceFileWrapper}>
                        <p className={styles.sourceFileLabel}>Source File</p>
                        <div className={styles.sourceFile}>
                          <svg
                            className={styles.fileIcon}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className={styles.sourceFileText}>
                            {source.source_file}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.suggestedQuestionsContainer}>
          {activeSuggestions.map((question, index) => (
            <div
              key={index}
              className={styles.suggestionBubble}
              onClick={() => handleSuggestionClick(question)}
            >
              {question}
            </div>
          ))}
        </div>

        <div className={styles.inputContainer}>
          <form onSubmit={handleSendMessage} className={styles.chatForm}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={styles.chatInput}
              placeholder="Message..."
            />
            <button type="submit" className={styles.sendButton}>
              <IoSend size={20} />
            </button>
          </form>
        </div>

        {/* <div className={styles.scheduleButtonContainer}>
          <button 
            className={styles.scheduleButton}
            onClick={() => setShowCalendly(true)}
          >
            Schedule a Meeting
          </button>
        </div> */}

        <Footer />
      </div>
    </div>
  );
};

export default TextWidget;
