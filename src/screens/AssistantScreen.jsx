// AssistantScreen.jsx - Complete Rebuild with All Features
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { playAudioBlob, releaseActiveAudio, stopActiveAudio } from "../utils/playAudio";
import storageService from "../services/storageService";
import { useAuth } from "../context/AuthContext";
import {
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
  Square,
  Languages,
  Plus,
  Trash2,
  Menu,
  ChevronLeft,
} from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { createAssistantStyles } from "./assistantStyles";
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
const ChatMessage = ({
  message,
  onSpeak,
  onStopSpeak,
  speakingId,
  onTranslate,
  translating,
  translation,
  activeTranslationLang,
  styles,
  colors,
}) => {
  const isUser = message.sender === "user";
  const hasReliableSources = !isUser && message.sources && message.sources.length > 0;
  const isShowingTranslation = Boolean(activeTranslationLang && translation);
  const displayText = isShowingTranslation ? translation : message.text;

  return (
    <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
      {!isUser && (
        <View style={styles.avatarCircle}>
          <Bot size={18} color={colors.primary} />
        </View>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        <View style={styles.messageMeta}>
          <Text style={[styles.senderLabel, isUser && styles.senderLabelUser]}>
            {isUser ? "You" : "AgriSense AI"}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>

        {!isUser && !hasReliableSources && (
          <View style={styles.metaBadgeWarning}>
            <Text style={styles.metaBadgeWarningText}>General Knowledge</Text>
          </View>
        )}

        {!isUser && hasReliableSources && (
          <View style={styles.metaBadgeSource}>
            <BookOpen size={10} color={colors.primaryDark} />
            <Text style={styles.metaBadgeSourceText}>Document Verified</Text>
          </View>
        )}

        <Text
          style={[
            styles.messageText,
            isUser && styles.messageTextUser,
            !isUser && hasReliableSources && styles.messageTextSource,
          ]}
        >
          {displayText}
        </Text>

        {!isUser && (
          <View style={styles.actionRow}>
            <Text style={styles.actionRowLabel}>Translate reply</Text>
            <View style={styles.actionPillRow}>
              {speakingId === message.id ? (
                <TouchableOpacity style={[styles.actionPill, styles.actionPillActive]} onPress={onStopSpeak}>
                  <Square size={12} color={colors.primaryDark} fill={colors.primaryDark} />
                  <Text style={[styles.actionPillText, styles.actionPillTextActive]}>Stop</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.actionPill}
                  onPress={() => onSpeak({ ...message, text: displayText })}
                >
                  <Volume2 size={13} color={colors.primary} />
                  <Text style={styles.actionPillText}>Listen</Text>
                </TouchableOpacity>
              )}

              {LANGUAGES.filter((lang) => lang.code !== message.language).map((lang) => {
                const isActive = activeTranslationLang === lang.code;
                const isLoadingThis = translating === message.id;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.actionPill, isActive && styles.actionPillActive]}
                    onPress={() => onTranslate(message.id, lang.code)}
                    disabled={isLoadingThis}
                  >
                    <Languages
                      size={13}
                      color={isActive ? colors.primaryDark : colors.textSecondary}
                    />
                    <Text style={[styles.actionPillText, isActive && styles.actionPillTextActive]}>
                      {isLoadingThis && !isActive
                        ? "..."
                        : isActive
                        ? `${lang.label} ✓`
                        : lang.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {isShowingTranslation && (
              <TouchableOpacity
                style={styles.showOriginalPill}
                onPress={() => onTranslate(message.id, activeTranslationLang)}
              >
                <Text style={styles.showOriginalText}>Show original</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isUser && message.sources?.length > 0 && (
          <View style={styles.sourcesPanel}>
            <Text style={styles.sourcesPanelTitle}>Sources</Text>
            <View style={styles.sourcesGrid}>
              {message.sources.slice(0, 4).map((source, idx) => (
                <View key={idx} style={styles.sourceChip}>
                  <Text style={styles.sourceChipText} numberOfLines={1}>
                    {source.source}
                  </Text>
                  <Text style={styles.sourceChipPage}>p.{source.page}</Text>
                </View>
              ))}
              {message.sources.length > 4 && (
                <View style={styles.sourceChipMore}>
                  <Text style={styles.sourceChipMoreText}>+{message.sources.length - 4}</Text>
                </View>
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
  const styles = useThemedStyles(createAssistantStyles);
  const insets = useSafeAreaInsets();
  const { user, token, login, logout, isHydrated } = useAuth();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
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
  const [error, setError] = useState("");
  const [speakingId, setSpeakingId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [responseTranslations, setResponseTranslations] = useState({});
  const [activeResponseLang, setActiveResponseLang] = useState({});
  const [showInputTools, setShowInputTools] = useState(true);
  const [ragConnected, setRagConnected] = useState(false);
  const [ragChecking, setRagChecking] = useState(true);
  const scrollViewRef = useRef();

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
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = () => {
      setKeyboardVisible(true);
      setShowInputTools(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
    };
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (ragConnected || ragChecking) return undefined;

    const retryTimer = setInterval(verifyRagConnection, 30000);
    return () => clearInterval(retryTimer);
  }, [ragConnected, ragChecking, verifyRagConnection]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const aiReplyCount = messages.filter((m) => m.sender === "ai" && !m.isError).length - 1;
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

  const loadAssistantData = useCallback(async () => {
    try {
      let restoredMessages = false;

      if (token) {
        try {
          const data = await getChatSessions(token);
          const sessions = data.sessions || [];
          setSavedSessions(sessions);
          await storageService.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
          restoredMessages = await loadCachedMessages();
        } catch {
          restoredMessages = await loadLocalSessions();
        }
      } else {
        restoredMessages = await loadLocalSessions();
      }

      if (!restoredMessages) {
        setMessages(getWelcomeMessages());
      }
    } catch (err) {
      console.warn("Failed to load assistant data:", err.message);
      setMessages(getWelcomeMessages());
    }
  }, [token]);

  useEffect(() => {
    if (!isHydrated) return;
    loadAssistantData();
  }, [isHydrated, loadAssistantData]);

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
    setResponseTranslations({});
    setActiveResponseLang({});
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
          isError: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateMessage = async (messageId, targetLanguage) => {
    const message = messages.find((item) => item.id === messageId);
    if (!message || message.sender !== "ai") return;

    const cacheKey = `${messageId}_${targetLanguage}`;

    if (activeResponseLang[messageId] === targetLanguage) {
      setActiveResponseLang((prev) => ({ ...prev, [messageId]: null }));
      return;
    }

    if (responseTranslations[cacheKey]) {
      setActiveResponseLang((prev) => ({ ...prev, [messageId]: targetLanguage }));
      return;
    }

    setTranslating(messageId);
    setError("");

    try {
      const result = await translateAssistantText({
        text: message.text,
        language: targetLanguage,
      });

      setResponseTranslations((prev) => ({
        ...prev,
        [cacheKey]: result.text || message.text,
      }));
      setActiveResponseLang((prev) => ({ ...prev, [messageId]: targetLanguage }));
    } catch (err) {
      setError(err.message || "Could not translate this reply.");
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
    setSpeakingId(message.id);
    try {
      const audioBlob = await speakText({
        text: message.text,
        language: message.language,
      });
      await playAudioBlob(audioBlob, "mp3", {
        onPlaybackEnd: () => setSpeakingId(null),
      });
    } catch (err) {
      setSpeakingId(null);
      setError(err.message || "Could not generate audio. Please try again.");
    }
  };

  const stopSpeaking = () => {
    stopActiveAudio();
    setSpeakingId(null);
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
        setResponseTranslations({});
        setActiveResponseLang({});
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
        setResponseTranslations({});
        setActiveResponseLang({});
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
    await login(userData, userToken);
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
            await logout();
            setSavedSessions([]);
            setShowSidebar(false);
            startNewChat();
          },
        },
      ]
    );
  };

  // Sidebar Component
  const Sidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <View style={styles.sidebarBrand}>
          <Text style={styles.sidebarTitle}>Chat History</Text>
          <TouchableOpacity onPress={() => setShowSidebar(false)} style={styles.sidebarClose}>
            <ChevronLeft size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {!user ? (
          <TouchableOpacity style={styles.sidebarAuthPill} onPress={() => setShowAuthModal(true)}>
            <Text style={styles.sidebarAuthText}>Login to save history</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sidebarUserRow}>
            <Text style={styles.userNameText} numberOfLines={1}>
              {user.name}
            </Text>
            <TouchableOpacity style={styles.logoutPill} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.sidebarList} showsVerticalScrollIndicator={false}>
        {savedSessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💬</Text>
            <Text style={styles.noSessionsText}>No saved chats yet.</Text>
            <Text style={styles.emptyStateSub}>Start a conversation to see it here.</Text>
          </View>
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
              <Text style={styles.sessionDate}>
                {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteSessionButton}
              onPress={() => handleDeleteChat(session.id)}
            >
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const tabBarOffset = 72 + insets.bottom;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)} style={styles.menuButton} hitSlop={12}>
            {showSidebar ? (
              <ChevronLeft size={22} color={colors.text} />
            ) : (
              <Menu size={22} color={colors.text} />
            )}
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.brandRow}>
              <View style={styles.brandIconCircle}>
                <Sparkles size={16} color={colors.onPrimary} />
              </View>
              <Text style={styles.title}>AgriSense</Text>
            </View>
            <TouchableOpacity onPress={verifyRagConnection} disabled={ragChecking} style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  ragChecking
                    ? styles.statusDotChecking
                    : ragConnected
                    ? styles.statusDotOnline
                    : styles.statusDotOffline,
                ]}
              />
              <Text style={styles.statusText}>
                {ragChecking
                  ? "Waking up..."
                  : ragConnected
                  ? "Assistant Online"
                  : "Offline — Tap to retry"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={startNewChat} style={styles.iconButton} hitSlop={8}>
              <Plus size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContainer}>
        {/* Sidebar Overlay */}
        {showSidebar && (
          <>
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={() => setShowSidebar(false)}
            />
            <Sidebar />
          </>
        )}

        {/* Chat Area */}
        <KeyboardAvoidingView
          style={styles.chatArea}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={tabBarOffset}
        >
          <ScrollView
            style={styles.chatContainer}
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => {
              const activeLang = activeResponseLang[message.id];
              const translation =
                activeLang && message.sender === "ai"
                  ? responseTranslations[`${message.id}_${activeLang}`]
                  : null;

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onSpeak={speak}
                  onStopSpeak={stopSpeaking}
                  speakingId={speakingId}
                  onTranslate={handleTranslateMessage}
                  translating={translating}
                  translation={translation}
                  activeTranslationLang={activeLang}
                  styles={styles}
                  colors={colors}
                />
              );
            })}

            {loading ? (
              <View key="assistant-loading" style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Input Area — compose first, language tools below */}
          <View style={styles.inputSurface}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { textAlign: getLanguage(inputLanguage).dir === "rtl" ? "right" : "left" }]}
                value={input}
                onChangeText={setInput}
                placeholder="اپنا سوال لکھیں... Type your farming question..."
                placeholderTextColor={colors.textMuted}
                multiline
                editable={!loading && !inputTranslating}
                onFocus={() => setShowInputTools(true)}
              />

              <TouchableOpacity
                style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Send size={20} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.inputToolsToggle}
              onPress={() => setShowInputTools((v) => !v)}
              activeOpacity={0.7}
            >
              <Languages size={14} color={colors.primary} />
              <Text style={styles.inputToolsToggleText}>
                {showInputTools ? "Hide" : "Show"} message language & draft translation
              </Text>
            </TouchableOpacity>

            {showInputTools && (
              <View style={styles.inputToolsPanel}>
                <Text style={styles.inputToolsHint}>
                  These options only change what you type — use buttons on each AI reply to translate answers.
                </Text>

                <View style={styles.inputToolBlock}>
                  <Text style={styles.langLabel}>Writing language</Text>
                  <View style={styles.langOptions}>
                    {LANGUAGES.map((lang) => (
                      <TouchableOpacity
                        key={`write-${lang.code}`}
                        style={[styles.langOption, inputLanguage === lang.code && styles.langOptionActive]}
                        onPress={() => setInputLanguage(lang.code)}
                      >
                        <Text
                          style={[
                            styles.langOptionText,
                            inputLanguage === lang.code && styles.langOptionTextActive,
                          ]}
                        >
                          {lang.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputToolBlock}>
                  <Text style={styles.langLabel}>Translate my draft to</Text>
                  <View style={styles.langOptions}>
                    {LANGUAGES.map((lang) => (
                      <TouchableOpacity
                        key={`draft-${lang.code}`}
                        style={[
                          styles.langOption,
                          inputTargetLanguage === lang.code && styles.langOptionActive,
                        ]}
                        onPress={() => setInputTargetLanguage(lang.code)}
                      >
                        <Text
                          style={[
                            styles.langOptionText,
                            inputTargetLanguage === lang.code && styles.langOptionTextActive,
                          ]}
                        >
                          {lang.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.translateDraftButton,
                      (!input.trim() || inputTranslating) && styles.translateDraftButtonDisabled,
                    ]}
                    onPress={translateInput}
                    disabled={!input.trim() || inputTranslating}
                  >
                    {inputTranslating ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                      <>
                        <Languages size={14} color={colors.onPrimary} />
                        <Text style={styles.translateDraftButtonText}>
                          Translate draft to {getLanguage(inputTargetLanguage).label}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {!keyboardVisible && (
            <View style={styles.trustBar}>
              <View style={styles.trustItem}>
                <View style={styles.trustIconBg}>
                  <BookOpen size={18} color={colors.primary} />
                </View>
                <Text style={styles.trustText}>OCR Docs</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <View style={styles.trustIconBg}>
                  <Sparkles size={18} color={colors.warning} />
                </View>
                <Text style={styles.trustText}>AI Powered</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <View style={styles.trustIconBg}>
                  <Languages size={18} color={colors.accent} />
                </View>
                <Text style={styles.trustText}>Multi-Language</Text>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>

      {AuthModalComponent && (
        <AuthModalComponent
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </View>
  );
}