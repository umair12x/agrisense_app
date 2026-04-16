# API Configuration Guide

## Issue Summary
The errors you were experiencing:
1. **AsyncStorageError: Native module is null** - AsyncStorage wasn't initialized before use
2. **TypeError: Network request failed** - Localhost doesn't work on mobile/emulator

## Solutions Applied

### 1. AsyncStorage Error - FIXED ✅
- Added proper error handling for AsyncStorage initialization
- Added try-catch blocks with fallback logic
- If AsyncStorage fails, app continues with default state (not authenticated)
- No more crashes from native module null errors

### 2. Network Error - Configuration Needed

The app currently uses:
```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
```

**Choose one of the following solutions:**

### Option A: Use Environment Variables (RECOMMENDED)
1. Create a `.env` file in your project root:
```
REACT_APP_API_URL=http://YOUR_SERVER_IP:5000/api
```

2. Find your server's IP address:
   - **Windows**: Open Command Prompt and run `ipconfig`
   - Look for "IPv4 Address" (e.g., 192.168.1.100)
   
3. Replace `YOUR_SERVER_IP` with your actual IP address

4. Restart the Expo app after saving

### Option B: Direct Configuration
If you want to use a specific backend:

1. Edit `CommunityScreen.jsx` line ~30:
```javascript
const API_URL = "http://192.168.1.100:5000/api"; // Replace with your IP
```

### Option C: Use Production API
If you have a deployed backend:
```javascript
const API_URL = "https://your-api-domain.com/api";
```

### Option D: Mock Data (For Development)
If you don't have a backend yet, the app will gracefully show cached data. To add mock data:

1. Update `fetchPosts()` to return mock data:
```javascript
const fetchPosts = async () => {
  try {
    // ... existing code ...
  } catch (error) {
    // Load mock posts when API fails
    const mockPosts = [
      {
        id: "1",
        userId: "user1",
        user: { id: "user1", name: "John Farmer", avatar: null, verified: true },
        content: "Great tips on crop rotation! Really helped my soil health.",
        mediaUrl: null,
        mediaType: null,
        tags: ["tips"],
        likes: [{ userId: "user2" }],
        comments: [],
        createdAt: new Date().toISOString(),
      },
      // Add more mock posts...
    ];
    setPosts(mockPosts);
  }
};
```

## Testing the Fix

1. **Clear App Cache**: Uninstall the app from your emulator/device
2. **Restart Expo**: Run `npm start` or `expo start`
3. **Test AsyncStorage**: 
   - The app should no longer crash on startup
   - User data loads gracefully even if AsyncStorage fails
4. **Test Network**:
   - If API_URL is incorrect, you'll see network errors in console (not crashes)
   - Cached data will be shown as fallback

## API Endpoints Expected

Your backend should support:

```javascript
GET     /api/posts                          // Fetch all posts
POST    /api/posts                          // Create a post
DELETE  /api/posts/:id                      // Delete a post
POST    /api/posts/like                     // Like a post
POST    /api/posts/comment                  // Add comment
POST    /api/posts/comment/reply            // Reply to comment
POST    /api/posts/comment/like             // Like a comment
```

## Error Handling Improvements

The app now:
- ✅ Handles AsyncStorage native module errors gracefully
- ✅ Adds 10-second timeout to network requests
- ✅ Caches posts for offline access
- ✅ Shows helpful error messages to users
- ✅ Reverts optimistic updates on errors
- ✅ Continues operation even if storage/network fails

## Debugging

To see what's happening:
1. Open Expo DevTools: Press `d` in terminal
2. Select "View logs in browser"
3. Check for:
   - AsyncStorage errors: "Error loading user data:"
   - Network errors: "Fetch posts error:"
   - HTTP errors: "HTTP error! status: xxx"

## Next Steps

1. Configure your API URL (Option A recommended)
2. Test the app on your emulator/device
3. Monitor console logs for any remaining errors
4. If issues persist, check that your backend is:
   - Running and accessible
   - Accepting requests from your device/emulator IP
   - Using proper CORS headers (if API is on different domain)
