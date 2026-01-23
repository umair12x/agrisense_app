// CommunityScreen.jsx
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { Users, MessageCircle, Heart, Share2, Upload, Filter, Calendar } from "lucide-react-native";

export default function CommunityScreen() {
  const [newPost, setNewPost] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Posts" },
    { id: "disease", label: "Disease Help" },
    { id: "soil", label: "Soil Issues" },
    { id: "tips", label: "Farming Tips" },
  ];

  const farmers = [
    { id: 1, name: "Ahmed Khan", location: "Punjab", crops: "Wheat, Rice", posts: 42 },
    { id: 2, name: "Fatima Bibi", location: "Sindh", crops: "Cotton, Sugarcane", posts: 28 },
    { id: 3, name: "Raza Shah", location: "KPK", crops: "Maize, Fruits", posts: 35 },
  ];

  const posts = [
    {
      id: 1,
      farmer: farmers[0],
      content: "My wheat crop showing yellow spots on leaves. Any suggestions?",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7h2ZfTLJCOPaaJ-deNmrKlm0Q0gpYHp1aHg&s",
      time: "2 hours ago",
      likes: 12,
      comments: 8,
      tags: ["disease", "wheat", "urgent"]
    },
    {
      id: 2,
      farmer: farmers[1],
      content: "Successfully increased cotton yield by 30% using drip irrigation. Sharing my setup photos!",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRoGD0JCwUnROv1OoTs60IU2EFUhEGh0penA&s",
      time: "1 day ago",
      likes: 45,
      comments: 22,
      tags: ["tips", "irrigation", "success"]
    },
    {
      id: 3,
      farmer: farmers[2],
      content: "Best organic fertilizer for fruit orchards? Soil pH is 6.2",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvyT08Ri3uaapxlCUAiSD9Y2_qAYwgWFodfg&s",
      time: "3 days ago",
      likes: 18,
      comments: 14,
      tags: ["soil", "fertilizer", "organic"]
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Users size={28} color="#10b981" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Farmer Community</Text>
            <Text style={styles.subtitle}>Connect, Share & Learn Together</Text>
          </View>
        </View>
        <Text style={styles.stats}>📊 248 Farmers Active • 1.2K Posts • 3.5K Comments</Text>
      </View>

      <View style={styles.createPostCard}>
        <Text style={styles.createPostTitle}>Share Your Experience</Text>
        <TextInput
          style={styles.postInput}
          value={newPost}
          onChangeText={setNewPost}
          placeholder="Ask for help, share success stories, or discuss farming challenges..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
        />
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.attachButton}>
            <Upload size={18} color="#64748b" />
            <Text style={styles.attachText}>Add Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postButton} disabled={!newPost.trim()}>
            <Text style={styles.postButtonText}>Post to Community</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <Filter size={18} color="#64748b" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, activeFilter === filter.id && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[styles.filterText, activeFilter === filter.id && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.activeFarmers}>
        <Text style={styles.sectionTitle}>👨‍🌾 Active Farmers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {farmers.map((farmer) => (
            <View key={farmer.id} style={styles.farmerCard}>
              <View style={styles.farmerAvatar}>
                <Text style={styles.farmerInitial}>{farmer.name.charAt(0)}</Text>
              </View>
              <Text style={styles.farmerName}>{farmer.name}</Text>
              <Text style={styles.farmerLocation}>{farmer.location}</Text>
              <Text style={styles.farmerCrops}>{farmer.crops}</Text>
              <View style={styles.farmerStats}>
                <Text style={styles.farmerPosts}>{farmer.posts} posts</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>📝 Recent Discussions</Text>
      {posts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.postFarmerInfo}>
              <View style={styles.farmerAvatarSmall}>
                <Text style={styles.farmerInitialSmall}>{post.farmer.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.postFarmerName}>{post.farmer.name}</Text>
                <View style={styles.postMeta}>
                  <Calendar size={12} color="#94a3b8" />
                  <Text style={styles.postTime}>{post.time}</Text>
                  <Text style={styles.postLocation}>• {post.farmer.location}</Text>
                </View>
              </View>
            </View>
            <View style={styles.postTags}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {post.image && (
            <View style={styles.postImageContainer}>
              <Image source={{ uri: post.image }} style={styles.postImage} />
            </View>
          )}

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postAction}>
              <Heart size={18} color="#ef4444" />
              <Text style={styles.postActionText}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction}>
              <MessageCircle size={18} color="#3b82f6" />
              <Text style={styles.postActionText}>{post.comments} comments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction}>
              <Share2 size={18} color="#10b981" />
              <Text style={styles.postActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.communityInfo}>
        <Text style={styles.infoTitle}>Community Features</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureTitle}>Discussion Forums</Text>
            <Text style={styles.featureDesc}>Topic-based discussions</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Knowledge Sharing</Text>
            <Text style={styles.featureDesc}>Share soil reports & results</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤝</Text>
            <Text style={styles.featureTitle}>Local Cooperation</Text>
            <Text style={styles.featureDesc}>Connect with nearby farmers</Text>
          </View>
        </View>
      </View>

      <Text style={styles.techNote}>
       Real-time Updates
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 24, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  headerText: { flex: 1, marginLeft: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#065f46" },
  subtitle: { fontSize: 14, color: "#475569" },
  stats: { fontSize: 12, color: "#64748b", backgroundColor: "#e2e8f0", padding: 8, borderRadius: 8, marginTop: 8 },
  createPostCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  createPostTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 12 },
  postInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 80,
    marginBottom: 16
  },
  postActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  attachButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  attachText: { fontSize: 14, color: "#64748b" },
  postButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10
  },
  postButtonDisabled: { backgroundColor: "#94a3b8" },
  postButtonText: { color: "white", fontSize: 14, fontWeight: "600" },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12
  },
  filtersScroll: { flex: 1 },
  filterChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  filterChipActive: { backgroundColor: "#10b981" },
  filterText: { fontSize: 13, color: "#64748b" },
  filterTextActive: { color: "white", fontWeight: "600" },
  activeFarmers: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginHorizontal: 20, marginBottom: 12 },
  farmerCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    marginRight: 12,
    width: 140
  },
  farmerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  farmerInitial: { fontSize: 24, fontWeight: "700", color: "#059669" },
  farmerName: { fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4 },
  farmerLocation: { fontSize: 12, color: "#64748b", marginBottom: 2 },
  farmerCrops: { fontSize: 11, color: "#475569", textAlign: "center", marginBottom: 8 },
  farmerStats: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    width: "100%"
  },
  farmerPosts: { fontSize: 11, color: "#64748b", textAlign: "center" },
  postCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  postHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  postFarmerInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  farmerAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  farmerInitialSmall: { fontSize: 18, fontWeight: "600", color: "#059669" },
  postFarmerName: { fontSize: 15, fontWeight: "600", color: "#1e293b", marginBottom: 2 },
  postMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  postTime: { fontSize: 11, color: "#64748b" },
  postLocation: { fontSize: 11, color: "#64748b" },
  postTags: { flexDirection: "row", gap: 6 },
  tag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tagText: { fontSize: 10, color: "#64748b" },
  postContent: { fontSize: 15, color: "#334155", lineHeight: 22, marginBottom: 16 },
  postImageContainer: { marginBottom: 16 },
  postImage: { width: "100%", height: 200, borderRadius: 12 },
  postActions: { flexDirection: "row", gap: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  postAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  postActionText: { fontSize: 14, color: "#64748b" },
  communityInfo: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  infoTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 16 },
  featuresGrid: { flexDirection: "row", justifyContent: "space-between" },
  feature: { alignItems: "center", flex: 1 },
  featureIcon: { fontSize: 32, marginBottom: 8 },
  featureTitle: { fontSize: 14, fontWeight: "600", color: "#1e293b", marginBottom: 4 },
  featureDesc: { fontSize: 11, color: "#64748b", textAlign: "center" },
  techNote: {
    fontSize: 11,
    color: "#64748b",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingTop: 12,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0"
  },
});