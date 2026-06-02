// AssistantScreen.jsx - Complete Rebuild with All Features
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  PermissionsAndroid,
} from "react-native";
import { playAudioBlob, releaseActiveAudio } from "../utils/playAudio";
import storageService from "../services/storageService";
import {
  RAG_API_BASE_URL,
  askRagAssistant,
  translateAssistantText,
  speakText,
  getChatSessions,
  getChatSession,
  saveChatSession,
  deleteChatSession,
  checkRagHealth,
} from "../utils/api";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Volume2,
  Languages,
  Plus,
  Trash2,
  Mic,
  X,
  Menu,
  ChevronLeft,
} from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const LOCAL_SESSIONS_KEY = "assistant_local_sessions";
const LOCAL_MESSAGES_KEY = "assistant_current_messages";

const LANGUAGES = [
  { code: "ur", label: "Urdu", dir: "rtl", speechCode: "ur-PK" },
  { code: "pa", label: "Punjabi", dir: "rtl", speechCode: "ur-PK" },
  { code: "en", label: "English", dir: "ltr", speechCode: "en-US" },
];

const getLanguage = (code) => LANGUAGES.find((lang) => lang.code === code) || LANGUAGES[0];

const makeTitle = (messages) => {
  const firstQuestion = messages.find((message) => message.sender === "user")?.text;
  return firstQuestion?.slice(0, 80) || "AgriSense chat";
};

const normalizeMessages = (items = []) =>
  items.map((message, index) => ({
    id: message.id || `${message.createdAt || Date.now()}-${index}`,
    sender: message.sender,
    text: message.text,
    language: message.language || "ur",
    sources: message.sources || [],
    createdAt: message.createdAt || new Date().toISOString(),
  }));

// Chat Message Component
const ChatMessage = ({ message, onSpeak, onTranslate, translating, translation }) => {
  const isUser = message.sender === "user";
  const language = getLanguage(message.language || "en");
  const hasReliableSources = !isUser && message.sources && message.sources.length > 0;
  const displayText = translation || message.text;

  return (
    <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        <View style={styles.messageHeader}>
          {isUser ? (
            <User size={14} color="#10b981" />
          ) : (
            <Bot size={14} color="#10b981" />
          )}
          <Text style={styles.senderName}>{isUser ? "You" : "AgriSense AI"}</Text>
        </View>

        {!isUser && !hasReliableSources && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>💡 General Knowledge (No Source Documents)</Text>
          </View>
        )}

        {!isUser && hasReliableSources && (
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>✅ From OCR Documents</Text>
          </View>
        )}

        <Text style={[styles.messageText, !isUser && hasReliableSources && styles.sourceMessageText]}>
          {displayText}
        </Text>

        {!isUser && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onSpeak({ ...message, text: displayText })}>
              <Volume2 size={14} color="#059669" />
              <Text style={styles.actionButtonText}>Listen</Text>
            </TouchableOpacity>

            {LANGUAGES.filter((lang) => lang.code !== message.language).map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.actionButton}
                onPress={() => onTranslate(message.id, lang.code)}
                disabled={translating === message.id}
              >
                <Languages size={14} color="#6b7280" />
                <Text style={styles.actionButtonText}>
                  {translating === message.id ? "..." : lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isUser && message.sources?.length > 0 && (
          <View style={styles.sourcesContainer}>
            <Text style={styles.sourcesTitle}>📄 Sources:</Text>
            <View style={styles.sourcesList}>
              {message.sources.slice(0, 5).map((source, idx) => (
                <View key={idx} style={styles.sourceItem}>
                  <Text style={styles.sourceItemText}>
                    {source.source} p.{source.page}
                  </Text>
                </View>
              ))}
              {message.sources.length > 5 && (
                <Text style={styles.moreSources}>+{message.sources.length - 5} more</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// Main Assistant Component
export default function AssistantScreen({ AuthModalComponent }) {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [inputLanguage, setInputLanguage] = useState("ur");
  const [inputTargetLanguage, setInputTargetLanguage] = useState("en");
  const [language, setLanguage] = useState("ur");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(null);
  const [inputTranslating, setInputTranslating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [savedSessions, setSavedSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [translations, setTranslations] = useState({});
  const [ragConnected, setRagConnected] = useState(false);
  const [ragChecking, setRagChecking] = useState(true);
  const scrollViewRef = useRef();

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Check deployed RAG API connection (Render may need time to wake up)
  const verifyRagConnection = useCallback(async () => {
    setRagChecking(true);
    try {
      const health = await checkRagHealth();
      setRagConnected(Boolean(health?.index_loaded ?? health?.status === "ok"));
      setError("");
    } catch {
      setRagConnected(false);
    } finally {
      setRagChecking(false);
    }
  }, []);

  useEffect(() => {
    verifyRagConnection();
  }, [verifyRagConnection]);

  useEffect(() => {
    if (ragConnected || ragChecking) return undefined;

    const retryTimer = setInterval(verifyRagConnection, 30000);
    return () => clearInterval(retryTimer);
  }, [ragConnected, ragChecking, verifyRagConnection]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  // Show auth modal after 2 AI replies
  const aiReplyCount = messages.filter((m) => m.sender === "ai").length - 1;
  useEffect(() => {
    if (!user && aiReplyCount >= 2) {
      setShowAuthModal(true);
    }
  }, [aiReplyCount, user]);

  const getWelcomeMessages = () => [
    {
      id: Date.now().toString(),
      sender: "ai",
      text: "السلام علیکم! فصل، کیڑے، بیماری، کھاد یا آبپاشی کے بارے میں سوال پوچھیں۔",
      language: "ur",
      sources: [],
      createdAt: new Date().toISOString(),
    },
  ];

  const loadCachedMessages = async () => {
    try {
      const cachedMessages = await storageService.getItem(LOCAL_MESSAGES_KEY);
      if (!cachedMessages) return false;

      const parsed = JSON.parse(cachedMessages);
      if (!parsed.messages?.length) return false;

      setMessages(normalizeMessages(parsed.messages));
      setSessionId(parsed.sessionId || null);
      setLanguage(parsed.language || "ur");
      setInputLanguage(parsed.language || "ur");
      return true;
    } catch (error) {
      return false;
    }
  };

  const loadLocalSessions = async () => {
    let restoredMessages = false;

    try {
      const cachedSessions = await storageService.getItem(LOCAL_SESSIONS_KEY);
      if (cachedSessions) {
        setSavedSessions(JSON.parse(cachedSessions));
      }

      restoredMessages = await loadCachedMessages();
    } catch (error) {
      console.warn("Failed to load local assistant data:", error.message);
    }

    return restoredMessages;
  };

  const cacheLocalSession = async (nextMessages, activeSessionId = sessionId) => {
    const currentSessionId = activeSessionId || `local-${Date.now()}`;
    const sessionSummary = {
      id: currentSessionId,
      title: makeTitle(nextMessages),
      language,
      updatedAt: new Date().toISOString(),
      messages: nextMessages,
    };

    await storageService.setItem(
      LOCAL_MESSAGES_KEY,
      JSON.stringify({
        sessionId: currentSessionId,
        language,
        messages: nextMessages,
      })
    );

    setSavedSessions((prev) => {
      const others = prev.filter((item) => item.id !== currentSessionId);
      const next = [sessionSummary, ...others];
      storageService.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(next));
      return next;
    });

    if (!sessionId) {
      setSessionId(currentSessionId);
    }

    return currentSessionId;
  };

  const loadUserData = async () => {
    try {
      const savedToken = await storageService.getItem("token");
      const savedUser = await storageService.getItem("user");
      let restoredMessages = false;

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        try {
          const data = await getChatSessions(savedToken);
          const sessions = data.sessions || [];
          setSavedSessions(sessions);
          await storageService.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
          restoredMessages = await loadCachedMessages();
        } catch (error) {
          restoredMessages = await loadLocalSessions();
        }
      } else {
        restoredMessages = await loadLocalSessions();
      }

      if (!restoredMessages) {
        setMessages(getWelcomeMessages());
      }
    } catch (err) {
      console.warn("Failed to load user data:", err.message);
      setMessages(getWelcomeMessages());
    }
  };

  const persistMessages = async (nextMessages) => {
    const activeSessionId = sessionId || `session-${Date.now()}`;

    if (!token) {
      await cacheLocalSession(nextMessages, activeSessionId);
      return;
    }

    try {
      const data = await saveChatSession({
        token,
        sessionId: activeSessionId,
        title: makeTitle(nextMessages),
        language,
        messages: nextMessages,
      });

      if (data.session?.id) {
        setSessionId(data.session.id);
      }

      const sessionsData = await getChatSessions(token);
      const sessions = sessionsData.sessions || [];
      setSavedSessions(sessions);
      await storageService.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
      await storageService.setItem(
        LOCAL_MESSAGES_KEY,
        JSON.stringify({
          sessionId: data.session?.id || activeSessionId,
          language,
          messages: nextMessages,
        })
      );
    } catch (err) {
      console.error("Failed to save chat session:", err);
      await cacheLocalSession(nextMessages, activeSessionId);
    }
  };

  const startNewChat = () => {
    setMessages(getWelcomeMessages());
    setSessionId(null);
    setInput("");
    setLanguage("ur");
    setShowSidebar(false);
    setTranslations({});
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
      language: inputLanguage,
      createdAt: new Date().toISOString(),
    };

    const pendingMessages = [...messages, userMessage];
    setMessages(pendingMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await askRagAssistant({
        question: userMessage.text,
        language: inputLanguage,
        chatHistory: pendingMessages,
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.answer,
        language: response.language || inputLanguage,
        sources: response.sources || [],
        createdAt: new Date().toISOString(),
      };

      const nextMessages = [...pendingMessages, aiMessage];
      setMessages(nextMessages);
      setLanguage(response.language);
      setRagConnected(true);
      setError("");
      await persistMessages(nextMessages);
    } catch (err) {
      setError(err.message || "RAG assistant is unavailable. Please check your connection.");
      setMessages([
        ...pendingMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Sorry, I could not reach the agriculture knowledge base right now. Please check your internet connection and try again.",
          language: "en",
          sources: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateMessage = async (messageId, targetLanguage) => {
    const message = messages.find((item) => item.id === messageId);
    if (!message) return;

    setTranslating(messageId);
    setError("");

    try {
      const result = await translateAssistantText({
        text: message.text,
        language: targetLanguage,
      });

      const key = `${messageId}_${targetLanguage}`;
      setTranslations((prev) => ({ ...prev, [key]: result.text || message.text }));
    } catch (err) {
      setError(err.message || "Translation failed.");
    } finally {
      setTranslating(null);
    }
  };

  const translateInput = async () => {
    if (!input.trim()) return;

    setInputTranslating(true);
    setError("");

    try {
      const result = await translateAssistantText({
        text: input,
        language: inputTargetLanguage,
      });

      if (result.text) {
        setInput(result.text);
        setInputLanguage(inputTargetLanguage);
      }
    } catch (err) {
      setError(err.message || "Translation failed.");
    } finally {
      setInputTranslating(false);
    }
  };

  const speak = async (message) => {
    setError("");
    try {
      const audioBlob = await speakText({
        text: message.text,
        language: message.language,
      });
      await playAudioBlob(audioBlob);
    } catch (err) {
      setError(err.message || "Could not generate audio. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      releaseActiveAudio();
    };
  }, []);

  const loadChatSession = async (session) => {
    try {
      if (session.messages?.length) {
        setMessages(normalizeMessages(session.messages));
        setLanguage(session.language || "ur");
        setInputLanguage(session.language || "ur");
        setSessionId(session.id);
        setShowSidebar(false);
        setTranslations({});
        await storageService.setItem(
          LOCAL_MESSAGES_KEY,
          JSON.stringify({
            sessionId: session.id,
            language: session.language || "ur",
            messages: session.messages,
          })
        );
        return;
      }

      if (!token) return;

      const data = await getChatSession({ token, sessionId: session.id });
      if (data.session?.messages?.length) {
        setMessages(normalizeMessages(data.session.messages));
        setLanguage(data.session.language || "ur");
        setInputLanguage(data.session.language || "ur");
        setSessionId(session.id);
        setShowSidebar(false);
        setTranslations({});
      }
    } catch (err) {
      setError("Could not load that saved chat.");
    }
  };

  const handleDeleteChat = async (sessionIdToDelete) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!token) {
              setSavedSessions((prev) => {
                const remaining = prev.filter((item) => item.id !== sessionIdToDelete);
                storageService.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(remaining));
                return remaining;
              });
              if (sessionId === sessionIdToDelete) {
                startNewChat();
              }
              return;
            }

            try {
              await deleteChatSession({ token, sessionId: sessionIdToDelete });
              const sessionsData = await getChatSessions(token);
              const sessions = sessionsData.sessions || [];
              setSavedSessions(sessions);
              await storageService.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
              if (sessionId === sessionIdToDelete) {
                startNewChat();
              }
            } catch (err) {
              setError(err.message || "Could not delete chat.");
            }
          },
        },
      ]
    );
  };

  const handleAuthSuccess = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setShowAuthModal(false);
    try {
      await saveChatSession({
        token: userToken,
        sessionId,
        title: makeTitle(messages),
        language,
        messages,
      });
      const sessionsData = await getChatSessions(userToken);
      setSavedSessions(sessionsData.sessions || []);
      await storageService.setItem(
        LOCAL_SESSIONS_KEY,
        JSON.stringify(sessionsData.sessions || [])
      );
    } catch (err) {
      setError("Logged in, but chat history could not be saved yet.");
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await storageService.removeItem("token");
            await storageService.removeItem("user");
            setUser(null);
            setToken(null);
            setSavedSessions([]);
            setShowSidebar(false);
          },
        },
      ]
    );
  };

  // Sidebar Component
  const Sidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Saved Chats</Text>
        {!user ? (
          <TouchableOpacity onPress={() => setShowAuthModal(true)}>
            <Text style={styles.loginText}>Login to save</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.userNameText} numberOfLines={1}>
              {user.name}
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView style={styles.sidebarList}>
        {savedSessions.length === 0 && (
          <Text style={styles.noSessionsText}>No saved chats yet.</Text>
        )}
        {savedSessions.map((session) => (
          <View key={session.id} style={styles.sessionItemWrapper}>
            <TouchableOpacity
              style={styles.sessionItem}
              onPress={() => loadChatSession(session)}
            >
              <Text style={styles.sessionTitle} numberOfLines={2}>
                {session.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteSessionButton}
              onPress={() => handleDeleteChat(session.id)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)} style={styles.menuButton}>
            {showSidebar ? (
              <ChevronLeft size={24} color={colors.primaryDark} />
            ) : (
              <Menu size={24} color={colors.primaryDark} />
            )}
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>AgriSense Assistant</Text>
            <TouchableOpacity onPress={verifyRagConnection} disabled={ragChecking}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                {ragChecking
                  ? "Connecting to assistant (server may take up to 1 min)..."
                  : ragConnected
                  ? `Connected · ${RAG_API_BASE_URL.replace(/^https?:\/\//, "")}`
                  : `Tap to retry · ${RAG_API_BASE_URL.replace(/^https?:\/\//, "")}`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerActions}>
            <ThemeToggle size={18} />
            <TouchableOpacity onPress={startNewChat} style={styles.newChatButton}>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContainer}>
        {/* Sidebar */}
        {showSidebar && <Sidebar />}

        {/* Chat Area */}
        <View style={[styles.chatArea, showSidebar && styles.chatAreaWithSidebar]}>
          {/* Messages */}
          <ScrollView
            style={styles.chatContainer}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => {
              const translationKey = `${message.id}_${inputLanguage}`;
              const translation = translations[translationKey];

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onSpeak={speak}
                  onTranslate={handleTranslateMessage}
                  translating={translating}
                  translation={translation}
                />
              );
            })}

            {loading ? (
              <View key="assistant-loading" style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#10b981" />
                <Text style={styles.loadingText}>Searching OCR documents and asking LLM...</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Input Area */}
          <View style={styles.inputArea}>
            {/* Language Controls */}
            <View style={styles.languageControls}>
              <View style={styles.languageRow}>
                <Text style={styles.languageLabel}>Input:</Text>
                <View style={styles.languageChips}>
                  {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[styles.languageChip, inputLanguage === lang.code && styles.languageChipActive]}
                      onPress={() => setInputLanguage(lang.code)}
                    >
                      <Text
                        style={[
                          styles.languageChipText,
                          inputLanguage === lang.code && styles.languageChipTextActive,
                        ]}
                      >
                        {lang.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.languageRow}>
                <Text style={styles.languageLabel}>Translate to:</Text>
                <View style={styles.languageChips}>
                  {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.languageChip,
                        inputTargetLanguage === lang.code && styles.languageChipActive,
                      ]}
                      onPress={() => setInputTargetLanguage(lang.code)}
                    >
                      <Text
                        style={[
                          styles.languageChipText,
                          inputTargetLanguage === lang.code && styles.languageChipTextActive,
                        ]}
                      >
                        {lang.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.translateButton, (!input.trim() || inputTranslating) && styles.translateButtonDisabled]}
                onPress={translateInput}
                disabled={!input.trim() || inputTranslating}
              >
                <Languages size={16} color="#10b981" />
                <Text style={styles.translateButtonText}>
                  {inputTranslating ? "Translating..." : "Translate Input"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Row */}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { textAlign: getLanguage(inputLanguage).dir === "rtl" ? "right" : "left" }]}
                value={input}
                onChangeText={setInput}
                placeholder="اپنا سوال لکھیں... Type your farming question..."
                placeholderTextColor="#9ca3af"
                multiline
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Send size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Features Card */}
      <View style={styles.featuresCard}>
        <View style={styles.feature}>
          <BookOpen size={20} color="#10b981" />
          <Text style={styles.featureText}>OCR Documents</Text>
        </View>
        <View style={styles.feature}>
          <Sparkles size={20} color="#f59e0b" />
          <Text style={styles.featureText}>AI-Powered</Text>
        </View>
        <View style={styles.feature}>
          <Languages size={20} color="#8b5cf6" />
          <Text style={styles.featureText}>Multi-Language</Text>
        </View>
      </View>

      {AuthModalComponent && (
        <AuthModalComponent
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  newChatButton: {
    padding: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#065f46",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  mainContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 280,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderRightColor: "#d1fae5",
  },
  sidebarHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 8,
  },
  loginText: {
    fontSize: 12,
    color: "#10b981",
  },
  userNameText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  logoutText: {
    fontSize: 12,
    color: "#ef4444",
  },
  sidebarList: {
    flex: 1,
  },
  noSessionsText: {
    padding: 16,
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  sessionItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sessionItem: {
    flex: 1,
    padding: 12,
  },
  sessionTitle: {
    fontSize: 13,
    color: "#334155",
  },
  deleteSessionButton: {
    padding: 12,
  },
  chatArea: {
    flex: 1,
  },
  chatAreaWithSidebar: {
    width: 0,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  botWrapper: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#10b981",
  },
  botBubble: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#065f46",
  },
  warningBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  warningText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#d97706",
  },
  sourceBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  sourceText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#059669",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1f2937",
  },
  sourceMessageText: {
    color: "#065f46",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButtonText: {
    fontSize: 11,
    color: "#6b7280",
  },
  sourcesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  sourcesTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 4,
  },
  sourcesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sourceItem: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  sourceItemText: {
    fontSize: 10,
    color: "#374151",
  },
  moreSources: {
    fontSize: 10,
    color: "#6b7280",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginTop: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  errorContainer: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
  },
  inputArea: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#d1fae5",
  },
  languageControls: {
    marginBottom: 12,
    gap: 8,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  languageLabel: {
    fontSize: 12,
    color: "#64748b",
    width: 70,
  },
  languageChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  languageChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  languageChipActive: {
    backgroundColor: "#10b981",
  },
  languageChipText: {
    fontSize: 11,
    color: "#475569",
  },
  languageChipTextActive: {
    color: "white",
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  translateButtonDisabled: {
    opacity: 0.5,
  },
  translateButtonText: {
    fontSize: 12,
    color: "#10b981",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  featuresCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1fae5",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  feature: {
    alignItems: "center",
    flex: 1,
  },
  featureText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },
});