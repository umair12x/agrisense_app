// AssistantScreen.jsx
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Send, Bot, User, Sparkles, BookOpen, Search, Clock } from "lucide-react-native";

export default function AssistantScreen() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Agriculture Assistant. Ask me anything about fertilizers, pesticides, crop diseases, or farming techniques.", isBot: true, time: "Just now" },
  ]);
  const scrollViewRef = useRef();

  const sampleQuestions = [
    "What fertilizer is best for low nitrogen soil?",
    "How to prevent early blight in tomatoes?",
    "Best pesticides for rice crops",
    "Soil pH requirements for wheat",
    "Watering schedule for pepper plants",
  ];

  const handleSend = () => {
    if (!query.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: query,
      isBot: false,
      time: "Just now"
    };

    // Simulate AI response
    const botResponse = {
      id: messages.length + 2,
      text: `Based on your query about "${query}", here's what I recommend from our agricultural knowledge base...`,
      isBot: true,
      time: "Just now"
    };

    setMessages([...messages, userMessage, botResponse]);
    setQuery("");
  };

  const handleQuickQuestion = (question) => {
    setQuery(question);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Bot size={28} color="#10b981" />
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Agriculture Assistant</Text>
            <Text style={styles.subtitle}>RAG-based system with LangChain & Vector DB</Text>
          </View>
          {/* <Sparkles size={24} color="#f59e0b" /> */}
        </View>
        <View style={styles.techBadge}>
          <Text style={styles.techText}>Powered by: OpenAI API • FAISS Vector DB • Agricultural Knowledge Base</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.chatContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageBubble, msg.isBot ? styles.botBubble : styles.userBubble]}>
            <View style={styles.messageHeader}>
              {msg.isBot ? (
                <Bot size={16} color="#10b981" />
              ) : (
                <User size={16} color="rgb(0, 99, 247)" />
              )}
              <Text style={styles.sender}>
                {msg.isBot ? "AgriSense AI" : "You"}
              </Text>
              <Clock size={12} color="#94a3b8" />
              <Text style={styles.time}>{msg.time}</Text>
            </View>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.quickQuestions}>
        <View style={styles.questionsHeader}>
          <Search size={16} color="#64748b" />
          <Text style={styles.questionsTitle}>Try these questions:</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sampleQuestions.map((q, index) => (
            <TouchableOpacity key={index} style={styles.questionChip} onPress={() => handleQuickQuestion(q)}>
              <Text style={styles.questionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Ask about fertilizers, diseases, pesticides, crop care..."
          placeholderTextColor="#94a3b8"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!query.trim()}>
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.featuresCard}>
        <View style={styles.feature}>
          <BookOpen size={20} color="#10b981" />
          <Text style={styles.featureText}>Accesses agricultural documents</Text>
        </View>
        <View style={styles.feature}>
          <Sparkles size={20} color="#f59e0b" />
          <Text style={styles.featureText}>Provides context-rich responses</Text>
        </View>
        <View style={styles.feature}>
          <Bot size={20} color="#8b5cf6" />
          <Text style={styles.featureText}>Instant expert-level guidance</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  headerText: { flex: 1, marginLeft: 12 },
  title: { fontSize: 24, fontWeight: "800", color: "#065f46" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  techBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  techText: { fontSize: 11, color: "#475569" },
  chatContainer: { flex: 1, paddingHorizontal: 16 },
  messageBubble: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "85%",
  },
  botBubble: {
    backgroundColor: "#d1fae5",
    alignSelf: "flex-start",
    borderWidth: 1, 
   borderColor: "#a7f3d0"
  },
  userBubble: {
    backgroundColor: "rgba(117, 172, 255, 0.67)",
    borderColor: "rgb(117, 172, 255)",
    alignSelf: "flex-end",
    borderWidth: 1, 

  },
  messageHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sender: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginLeft: 6, 
    marginRight: 8,
    color: "#1e293b"
  },
  time: { fontSize: 11, color: "#64748b", marginLeft: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  botBubbleText: { color: "#065f46" },
  userBubbleText: { color: "white" },
  quickQuestions: { paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  questionsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  questionsTitle: { fontSize: 14, fontWeight: "600", color: "#475569", marginLeft: 6 },
  questionChip: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8
  },
  questionText: { fontSize: 13, color: "#475569" },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0"
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 12
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center"
  },
  featuresCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  feature: { alignItems: "center", flex: 1 },
  featureText: { fontSize: 11, color: "#64748b", marginTop: 6, textAlign: "center" }
});