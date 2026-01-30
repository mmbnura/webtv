📺 MMB Player – Web-based IPTV Application

MMB Player is a modern, TV-optimized web IPTV player built using HTML, CSS, and JavaScript.
It leverages the iptv-org public IPTV database to stream live television channels through a clean, set-top-box-style interface designed for TV browsers, remote controls, and desktop browsers.

The application is fully client-side, requires no backend, and is hosted as a static web application (GitHub Pages compatible).

✨ Highlights

IPTV-style UI optimized for TVs

Adaptive HLS streaming with buffering optimizations

YouTube-style quality selector

Real-time video quality display

Favorites & search

Fullscreen playback without interruption

No server, no database, no login required

🖥 Supported Platforms

MMB Player works on:

Desktop browsers (Chrome, Edge, Firefox)

Samsung Smart TV (Tizen Browser)

LG Smart TV (webOS Browser)

Android TV browsers (experimental)

⚠️ Stream availability and performance depend on the IPTV source.

🧩 Application Layout

The UI follows a three-column IPTV layout:

Categories panel – Channel categories & favorites

Channels list – Channels within the selected category

Player panel – Live video playback with controls

A bottom status bar displays:

Now Playing channel

Current video quality (center-aligned)

Manual quality selector

🎬 Video Playback Features

Powered by Hls.js

Supports live .m3u8 HLS streams

Adaptive Bitrate Streaming (ABR) enabled by default

Tuned buffering for smoother playback

Automatic recovery from network and media errors

Auto-play on channel selection

🎛 Video Quality Control

YouTube-style manual resolution selector

Shows only available stream qualities

Supports:

Auto (adaptive)

Manual locking (360p / 720p / 1080p, if available)

Real-time display of the actual playing quality

Quality selector and indicator are hidden in fullscreen mode

Example display:

Now Playing: Roja TV        Auto · 1080p        ⚙ Quality

⭐ Favorites

Mark channels as favorites with a star icon

Favorites are stored locally using localStorage

Persistent across page reloads

Dedicated ⭐ Favorites category

No account or backend required

🔍 Search

Search channels by name

Triggered only when user presses Enter / OK

Optimized for TV remote input

Search results appear in the channel list column

🖥 Fullscreen & Remote Control Behavior

Single click / OK toggles fullscreen

Clicking the video never pauses playback

Back / Escape exits fullscreen cleanly

UI controls auto-hide in fullscreen

Designed for TV remote navigation (↑ ↓ OK)

📡 IPTV Data Source

MMB Player uses the public iptv-org datasets:

Channels:
https://iptv-org.github.io/api/channels.json

Streams:
https://iptv-org.github.io/api/streams.json

Only HLS (.m3u8) streams are used for compatibility.

💾 Storage & Persistence

Uses browser localStorage for:

Favorites

Fully stateless

Works perfectly with static hosting (GitHub Pages)

🌐 Hosting

MMB Player is a pure static application:

No backend server

No database

No API keys

No build tools

It can be hosted on:

GitHub Pages

Any static web server

Local filesystem (limited)

⚠️ Limitations

Stream stability depends on IPTV source quality

Some channels provide only a single resolution

Browser-based playback cannot match native IPTV apps

CORS restrictions may limit advanced features (thumbnails, snapshots)

🚀 Future Enhancements (Optional)

Bitrate (kbps) display

Buffer health indicator

Persist preferred quality per channel

Known-stable channel list

Packaging as a Tizen Web App

Native AVPlayer integration for TVs

📜 License & Disclaimer

This project is for educational and experimental purposes only.

MMB Player does not host or distribute IPTV content

All streams belong to their respective owners

Availability and legality of IPTV streams vary by region

🙌 Acknowledgements

iptv-org
 for the open IPTV database

Hls.js
 for HLS playback

MMB Player demonstrates how far a well-designed, browser-only IPTV application can go — delivering a polished, TV-grade experience using just frontend technologies.
