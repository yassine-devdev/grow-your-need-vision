# 🎛️ Owner Dashboard - Overlay Apps Management Guide

## Overview
The Owner Dashboard now includes comprehensive content management for all 13 overlay applications. This allows platform owners to manage movies, live TV channels, and all other app content from a centralized admin panel.

---

## 🚀 Accessing the Content Manager

### From Owner Dashboard
1. Navigate to Owner Dashboard
2. Look for "Overlay Apps" section or tab
3. Select any app to manage its content

---

## 📺 Media App Management

### Movies & Series Management

**Add New Media**:
1. Click "Add Media" button
2. Fill in details:
   - Title (required)
   - Description (required)
   - Type: Movie, Series, or Documentary
   - Rating (PG, PG-13, R, TV-MA, etc.)
   - Duration
   - Year

**Video Sources** (Choose one or both):
- **Direct URL**: Paste video URL (MP4, MKV, M3U8)
- **Embed URL**: Paste embed iframe URL
- **Upload File**: Drag & drop local video file

**Metadata**:
- Thumbnail URL
- Cast (comma-separated)
- Director
- Genre (auto-tagged)

**Example - Adding a Movie**:
```
Title: The Dark Knight
Description: When the menace known as the Joker...
Type: Movie
Rating: PG-13
Duration: 2h 32m
Year: 2008
Video URL: https://example.com/dark-knight.mp4
Thumbnail: https://example.com/poster.jpg
Cast: Christian Bale, Heath Ledger, Aaron Eckhart
Director: Christopher Nolan
```

---

### Live TV Channel Management

**Add Individual Channel**:
1. Switch to "Live TV Channels" tab
2. Click "Add Channel"
3. Enter:
   - Channel name (ESPN HD, CNN, etc.)
   - M3U8 stream URL (required)
   - Logo URL (optional)
   - Category (Sports, News, Entertainment)
   - Country
   - Language (default: English)

**Example**:
```
Name: ESPN HD
Stream URL: https://stream.example.com/espn/playlist.m3u8
Logo: https://example.com/espn-logo.png
Category: Sports
Country: USA
Language: en
```

---

### M3U8 Playlist Import

**Bulk Import Channels**:
1. Switch to "M3U Playlists" tab
2. Click "Add Playlist"
3. Enter:
   - Playlist name
   - M3U8 playlist URL
4. Click "Add & Sync"
5. System automatically:
   - Parses playlist
   - Extracts all channels
   - Gets logos and categories
   - Saves to database

**Popular Free Playlists** (for testing):
- IPTV-org: `https://iptv-org.github.io/iptv/index.m3u8`
- Free-TV: Public domain channels
- Educational: University broadcasts

**Note**: Always ensure you have rights to stream content!

---

## 🎯 Other Overlay Apps (Coming Soon)

The following apps are ready for users but admin panels are in development:

### Sport App
- Add teams
- Create matches
- Manage venues
- Track player stats

### Gamification
- Create achievements
- Design rewards
- Set up challenges
- Configure XP system

### Travel App
- Add destinations
- Manage bookings
- Create itineraries
- Configure transport options

### Help Center
- Write FAQs
- Create knowledge articles
- Manage categories
- Track tickets

### Hobbies App
- Add project templates
- Create skill guides
- Manage resources

### Religion App
- Set prayer times
- Add events
- Manage Quran content
- Configure notifications

---

## 🔐 Permissions

**Who can manage content**:
- ✅ Owner (full access)
- ✅ Admin (create, edit, delete)
- ✅ Teachers (create, edit)
- ❌ Students (view only)
- ❌ Parents (view only)

---

## 💾 Data Storage

**Media Files**:
- Uploaded to PocketBase storage
- Or external CDN via URL
- Supports: MP4, MKV, AVI, M3U8

**Thumbnails**:
- JPG, PNG, WebP
- Recommended: 300x450px (2:3 ratio)

**Live Streams**:
- M3U8 (HLS) format
- Direct stream URLs
- Real-time playback

---

## 📊 Database Collections

### Media Items (`media_items`)
- Movies, series, documentaries
- Complete metadata
- Video URLs or embeds

### TV Channels (`tv_channels`)
- Live TV streams
- Channel metadata
- M3U8 URLs

### M3U Playlists (`m3u_playlists`)
- Playlist sources
- Sync status
- Channel counts

See `MEDIA_LIVE_TV_SETUP.md` for full schema.

---

## 🎬 Video Format Support

**Supported Formats**:
- MP4 (recommended)
- M3U8 (HLS streaming)
- WebM
- OGG
- MKV (via URL)

**Embed Support**:
- YouTube
- Vimeo
- Custom players
- Any iframe-compatible source

---

## 🔄 Syncing M3U Playlists

**Auto-Sync Process**:
1. Owner adds playlist URL
2. System fetches M3U8 file
3. Parses #EXTINF tags
4. Extracts:
   - Channel names
   - Stream URLs
   - Logos (tvg-logo)
   - Categories (group-title)
5. Creates channel records
6. Updates playlist stats

**Sync Status**:
- Last synced timestamp
- Total channels imported
- Active/inactive status

---

## 🛠️ Troubleshooting

### Video Won't Play
- ✅ Check URL is accessible
- ✅ Verify M3U8 format is correct
- ✅ Test stream in VLC player first
- ✅ Check CORS headers

### Playlist Import Fails
- ✅ Verify M3U8 URL is public
- ✅ Check internet connection
- ✅ Validate M3U8 format
- ✅ Try sample playlist first

### Upload Fails
- ✅ Check file size (max 500MB)
- ✅ Verify format is supported
- ✅ Check storage quota
- ✅ Check network connection

---

## 🎯 Best Practices

### Content Organization
1. **Use clear titles** - Descriptive and searchable
2. **Add metadata** - Complete cast, director, year
3. **Quality thumbnails** - High resolution posters
4. **Categorize properly** - Correct genre tags

### Live TV
1. **Test streams first** - Verify before adding
2. **Use logos** - Better user experience
3. **Organize by category** - Sports, News, etc.
4. **Check licenses** - Only stream authorized content

### Performance
1. **Use CDN for videos** - Faster delivery
2. **Optimize thumbnails** - Compress images
3. **Limit playlist size** - <1000 channels
4. **Regular cleanup** - Remove inactive content

---

## 📈 Analytics (Coming Soon)

Future features:
- View counts per movie/channel
- Popular content tracking
- User engagement metrics
- Watch time statistics

---

## 🚀 Quick Start Checklist

- [ ] Access Owner Dashboard
- [ ] Navigate to Overlay Apps Manager
- [ ] Select Media app
- [ ] Add your first movie/series
- [ ] Add a live TV channel
- [ ] Import an M3U playlist
- [ ] Test playback in Media app
- [ ] Organize content by categories

---

## 📞 Support

**For help**:
- Check database setup guides
- Review `MEDIA_LIVE_TV_SETUP.md`
- Test with sample data first
- Verify PocketBase collections exist

---

**Status**: ✅ Ready to use  
**Platform**: Fully integrated  
**Access**: Owner Dashboard → Overlay Apps

**Your content management system is ready!** 🎉
