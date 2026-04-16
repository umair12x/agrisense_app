// CommunityScreen.jsx - Fixed with better error handling
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Share,
  Keyboard,
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Users, MessageCircle, Heart, Share2, X, Send, Image as ImageIcon, XCircle, Trash2 } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// API Configuration - Use your computer's IP address for physical device testing
// For iOS emulator: http://localhost:5000/api
// For Android emulator: http://10.0.2.2:5000/api
// For physical device: http://YOUR_COMPUTER_IP:5000/api
const API_URL = Platform.select({
  ios: "http://localhost:5000/api",
  android: "http://192.168.0.101:5000/api",
  default: "http://localhost:5000/api",
});


// ─── Time Ago Helper ─────────────────────────────────────────────
const timeAgo = (date) => {
  if (!date) return "";
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

// ─── Avatar Component ─────────────────────────────────────────────
const Avatar = ({ src, name, size = 40, isOnline = false }) => {
  const getInitials = () => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const getColor = () => {
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
    const index = (name?.length || 0) % colors.length;
    return colors[index];
  };

  return (
    <View style={{ position: "relative" }}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: src ? "transparent" : getColor(),
          },
        ]}
      >
        {src ? (
          <Image source={{ uri: src }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} />
        ) : (
          <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{getInitials()}</Text>
        )}
      </View>
      {isOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              right: size * 0.05,
              bottom: size * 0.05,
            },
          ]}
        />
      )}
    </View>
  );
};

// ─── Like Button ─────────────────────────────────────────────
const LikeButton = ({ liked, count, onPress, loading }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    style={[styles.actionButton, liked && styles.actionButtonActive]}
  >
    <Heart size={20} color={liked ? "#ef4444" : "#64748b"} fill={liked ? "#ef4444" : "none"} />
    {count > 0 && <Text style={[styles.actionButtonText, liked && styles.actionButtonTextActive]}>{count}</Text>}
  </TouchableOpacity>
);

// ─── Share Button ─────────────────────────────────────────────
const ShareButton = ({ onShare }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = async () => {
    await onShare();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <View style={styles.shareWrapper}>
      <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
        <Share2 size={20} color="#64748b" />
      </TouchableOpacity>
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Link copied!</Text>
        </View>
      )}
    </View>
  );
};

// ─── Comment Item Component ─────────────────────────────────────────────
const CommentItem = ({ comment, user, onReply, onLike, depth = 0 }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    const newReply = await onReply?.(comment.id, replyText);
    if (newReply) {
      setReplies([...replies, newReply]);
      setReplyText("");
      setShowReply(false);
    }
  };

  return (
    <View style={[styles.commentItem, depth > 0 && styles.commentItemNested]}>
      <Avatar name={comment.user?.name} src={comment.user?.avatar} size={32} />
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUserName}>{comment.user?.name || "Unknown"}</Text>
            <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
          <View style={styles.commentFooter}>
            <TouchableOpacity onPress={() => onLike?.(comment.id)}>
              <Text style={styles.commentLikeText}>❤️ {comment.likes || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowReply(!showReply)}>
              <Text style={styles.commentReplyText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showReply && user && (
          <View style={styles.replyContainer}>
            <Avatar name={user.name} size={28} />
            <View style={styles.replyInputWrapper}>
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write a reply..."
                placeholderTextColor="#94a3b8"
                style={styles.replyInput}
                onSubmitEditing={handleReplySubmit}
              />
              <TouchableOpacity onPress={handleReplySubmit} disabled={!replyText.trim()}>
                <Send size={16} color={replyText.trim() ? "#10b981" : "#94a3b8"} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            user={user}
            onReply={onReply}
            onLike={onLike}
            depth={depth + 1}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Post Card Component ─────────────────────────────────────────────
const PostCard = ({ post, user, token, onPostUpdate, onAuthRequired }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [isOnline, setIsOnline] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setIsOnline(Math.random() > 0.7);
  }, []);

  const liked = user && localPost.likes?.some((l) => l.userId === user.id);
  const comments = localPost.comments || [];
  
  const MAX_CHARS = 280;
  const shouldTruncate = localPost.content?.length > MAX_CHARS;
  const displayContent = isExpanded ? localPost.content : (shouldTruncate ? localPost.content?.slice(0, MAX_CHARS) + "..." : localPost.content);

  const getAuthToken = () => token || null;

  const handleLike = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (isLiking) return;
    
    setIsLiking(true);
    // Optimistic update
    const newLikes = liked
      ? localPost.likes.filter(l => l.userId !== user.id)
      : [...(localPost.likes || []), { userId: user.id }];
    
    setLocalPost(prev => ({
      ...prev,
      likes: newLikes
    }));

    try {
      const res = await fetch(`${API_URL}/posts/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ postId: localPost.id }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onPostUpdate?.(localPost.id, { likes: newLikes });
        }
      }
    } catch (error) {
      console.error("Like error:", error);
      // Revert on error
      setLocalPost(post);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!commentText.trim() || isPosting) return;
    
    setIsPosting(true);
    const tempComment = {
      id: Date.now().toString(),
      text: commentText,
      createdAt: new Date().toISOString(),
      user: { id: user.id, name: user.name, avatar: user.avatar },
      likes: 0,
      replies: [],
    };
    
    // Optimistic update
    setLocalPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), tempComment]
    }));
    setCommentText("");

    try {
      const res = await fetch(`${API_URL}/posts/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ postId: localPost.id, text: commentText }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const updatedComments = [...(localPost.comments || []), data.comment];
          onPostUpdate?.(localPost.id, { comments: updatedComments });
          setLocalPost(prev => ({
            ...prev,
            comments: updatedComments
          }));
        }
      }
    } catch (error) {
      console.error("Comment error:", error);
      setLocalPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== tempComment.id)
      }));
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/posts/${localPost.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getAuthToken()}` },
              });
              
              if (res.ok) {
                const data = await res.json();
                if (data.success) {
                  onPostUpdate?.(localPost.id, null, true);
                }
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete post");
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${localPost.content}\n\nShared from AgriSense AI Community`,
      });
    } catch (error) {
      console.log("Share failed");
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (!user) return null;
    
    try {
      const res = await fetch(`${API_URL}/posts/comment/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ postId: localPost.id, commentId, text: replyText }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const updatedComments = localPost.comments.map(c =>
            c.id === commentId
              ? { ...c, replies: [...(c.replies || []), data.reply] }
              : c
          );
          setLocalPost(prev => ({ ...prev, comments: updatedComments }));
          onPostUpdate?.(localPost.id, { comments: updatedComments });
          return data.reply;
        }
      }
    } catch (error) {
      console.error("Reply error:", error);
    }
    return null;
  };

  const handleCommentLike = async (commentId) => {
    if (!user) return;

    try {
      const res = await fetch(`${API_URL}/posts/comment/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ postId: localPost.id, commentId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const updatedComments = localPost.comments.map(c =>
            c.id === commentId
              ? { ...c, likes: (c.likes || 0) + (data.liked ? 1 : -1) }
              : c
          );
          setLocalPost(prev => ({ ...prev, comments: updatedComments }));
          onPostUpdate?.(localPost.id, { comments: updatedComments });
        }
      }
    } catch (error) {
      console.error("Comment like error:", error);
    }
  };

  const openCommentInput = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setIsCommentsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <Avatar src={localPost.user?.avatar} name={localPost.user?.name} size={48} isOnline={isOnline} />
          <View>
            <View style={styles.postUserNameRow}>
              <Text style={styles.postUserName}>{localPost.user?.name || "Unknown"}</Text>
              {localPost.user?.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.postTime}>{timeAgo(localPost.createdAt)}</Text>
              <Text style={styles.postMetaDot}>•</Text>
              <View style={styles.publicBadge}>
                <Text style={styles.publicText}>Public</Text>
              </View>
            </View>
          </View>
        </View>
        
        {user?.id === localPost.userId && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {localPost.content && (
        <View style={styles.postContent}>
          <Text style={styles.postContentText}>{displayContent}</Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.readMore}>{isExpanded ? "Show less" : "Read more"}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Media */}
      {localPost.mediaUrl && (
        <TouchableOpacity style={styles.postMedia}>
          {localPost.mediaType === "video" ? (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoText}>🎥 Video Content</Text>
            </View>
          ) : (
            <Image source={{ uri: localPost.mediaUrl }} style={styles.postImage} resizeMode="cover" />
          )}
        </TouchableOpacity>
      )}

      {/* Tags */}
      {localPost.tags && localPost.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {localPost.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Engagement Stats */}
      {(localPost.likes?.length > 0 || comments.length > 0) && (
        <View style={styles.engagementStats}>
          {localPost.likes?.length > 0 && (
            <View style={styles.likesInfo}>
              <View style={styles.likeIconContainer}>
                <Text style={styles.likeIcon}>♥</Text>
              </View>
              <Text style={styles.likesCount}>
                {localPost.likes.length.toLocaleString()} like{localPost.likes.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {comments.length > 0 && !isCommentsOpen && (
            <TouchableOpacity onPress={() => setIsCommentsOpen(true)}>
              <Text style={styles.commentsCount}>
                {comments.length.toLocaleString()} comment{comments.length !== 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.postActions}>
        <LikeButton liked={liked} count={localPost.likes?.length || 0} onPress={handleLike} loading={isLiking} />
        
        <TouchableOpacity onPress={openCommentInput} style={styles.actionButton}>
          <MessageCircle size={20} color="#64748b" />
          {comments.length > 0 && <Text style={styles.actionButtonText}>{comments.length}</Text>}
        </TouchableOpacity>
        
        <ShareButton onShare={handleShare} />
      </View>

      {/* Comments Section */}
      {isCommentsOpen && (
        <View style={styles.commentsSection}>
          {comments.length > 0 && (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CommentItem
                  comment={item}
                  user={user}
                  onReply={handleReply}
                  onLike={handleCommentLike}
                />
              )}
              scrollEnabled={false}
            />
          )}
          
          {user ? (
            <View style={styles.commentInputContainer}>
              <Avatar name={user.name} src={user.avatar} size={36} />
              <View style={styles.commentInputWrapper}>
                <TextInput
                  ref={inputRef}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder={comments.length > 0 ? "Write a comment..." : "Be the first to comment..."}
                  placeholderTextColor="#94a3b8"
                  style={styles.commentInput}
                  multiline
                />
                <TouchableOpacity 
                  onPress={handleComment} 
                  disabled={!commentText.trim() || isPosting}
                  style={styles.commentSendButton}
                >
                  {isPosting ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <Send size={18} color={commentText.trim() ? "#10b981" : "#94a3b8"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => onAuthRequired()} style={styles.signInPrompt}>
              <Text style={styles.signInText}>Sign in to join the conversation</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// ─── Main CommunityScreen Component ─────────────────────────────────────────────
export default function CommunityScreen({ AuthModalComponent }) {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newPostMediaType, setNewPostMediaType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  const filters = [
    { id: "all", label: "All Posts" },
    { id: "disease", label: "Disease Help" },
    { id: "soil", label: "Soil Issues" },
    { id: "tips", label: "Farming Tips" },
    { id: "success", label: "Success Stories" },
  ];

  // Load user and token on mount
  useEffect(() => {
    loadUserAndToken();
  }, []);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  const loadUserAndToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      const savedUser = await AsyncStorage.getItem("user");
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      // Silent fallback - AsyncStorage may not be available
      // Continue without user data
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API with 8 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        const response = await fetch(`${API_URL}/posts`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.posts && data.posts.length > 0) {
            setPosts(data.posts);
            setUsingMockData(false);
            // Cache posts silently
            try {
              await AsyncStorage.setItem("cached_posts", JSON.stringify(data.posts));
            } catch (cacheError) {
              // Silent fail
            }
            return;
          }
        }
        // If API returns empty, show empty state
        throw new Error("No posts from API");
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Try cached posts first
        try {
          const cachedPosts = await AsyncStorage.getItem("cached_posts");
          if (cachedPosts) {
            setPosts(JSON.parse(cachedPosts));
            setUsingMockData(true);
            return;
          }
        } catch (cacheError) {
          // Ignore cache errors
        }
        // Show empty state - no mock data
        setPosts([]);
        setUsingMockData(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handlePostUpdate = (postId, updates, isDelete = false) => {
    if (isDelete) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    } else {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostMedia) {
      Alert.alert("Info", "Please add some content to your post");
      return;
    }
    
    setUploading(true);
    
    try {
      // Create a temporary post for optimistic update
      const tempPost = {
        id: Date.now().toString(),
        content: newPostContent,
        mediaUrl: newPostMedia,
        mediaType: newPostMediaType,
        createdAt: new Date().toISOString(),
        user: user || { id: "temp", name: "You", verified: false },
        userId: user?.id || "temp",
        likes: [],
        comments: [],
        tags: [],
      };
      
      setPosts(prev => [tempPost, ...prev]);
      setShowCreateModal(false);
      setNewPostContent("");
      setNewPostMedia(null);
      
      // Try to send to API
      if (token && user) {
        const response = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newPostContent,
            mediaUrl: newPostMedia,
            mediaType: newPostMediaType,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Replace temp post with real one
            setPosts(prev => prev.map(p => p.id === tempPost.id ? data.post : p));
          }
        }
      }
      
      Alert.alert("Success", "Your post has been shared!");
    } catch (error) {
      console.error("Create post error:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const selectMedia = () => {
    Alert.alert(
      "Add Media",
      "Choose an option",
      [
        { text: "Camera", onPress: () => openCamera() },
        { text: "Gallery", onPress: () => openGallery() },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: "photo",
      saveToPhotos: true,
      quality: 0.8,
    };
    
    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setNewPostMedia(response.assets[0].uri);
        setNewPostMediaType("image");
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: "mixed",
      includeBase64: false,
      quality: 0.8,
    };
    
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setNewPostMedia(response.assets[0].uri);
        setNewPostMediaType(response.assets[0].type?.startsWith("video") ? "video" : "image");
      }
    });
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleCreatePostClick = () => {
    if (!user || !token) {
      handleAuthRequired();
    } else {
      setShowCreateModal(true);
    }
  };

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    try {
      AsyncStorage.setItem("token", userToken);
      AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      // Silent fail - continue without storage
    }
    setShowAuthModal(false);
    fetchPosts();
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === "all") return true;
    return post.tags?.includes(activeFilter);
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading community posts...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10b981"]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Users size={28} color="#10b981" />
            <View>
              <Text style={styles.title}>Farmer Community</Text>
              <Text style={styles.subtitle}>Connect, Share & Learn Together</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              📊 {posts.length} Posts • {posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)} Comments
              {usingMockData && " • Demo Mode"}
            </Text>
          </View>
        </View>

        {/* Create Post Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePostClick}>
          <Text style={styles.createButtonText}>+ Share your farming experience</Text>
        </TouchableOpacity>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
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

        {/* Feed */}
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌾</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>Be the first to share your farming journey!</Text>
          </View>
        ) : (
          <View style={styles.feed}>
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                token={token}
                onPostUpdate={handlePostUpdate}
                onAuthRequired={handleAuthRequired}
              />
            ))}
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>AgriSense AI Community • {posts.length} posts</Text>
        </View>
      </ScrollView>

      {/* Create Post Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalUserInfo}>
              <Avatar name={user?.name} src={user?.avatar} size={48} />
              <Text style={styles.modalUserName}>{user?.name || "Guest"}</Text>
            </View>
            
            <TextInput
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="What's happening on your farm? Share an update..."
              placeholderTextColor="#94a3b8"
              style={styles.modalInput}
              multiline
              maxLength={500}
            />
            
            <View style={styles.charCounter}>
              <View style={[styles.charDot, newPostContent.length > 450 && styles.charDotWarning]} />
              <Text style={[styles.charText, newPostContent.length > 500 && styles.charTextWarning]}>
                {newPostContent.length}/500
              </Text>
            </View>
            
            {newPostMedia && (
              <View style={styles.modalMediaPreview}>
                {newPostMediaType === "video" ? (
                  <View style={styles.videoPreview}>
                    <Text style={styles.videoPreviewText}>🎥 Video Ready</Text>
                  </View>
                ) : (
                  <Image source={{ uri: newPostMedia }} style={styles.modalPreviewImage} />
                )}
                <TouchableOpacity onPress={() => setNewPostMedia(null)} style={styles.removeMediaButton}>
                  <XCircle size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={selectMedia} style={styles.mediaButton}>
                <ImageIcon size={20} color="#10b981" />
                <Text style={styles.mediaButtonText}>Add Image/Video</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={uploading || (!newPostContent.trim() && !newPostMedia)}
              style={[styles.submitButton, (uploading || (!newPostContent.trim() && !newPostMedia)) && styles.submitButtonDisabled]}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Post to Community</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Auth Modal */}
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
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#065f46",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
  },
  statsRow: {
    marginTop: 8,
  },
  statsText: {
    fontSize: 12,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  createButton: {
    backgroundColor: "#10b981",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  createButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: "#10b981",
  },
  filterText: {
    fontSize: 14,
    color: "#64748b",
  },
  filterTextActive: {
    color: "white",
    fontWeight: "600",
  },
  feed: {
    paddingHorizontal: 16,
    gap: 20,
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  postUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  postUserNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  verifiedBadge: {
    backgroundColor: "#3b82f6",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  postTime: {
    fontSize: 12,
    color: "#64748b",
  },
  postMetaDot: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  publicBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  publicText: {
    fontSize: 10,
    color: "#065f46",
  },
  deleteButton: {
    padding: 8,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postContentText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  readMore: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
    marginTop: 8,
  },
  postMedia: {
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 280,
    backgroundColor: "#f1f5f9",
  },
  videoPlaceholder: {
    width: "100%",
    height: 280,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  videoText: {
    color: "white",
    fontSize: 18,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: "#64748b",
  },
  engagementStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  likesInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likeIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  likeIcon: {
    color: "white",
    fontSize: 10,
  },
  likesCount: {
    fontSize: 13,
    color: "#64748b",
  },
  commentsCount: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "500",
  },
  postActions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    flex: 1,
    justifyContent: "center",
  },
  actionButtonActive: {
    backgroundColor: "#fef2f2",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#64748b",
  },
  actionButtonTextActive: {
    color: "#ef4444",
  },
  shareWrapper: {
    flex: 1,
    position: "relative",
  },
  tooltip: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  tooltipText: {
    color: "white",
    fontSize: 12,
  },
  commentsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#fafbfc",
  },
  commentItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  commentItemNested: {
    marginLeft: 44,
    marginTop: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  commentTime: {
    fontSize: 10,
    color: "#94a3b8",
  },
  commentText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  commentLikeText: {
    fontSize: 11,
    color: "#64748b",
  },
  commentReplyText: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "600",
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  replyInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  replyInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1e293b",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  commentInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1e293b",
    maxHeight: 100,
  },
  commentSendButton: {
    padding: 8,
  },
  signInPrompt: {
    alignItems: "center",
    paddingVertical: 16,
  },
  signInText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "600",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "white",
    fontWeight: "700",
  },
  onlineDot: {
    position: "absolute",
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "white",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  modalInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#1e293b",
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  charCounter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 16,
  },
  charDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  charDotWarning: {
    backgroundColor: "#ef4444",
  },
  charText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  charTextWarning: {
    color: "#ef4444",
  },
  modalMediaPreview: {
    position: "relative",
    marginBottom: 20,
  },
  modalPreviewImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  videoPreview: {
    width: "100%",
    height: 200,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPreviewText: {
    color: "white",
    fontSize: 16,
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "white",
    borderRadius: 20,
  },
  modalActions: {
    flexDirection: "row",
    marginBottom: 24,
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  mediaButtonText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});