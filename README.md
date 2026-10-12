# LinkedIn Post Copier

A small browser extension that copies your LinkedIn posts as clean text, without links or page clutter, along with reactions, comments, reposts, and impressions.

## Install (Edge or Chrome)

1. Download or clone this folder.
2. Open `edge://extensions` (or `chrome://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and pick this folder.

## Use

1. Go to your LinkedIn activity page: `linkedin.com/in/<you>/recent-activity/all/`
2. Scroll to load the posts you want.
3. Click the extension icon, then **Copy posts**.
4. Paste anywhere.

## Output

```
Post 1 (1d)
Your post text...
Reactions: 14 | Comments: 0 | Reposts: 0 | Impressions: 4,051
```

## Notes

- LinkedIn hides posts that are far off screen, so it copies the posts currently loaded near your view.
- Impressions only show on your own posts.
- If LinkedIn changes its page layout, the selectors in `popup.js` may need an update.
