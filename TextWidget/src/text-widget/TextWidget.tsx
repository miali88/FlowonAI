"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./TextWidget.module.css";
import LiveKitTextEntry from "./LiveKitTextEntry";
import { IoSend } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import Footer from "./Footer";
import CalendlyWidget from "./CalendlyWidget";
import { Components } from "react-markdown";

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

interface ChatData {
  messages: Array<any>;
  // ... other chat data properties
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

const TextWidget: React.FC<ChatInterfaceProps> = ({ 
  agentId, 
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1' 
}) => {
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
  const [isLoading, setIsLoading] = useState(true);
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
  const [chatUi, setChatUi] = useState<{
    primaryColor?: string;
    secondaryColor?: string;
  } | null>(null);
  const [agentLogo, setAgentLogo] = useState<string | null>(null);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>(
    {}
  );
  const [dislikedMessages, setDislikedMessages] = useState<
    Record<string, boolean>
  >({});
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);

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
          `${apiBaseUrl}/agents/agent_content/${agentId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch agent metadata: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received agent metadata:", data);

        if (!data.data || !data.data[0]) {
          throw new Error("No agent metadata found");
        }

        const agentData = data.data[0];
        setOpeningLine(agentData.openingLine);
        setAgentName(agentData.agentName);
        setShowSourcesInChat(agentData.showSourcesInChat || false);

        // Set the new states
        setChatUi({
          primaryColor: agentData.chat_ui?.primaryColor || "#000000",
          secondaryColor: agentData.chat_ui?.secondaryColor || "#FFFFFF",
        });
        setAgentLogo(agentData.agent_logo || null);
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

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        
        // Only use agent_id for the room name
        const simpleRoomName = `${agentId}`;
        setRoomName(simpleRoomName);
        
        console.log('🔍 Checking for existing chat with:', {
          agentId,
          simpleRoomName,
          endpoint: `${apiBaseUrl}/chat/existing-chat?agent_id=${agentId}&room_name=${simpleRoomName}`
        });
        
        // Check for existing chat
        const response = await fetch(`${apiBaseUrl}/chat/existing-chat?agent_id=${agentId}&room_name=${simpleRoomName}`);
        const data = await response.json();
        
        console.log('📦 Redis response:', {
          exists: data.exists,
          messageCount: data.chat_data?.messages?.length || 0,
          data: data.chat_data
        });
        
        if (data.exists && data.chat_data) {
          // Convert the Redis chat data format to our Message[] format
          const existingMessages = data.chat_data.messages.map((msg: any) => {
            console.log('🔄 Converting message:', {
              role: msg.role,
              content: msg.content?.slice(0, 50) + '...',  // Log first 50 chars
              responseId: msg.response_id
            });
            
            return {
              text: msg.content,
              isBot: msg.role === "assistant",
              responseId: msg.response_id,
              hasSource: false
            };
          });
          
          setMessages(existingMessages);
          console.log('✅ Loaded existing chat:', {
            messageCount: existingMessages.length,
            firstMessage: existingMessages[0]?.text?.slice(0, 50) + '...',
            lastMessage: existingMessages[existingMessages.length - 1]?.text?.slice(0, 50) + '...'
          });
        } else {
          console.log('🆕 No existing chat found, initializing with opening line:', openingLine);
          // Initialize new chat with opening line if no existing chat
          if (openingLine) {
            setMessages([
              { text: openingLine, isBot: true, responseId: "1a", hasSource: false }
            ]);
          }
        }
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        if (openingLine) {
          setMessages([
            { text: openingLine, isBot: true, responseId: "1a", hasSource: false }
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId && apiBaseUrl) {
      initializeChat();
    }
  }, [agentId, apiBaseUrl, openingLine]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || !roomName) return;

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
              console.log("Starting Redis save process for response:", accumulatedResponse.slice(0, 100) + "...");
              
              try {
                const saveResponse = await fetch(`${apiBaseUrl}/chat/save-response`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    agent_id: agentId,
                    room_name: roomName,
                    response: {
                      role: "assistant",
                      content: accumulatedResponse,
                      response_id: currentResponseId
                    }
                  }),
                });

                if (!saveResponse.ok) {
                  const errorData = await saveResponse.text();
                  console.error("Failed to save to Redis:", saveResponse.status, errorData);
                  throw new Error(`Failed to save to Redis: ${saveResponse.status} ${errorData}`);
                }

                const saveResult = await saveResponse.json();
                console.log("✅ Successfully saved to Redis:", {
                  responseId: currentResponseId,
                  status: saveResult.status,
                  roomName,
                  contentPreview: accumulatedResponse.slice(0, 100) + "..."
                });
              } catch (saveError) {
                console.error("❌ Error saving to Redis:", {
                  error: saveError,
                  responseId: currentResponseId,
                  roomName
                });
              }
              break;
            }

            try {
              const data = JSON.parse(content);
              if (data.response?.answer) {
                const newText = data.response.answer;
                const responseId = data.response?.response_id;
                setCurrentResponseId(responseId);
                accumulatedResponse += newText;

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.isBot) {
                    lastMessage.text = accumulatedResponse;
                    lastMessage.responseId = responseId;
                    lastMessage.hasSource = data.response?.has_source;
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

  async function fetchSources(responseId: string) {
    if (responseId) {
      try {
        const sourcesResponse = await fetch(
          `${apiBaseUrl}/conversation/get_sources?agent_id=${agentId}&room_name=${roomName}&response_id=${responseId}`
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

  // Add this custom components configuration
  const markdownComponents: Components = {
    a: ({ node, ...props }) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  };

  const handleFeedback = async (messageId: string, isLike: boolean) => {
    try {
      // First update the UI state
      if (isLike) {
        setLikedMessages((prev) => ({
          ...prev,
          [messageId]: !prev[messageId],
        }));
        setDislikedMessages((prev) => ({
          ...prev,
          [messageId]: false,
        }));
      } else {
        setDislikedMessages((prev) => ({
          ...prev,
          [messageId]: !prev[messageId],
        }));
        setLikedMessages((prev) => ({
          ...prev,
          [messageId]: false,
        }));
      }

      // Get the response ID for the message
      const message = messages[parseInt(messageId)];
      if (!message?.responseId) {
        console.error("No response ID found for message");
        return;
      }

      // Send feedback to backend
      const response = await fetch(
        `${apiBaseUrl}/feedback/${message.responseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thumbs_up: isLike,
            room_id: roomName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send feedback");
      }

      const data = await response.json();
      console.log("Feedback sent successfully:", data);
    } catch (error) {
      console.error("Error sending feedback:", error);
      // Optionally revert the UI state if the request failed
      // You could add error handling UI here
    }
  };

  if (isLoading) {
    return <div>Loading chat...</div>;
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
        <div
          className={styles.topBar}
          style={{
            backgroundColor: chatUi?.primaryColor || "#000000",
            color: chatUi?.secondaryColor || "#FFFFFF",
          }}
        >
          {agentLogo ? (
            <div className={styles.agentLogoContainer}>
              <img
                src={agentLogo}
                alt="Agent Logo"
                className={styles.agentLogo}
              />
            </div>
          ) : null}
          <span>Chat with {agentName || "AI Assistant"}</span>
        </div>

        <div className={styles.messageContainer} ref={messageContainerRef}>
          {messages.map((message, index) =>
            message.text ? (
              <div
                key={index}
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
                  className={`${styles.messageBubble} ${
                    message.isBot ? styles.assistantMessage : styles.userMessage
                  }`}
                >
                  <div className={styles.messageBubbleContent}>
                    <ReactMarkdown components={markdownComponents}>
                      {message.text}
                    </ReactMarkdown>
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
                  hoveredMessageIndex === message.responseId && (
                    <div className={styles.messageBubbleActions}>
                      {message.hasSource &&
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

                      <button
                        className={`${styles.actionButton} ${
                          likedMessages[index] ? styles.liked : ""
                        }`}
                        onClick={() => handleFeedback(index.toString(), true)}
                        aria-label="Like message"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                            fill={
                              likedMessages[index] ? "currentColor" : "none"
                            }
                          />
                        </svg>
                      </button>
                      <button
                        className={`${styles.actionButton} ${
                          dislikedMessages[index] ? styles.disliked : ""
                        }`}
                        onClick={() => handleFeedback(index.toString(), false)}
                        aria-label="Dislike message"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"
                            fill={
                              dislikedMessages[index] ? "currentColor" : "none"
                            }
                          />
                        </svg>
                      </button>
                    </div>
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

        {/* Temporarily commenting out suggested questions */}
        {/* <div className={styles.suggestedQuestionsContainer}>
          {activeSuggestions.map((question, =index) => (
            <div
              key={index}
              className={styles.suggestionBubble}
              onClick={() => handleSuggestionClick(question)}
            >
              {question}
            </div>
          ))}
        </div> */}

        <div className={styles.inputContainer}>
          <form onSubmit={handleSendMessage} className={styles.chatForm}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={styles.chatInput}
              placeholder="Message..."
              style={
                {
                  "--primary-color": chatUi?.primaryColor || "#000000",
                } as React.CSSProperties
              }
            />
            <button
              type="submit"
              className={styles.sendButton}
              style={{
                backgroundColor: chatUi?.primaryColor || "#000000",
                color: chatUi?.secondaryColor || "#FFFFFF",
              }}
            >
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
