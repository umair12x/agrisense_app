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
import * as ImagePicker from "expo-image-picker";
import storageService from "../services/storageService";
import { APP_API_BASE_URL as API_URL } from "../utils/api";
import { useTheme } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { createCommunityStyles } from "./communityStyles";
import ThemeToggle from "../components/ThemeToggle";
import PostVideo from "../components/PostVideo";
import { Users, MessageCircle, Heart, Share2, X, Send, Image as ImageIcon, XCircle, Trash2, Camera, Video } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");




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
  const styles = useThemedStyles(createCommunityStyles);

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
const LikeButton = ({ liked, count, onPress, loading }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createCommunityStyles);

  return (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    style={[styles.actionButton, liked && styles.actionButtonActive]}
  >
    <Heart size={20} color={liked ? colors.danger : colors.textSecondary} fill={liked ? colors.danger : "none"} />
    {count > 0 && <Text style={[styles.actionButtonText, liked && styles.actionButtonTextActive]}>{count}</Text>}
  </TouchableOpacity>
  );
};

// ─── Share Button ─────────────────────────────────────────────
const ShareButton = ({ onShare }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createCommunityStyles);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = async () => {
    await onShare();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <View style={styles.shareWrapper}>
      <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
        <Share2 size={20} color={colors.textSecondary} />
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
  const { colors } = useTheme();
  const styles = useThemedStyles(createCommunityStyles);
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
                placeholderTextColor={colors.textMuted}
                style={styles.replyInput}
                onSubmitEditing={handleReplySubmit}
              />
              <TouchableOpacity onPress={handleReplySubmit} disabled={!replyText.trim()}>
                <Send size={16} color={replyText.trim() ? colors.primary : colors.textMuted} />
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
  const { colors } = useTheme();
  const styles = useThemedStyles(createCommunityStyles);
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
            <Trash2 size={18} color={colors.danger} />
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
        <View style={styles.postMedia}>
          {localPost.mediaType === "video" ? (
            <PostVideo uri={localPost.mediaUrl} />
          ) : (
            <Image source={{ uri: localPost.mediaUrl }} style={styles.postImage} resizeMode="cover" />
          )}
        </View>
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
          <MessageCircle size={20} color={colors.textSecondary} />
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
                  placeholderTextColor={colors.textMuted}
                  style={styles.commentInput}
                  multiline
                />
                <TouchableOpacity 
                  onPress={handleComment} 
                  disabled={!commentText.trim() || isPosting}
                  style={styles.commentSendButton}
                >
                  {isPosting ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Send size={18} color={commentText.trim() ? colors.primary : colors.textMuted} />
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
  const { colors } = useTheme();
  const styles = useThemedStyles(createCommunityStyles);
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
  const [newPostMediaMime, setNewPostMediaMime] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  const filters = [
    { id: "all", label: "All Posts" },
    { id: "disease", label: "Disease Help" },
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
      const savedToken = await storageService.getItem("token");
      const savedUser = await storageService.getItem("user");
      
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
              await storageService.setItem("cached_posts", JSON.stringify(data.posts));
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
          const cachedPosts = await storageService.getItem("cached_posts");
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

    if (!token || !user) {
      handleAuthRequired();
      return;
    }

    setUploading(true);

    const content = newPostContent.trim();
    let mediaUrl = newPostMedia?.startsWith("http") ? newPostMedia : null;
    let mediaType = mediaUrl ? newPostMediaType : null;

    try {
      if (newPostMedia && !mediaUrl) {
        const isVideo = newPostMediaType === "video";
        const uploadForm = new FormData();
        uploadForm.append(isVideo ? "video" : "image", {
          uri: newPostMedia,
          type: isVideo ? newPostMediaMime || "video/mp4" : newPostMediaMime || "image/jpeg",
          name: isVideo ? `post_${Date.now()}.mp4` : `post_${Date.now()}.jpg`,
        });

        const uploadResponse = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadForm,
        });

        const uploadData = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok || !uploadData.success || !uploadData.url) {
          throw new Error(uploadData.message || `Failed to upload ${isVideo ? "video" : "image"}`);
        }

        mediaUrl = uploadData.url;
        mediaType = isVideo ? "video" : "image";
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          mediaUrl,
          mediaType,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create post");
      }

      setPosts((prev) => [data.post, ...prev]);
      setShowCreateModal(false);
      setNewPostContent("");
      setNewPostMedia(null);
      setNewPostMediaType(null);
      setNewPostMediaMime(null);
      Alert.alert("Success", "Your post has been shared!");
    } catch (error) {
      console.error("Create post error:", error);
      Alert.alert("Error", error.message || "Failed to create post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const setPickedMedia = (asset) => {
    if (!asset?.uri) return;
    const isVideo = asset.type === "video" || asset.mimeType?.startsWith("video/");
    setNewPostMedia(asset.uri);
    setNewPostMediaType(isVideo ? "video" : "image");
    setNewPostMediaMime(asset.mimeType || (isVideo ? "video/mp4" : "image/jpeg"));
  };

  const clearPickedMedia = () => {
    setNewPostMedia(null);
    setNewPostMediaType(null);
    setNewPostMediaMime(null);
  };

  const openCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Allow camera access to take photos for your post.");
        return;
      }

      const response = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!response.canceled && response.assets?.[0]) {
        setPickedMedia(response.assets[0]);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera.");
    }
  };

  const openGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Allow gallery access to choose photos for your post.");
        return;
      }

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        quality: 0.8,
        allowsEditing: false,
        videoMaxDuration: 120,
      });

      if (!response.canceled && response.assets?.[0]) {
        setPickedMedia(response.assets[0]);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const openVideoPicker = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Allow gallery access to choose videos for your post.");
        return;
      }

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        quality: 0.8,
        allowsEditing: false,
        videoMaxDuration: 120,
      });

      if (!response.canceled && response.assets?.[0]) {
        setPickedMedia(response.assets[0]);
      }
    } catch (error) {
      console.error("Video picker error:", error);
      Alert.alert("Error", "Failed to open video gallery.");
    }
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
      storageService.setItem("token", userToken);
      storageService.setItem("user", JSON.stringify(userData));
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading community posts...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Users size={28} color={colors.primary} />
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, { color: colors.text }]}>Farmer Community</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connect, Share & Learn Together</Text>
            </View>
            <ThemeToggle size={20} />
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
        <View style={[styles.modalContainer, { backgroundColor: colors.modalBg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Post</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalUserInfo}>
              <Avatar name={user?.name} src={user?.avatar} size={48} />
              <Text style={[styles.modalUserName, { color: colors.text }]}>{user?.name || "Guest"}</Text>
            </View>
            
            <TextInput
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="What's happening on your farm? Share an update..."
              placeholderTextColor={colors.textMuted}
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
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
                  <PostVideo uri={newPostMedia} />
                ) : (
                  <Image source={{ uri: newPostMedia }} style={styles.modalPreviewImage} />
                )}
                <TouchableOpacity onPress={clearPickedMedia} style={styles.removeMediaButton}>
                  <XCircle size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={openCamera} style={[styles.mediaButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Camera size={20} color={colors.primary} />
                <Text style={[styles.mediaButtonText, { color: colors.text }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openGallery} style={[styles.mediaButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <ImageIcon size={20} color={colors.primary} />
                <Text style={[styles.mediaButtonText, { color: colors.text }]}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openVideoPicker} style={[styles.mediaButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Video size={20} color={colors.primary} />
                <Text style={[styles.mediaButtonText, { color: colors.text }]}>Video</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={uploading || (!newPostContent.trim() && !newPostMedia)}
              style={[styles.submitButton, { backgroundColor: colors.primary }, (uploading || (!newPostContent.trim() && !newPostMedia)) && styles.submitButtonDisabled]}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
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

