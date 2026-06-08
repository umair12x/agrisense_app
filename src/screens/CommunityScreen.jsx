import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Share,
  LayoutAnimation,
  UIManager,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import storageService from "../services/storageService";
import { useAuth } from "../context/AuthContext";
import { appApiFetch, fetchCommunityPosts, getResolvedAppApiBaseUrl } from "../utils/appApi";
import { useTheme } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { createCommunityStyles } from "./communityStyles";
import PostVideo from "../components/PostVideo";
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  X,
  Send,
  Image as ImageIcon,
  XCircle,
  Trash2,
  Camera,
  Video,
  TrendingUp,
  Leaf,
  CheckCircle2,
  ArrowUp,
  Search,
  Plus,
} from "lucide-react-native";
import ScreenHero from "../components/ScreenHero";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

const POST_TAG_OPTIONS = [
  { id: "disease", label: "Disease Help" },
  { id: "tips", label: "Farming Tips" },
  { id: "success", label: "Success Story" },
];

const inferTagsFromContent = (content) => {
  const lower = (content || "").toLowerCase();
  const tags = new Set();
  if (/\b(disease|pest|blight|virus|fungus|infection|symptom|bug|worm)\b/.test(lower)) {
    tags.add("disease");
  }
  if (/\b(tip|advice|how to|fertiliz|irrigation|planting|spray|seed|crop)\b/.test(lower)) {
    tags.add("tips");
  }
  if (/\b(success|harvest|yield|profit|improved|record)\b/.test(lower)) {
    tags.add("success");
  }
  return [...tags];
};

// ─── Avatar Gradient Helper ─────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

const getAvatarColor = (seed) => {
  const index = (seed?.length || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

// ─── Avatar Component ─────────────────────────────────────────────
const Avatar = ({ src, name, size = 40 }) => {
  const styles = useThemedStyles(createCommunityStyles);
  const color = getAvatarColor(name);

  return (
    <View style={{ position: "relative" }}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: src ? "transparent" : color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 4,
          },
        ]}
      >
        {src ? (
          <Image
            source={{ uri: src }}
            style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>{getInitials(name)}</Text>
        )}
      </View>
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
      activeOpacity={0.7}
    >
      <Heart
        size={20}
        color={liked ? colors.danger : colors.textSecondary}
        fill={liked ? colors.danger : "none"}
        strokeWidth={liked ? 2.5 : 2}
      />
      {count > 0 && (
        <Text style={[styles.actionButtonText, liked && styles.actionButtonTextActive]}>
          {count}
        </Text>
      )}
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
      <TouchableOpacity onPress={handleShare} style={styles.actionButton} activeOpacity={0.7}>
        <Share2 size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Shared!</Text>
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
            <TouchableOpacity onPress={() => onLike?.(comment.id)} hitSlop={8}>
              <Text style={styles.commentLikeText}>❤️ {comment.likes || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowReply(!showReply)} hitSlop={8}>
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
                <Send
                  size={16}
                  color={replyText.trim() ? colors.primary : colors.textMuted}
                />
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
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const liked = user && localPost.likes?.some((l) => l.userId === user.id);
  const comments = localPost.comments || [];

  const MAX_CHARS = 280;
  const shouldTruncate = localPost.content?.length > MAX_CHARS;
  const displayContent = isExpanded
    ? localPost.content
    : shouldTruncate
    ? localPost.content?.slice(0, MAX_CHARS) + "..."
    : localPost.content;

  const getAuthToken = () => token || null;

  const handleLike = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    const previousLikes = localPost.likes || [];
    const newLikes = liked
      ? previousLikes.filter((l) => l.userId !== user.id)
      : [...previousLikes, { userId: user.id }];

    setLocalPost((prev) => ({ ...prev, likes: newLikes }));

    try {
      const res = await appApiFetch("/posts/like", {
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
      setLocalPost((prev) => ({ ...prev, likes: previousLikes }));
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
    const commentBody = commentText.trim();
    const tempComment = {
      id: Date.now().toString(),
      text: commentBody,
      createdAt: new Date().toISOString(),
      user: { id: user.id, name: user.name, avatar: user.avatar },
      likes: 0,
      replies: [],
    };

    setLocalPost((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), tempComment],
    }));
    setCommentText("");

    try {
      const res = await appApiFetch("/posts/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ postId: localPost.id, text: commentBody }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLocalPost((prev) => {
            const withoutTemp = (prev.comments || []).filter((c) => c.id !== tempComment.id);
            const updatedComments = [...withoutTemp, data.comment];
            onPostUpdate?.(localPost.id, { comments: updatedComments });
            return { ...prev, comments: updatedComments };
          });
        }
      }
    } catch (error) {
      console.error("Comment error:", error);
      setLocalPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== tempComment.id),
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
              const res = await appApiFetch(`/posts/${localPost.id}`, {
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
      const res = await appApiFetch("/posts/comment/reply", {
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
          const updatedComments = localPost.comments.map((c) =>
            c.id === commentId
              ? { ...c, replies: [...(c.replies || []), data.reply] }
              : c
          );
          setLocalPost((prev) => ({ ...prev, comments: updatedComments }));
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
      const res = await appApiFetch("/posts/comment/like", {
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
          const updatedComments = localPost.comments.map((c) =>
            c.id === commentId
              ? { ...c, likes: (c.likes || 0) + (data.liked ? 1 : -1) }
              : c
          );
          setLocalPost((prev) => ({ ...prev, comments: updatedComments }));
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

  const toggleComments = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCommentsOpen(!isCommentsOpen);
  };

  const isTrending = (localPost.likes?.length || 0) > 5;

  return (
    <View style={styles.postCard}>
      {isTrending && (
        <View style={styles.trendingBadge}>
          <TrendingUp size={12} color={colors.onPrimary} />
          <Text style={styles.trendingText}>Trending</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <Avatar src={localPost.user?.avatar} name={localPost.user?.name} size={48} />
          <View style={styles.postUserMeta}>
            <View style={styles.postUserNameRow}>
              <Text style={styles.postUserName}>{localPost.user?.name || "Unknown"}</Text>
              {localPost.user?.verified && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 size={12} color={colors.onPrimary} />
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
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton} hitSlop={12}>
            <Trash2 size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {localPost.content && (
        <View style={styles.postContent}>
          <Text style={styles.postContentText}>{displayContent}</Text>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} hitSlop={8}>
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
                <Heart size={10} color={colors.onPrimary} fill={colors.onPrimary} />
              </View>
              <Text style={styles.likesCount}>
                {localPost.likes.length.toLocaleString()} like{localPost.likes.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {comments.length > 0 && !isCommentsOpen && (
            <TouchableOpacity onPress={toggleComments}>
              <Text style={styles.commentsCount}>
                {comments.length.toLocaleString()} comment{comments.length !== 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.postActions}>
        <LikeButton
          liked={liked}
          count={localPost.likes?.length || 0}
          onPress={handleLike}
          loading={isLiking}
        />

        <TouchableOpacity
          onPress={openCommentInput}
          style={[styles.actionButton, isCommentsOpen && styles.actionButtonActiveComment]}
          activeOpacity={0.7}
        >
          <MessageCircle size={20} color={isCommentsOpen ? colors.primary : colors.textSecondary} />
          {comments.length > 0 && (
            <Text style={[styles.actionButtonText, isCommentsOpen && styles.actionButtonTextActiveComment]}>
              {comments.length}
            </Text>
          )}
        </TouchableOpacity>

        <ShareButton onShare={handleShare} />
      </View>

      {/* Comments Section */}
      {isCommentsOpen && (
        <View style={styles.commentsSection}>
          {comments.length > 0 &&
            comments.map((item) => (
              <CommentItem
                key={item.id}
                comment={item}
                user={user}
                onReply={handleReply}
                onLike={handleCommentLike}
              />
            ))}

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
                    <Send
                      size={18}
                      color={commentText.trim() ? colors.primary : colors.textMuted}
                    />
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
  const { user, token, login } = useAuth();
  const [posts, setPosts] = useState([]);
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
  const [authStartInSignup, setAuthStartInSignup] = useState(false);
  const [showingCachedPosts, setShowingCachedPosts] = useState(false);
  const [newPostTags, setNewPostTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedError, setFeedError] = useState("");
  const scrollRef = useRef(null);

  const filters = [
    { id: "all", label: "All Posts", icon: Leaf },
    { id: "disease", label: "Disease Help", icon: Search },
    { id: "tips", label: "Farming Tips", icon: CheckCircle2 },
    { id: "success", label: "Success Stories", icon: TrendingUp },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setFeedError("");
    try {
      setLoading(true);
      const { posts: loadedPosts } = await fetchCommunityPosts();
      setPosts(loadedPosts);
      setShowingCachedPosts(false);
      setFeedError("");
      try {
        await storageService.setItem("cached_posts", JSON.stringify(loadedPosts));
      } catch (cacheError) {
        // Silent fail
      }
    } catch (error) {
      console.warn("Community feed error:", error.message);
      try {
        const cachedPosts = await storageService.getItem("cached_posts");
        if (cachedPosts) {
          setPosts(JSON.parse(cachedPosts));
          setShowingCachedPosts(true);
          setFeedError("Showing saved posts — server is slow or offline. Pull to refresh.");
          return;
        }
      } catch (cacheError) {
        // Ignore
      }
      setPosts([]);
      setShowingCachedPosts(false);
      setFeedError(
        error.message ||
          "Could not load the community feed. The server may need up to a minute to wake up — tap Retry."
      );
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
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
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

        const uploadResponse = await appApiFetch("/upload", {
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

      const response = await appApiFetch("/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          mediaUrl,
          mediaType,
          tags: [...new Set([...newPostTags, ...inferTagsFromContent(content)])],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create post");
      }

      setPosts((prev) => [data.post, ...prev]);
      setShowCreateModal(false);
      setNewPostContent("");
      setNewPostTags([]);
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

  const openAuthModal = (signup = false) => {
    setAuthStartInSignup(signup);
    setShowAuthModal(true);
  };

  const handleAuthRequired = () => {
    openAuthModal(false);
  };

  const handleCreatePostClick = () => {
    if (!user || !token) {
      handleAuthRequired();
    } else {
      setShowCreateModal(true);
    }
  };

  const handleAuthSuccess = async (userData, userToken) => {
    await login(userData, userToken);
    setShowAuthModal(false);
    fetchPosts();
  };

  const toggleNewPostTag = (tagId) => {
    setNewPostTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "all") return true;
    return post.tags?.includes(activeFilter);
  }).filter((post) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.content?.toLowerCase().includes(q) ||
      post.user?.name?.toLowerCase().includes(q)
    );
  });

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={styles.loadingRing}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading community...</Text>
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
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        <ScreenHero
          icon={Users}
          title="Farmer Community"
          subtitle="Connect, share tips, and learn from growers near you"
        >
          {!user ? (
            <View style={styles.authBanner}>
              <Text style={styles.authBannerText}>Sign in to post, like, and comment</Text>
              <View style={styles.authBannerActions}>
                <TouchableOpacity style={styles.authPrimaryButton} onPress={handleAuthRequired}>
                  <Text style={styles.authPrimaryButtonText}>Sign in</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.authSecondaryButton}
                  onPress={() => openAuthModal(true)}
                >
                  <Text style={styles.authSecondaryButtonText}>Create account</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.loggedInBanner}>
              <Text style={styles.loggedInText}>Logged in as {user.name}</Text>
            </View>
          )}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Leaf size={14} color={colors.primary} />
              <Text style={styles.statPillText}>{posts.length} Posts</Text>
            </View>
            <View style={styles.statPill}>
              <MessageCircle size={14} color={colors.primary} />
              <Text style={styles.statPillText}>{totalComments} Comments</Text>
            </View>
            <View style={styles.statPill}>
              <Heart size={14} color={colors.danger} />
              <Text style={styles.statPillText}>{totalLikes} Likes</Text>
            </View>
            {showingCachedPosts && (
              <View style={[styles.statPill, styles.statPillWarn]}>
                <Text style={styles.statPillTextWarn}>Offline cache</Text>
              </View>
            )}
          </View>
        </ScreenHero>

        {feedError ? (
          <View style={styles.feedErrorBanner}>
            <Text style={styles.feedErrorText}>{feedError}</Text>
            <TouchableOpacity style={styles.feedRetryButton} onPress={fetchPosts}>
              <Text style={styles.feedRetryButtonText}>Retry</Text>
            </TouchableOpacity>
            <Text style={styles.feedErrorHint} numberOfLines={1}>
              API: {getResolvedAppApiBaseUrl().replace(/^https?:\/\//, "")}
            </Text>
          </View>
        ) : null}

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search posts..."
            placeholderTextColor={colors.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Create Post Card */}
        <TouchableOpacity style={styles.createCard} onPress={handleCreatePostClick} activeOpacity={0.8}>
          <View style={styles.createCardInner}>
            <View style={styles.createCardIcon}>
              <Plus size={24} color={colors.onPrimary} />
            </View>
            <View style={styles.createCardTextWrap}>
              <Text style={styles.createCardTitle}>Share your experience</Text>
              <Text style={styles.createCardSubtitle}>Ask a question or share a tip</Text>
            </View>
            <ArrowUp size={20} color={colors.primary} style={{ transform: [{ rotate: "45deg" }] }} />
          </View>
        </TouchableOpacity>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {filters.map((filter) => {
            const Icon = filter.icon;
            const active = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.id)}
                activeOpacity={0.8}
              >
                <Icon size={14} color={active ? colors.onPrimary : colors.textSecondary} />
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Feed */}
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Leaf size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No results found" : "No posts yet"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try a different search term"
                : feedError
                ? "Pull down to refresh once the server is online."
                : "Be the first to share your farming journey!"}
            </Text>
            {!searchQuery && !user ? (
              <TouchableOpacity style={styles.emptySignInButton} onPress={handleAuthRequired}>
                <Text style={styles.emptySignInButtonText}>Sign in to get started</Text>
              </TouchableOpacity>
            ) : null}
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
        <View style={[styles.modalContainer, { backgroundColor: colors.modalBg || colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Post</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)} hitSlop={12}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalUserInfo}>
              <Avatar name={user?.name} src={user?.avatar} size={48} />
              <View>
                <Text style={[styles.modalUserName, { color: colors.text }]}>{user?.name || "Guest"}</Text>
                <View style={styles.publicBadge}>
                  <Text style={styles.publicText}>Public</Text>
                </View>
              </View>
            </View>

            <TextInput
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="What's happening on your farm? Share an update... 🌿"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
              ]}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            <View style={styles.charCounter}>
              <View style={[styles.charDot, newPostContent.length > 450 && styles.charDotWarning]} />
              <Text style={[styles.charText, newPostContent.length > 500 && styles.charTextWarning]}>
                {newPostContent.length}/500
              </Text>
            </View>

            <View style={styles.modalTagSection}>
              <Text style={[styles.modalTagLabel, { color: colors.textSecondary }]}>Post category</Text>
              <View style={styles.modalTagRow}>
                {POST_TAG_OPTIONS.map((tag) => {
                  const active = newPostTags.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.modalTagChip,
                        { borderColor: colors.border, backgroundColor: colors.inputBg },
                        active && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => toggleNewPostTag(tag.id)}
                    >
                      <Text
                        style={[
                          styles.modalTagChipText,
                          { color: colors.textSecondary },
                          active && { color: colors.onPrimary },
                        ]}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
              <TouchableOpacity
                onPress={openCamera}
                style={[styles.mediaButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              >
                <Camera size={20} color={colors.primary} />
                <Text style={[styles.mediaButtonText, { color: colors.text }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openGallery}
                style={[styles.mediaButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              >
                <ImageIcon size={20} color={colors.primary} />
                <Text style={[styles.mediaButtonText, { color: colors.text }]}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openVideoPicker}
                style={[styles.mediaButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              >
                <Video size={20} color={colors.primary} />
                <Text style={[styles.mediaButtonText, { color: colors.text }]}>Video</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={uploading || (!newPostContent.trim() && !newPostMedia)}
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                (uploading || (!newPostContent.trim() && !newPostMedia)) && styles.submitButtonDisabled,
              ]}
              activeOpacity={0.8}
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
          startInSignup={authStartInSignup}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </KeyboardAvoidingView>
  );
}