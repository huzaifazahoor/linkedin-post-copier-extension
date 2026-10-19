# 📋 LinkedIn Post Copier

### Copy your LinkedIn posts as clean text, with their stats, in one click

![Chrome](https://img.shields.io/badge/Chrome-4285F4?style=flat&logo=googlechrome&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-0078D7?style=flat&logo=microsoftedge&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=flat)

A small browser extension that copies your LinkedIn posts without links, buttons, or page clutter, along with **reactions, comments, reposts, and impressions**.

Made for pasting your posts into an LLM to research ideas, plan new posts, or show it what you work on.

---

## 💡 Why I Built It

Copying posts straight from LinkedIn gives you links, "… more" buttons, names, and a lot of extra text, and the engagement numbers get lost. This extension keeps only the post text and its numbers, so an LLM can see what you wrote and how each post did.

---

## ✨ Features

| Feature | What it does |
|---|---|
| 🧹 Clean text | Removes links, buttons, and page clutter |
| 📊 Post stats | Adds age, reactions, comments, reposts, and impressions to each post |
| 🔢 Post count | Copy only the latest N posts, or leave it empty for all |
| 🔁 Skip reposts | Leave out posts you only reposted |
| 🌗 Dark mode | Follows your system theme |

---

## ⚙️ Install (Edge or Chrome)

1. Download or clone this folder.
2. Open `edge://extensions` (or `chrome://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and pick this folder.
5. Click the puzzle icon in the toolbar and pin **LinkedIn Post Copier** so it stays visible.

---

## 🚀 Use

1. Go to your LinkedIn activity page: `linkedin.com/in/<you>/recent-activity/all/`
2. Scroll to load the posts you want.
3. Click the extension icon.
4. Optionally enter how many posts to copy and choose whether to skip reposts.
5. Click **Copy posts**, then paste anywhere, like ChatGPT or Claude.

---

## 📄 Output

```
Post 1 (1d)
Your post text...
Reactions: 14 | Comments: 0 | Reposts: 0 | Impressions: 4,051

----------

Post 2 (3d)
Your post text...
Reactions: 28 | Comments: 11 | Reposts: 2 | Impressions: 5,128
```

---

## 📝 Notes

- LinkedIn hides posts that are far off screen, so it copies the posts currently loaded near your view.
- Impressions only show on your own posts.
- Long copies may paste as an attached file in some chat apps. The copy still worked.
- If LinkedIn changes its page layout, the selectors in `popup.js` may need an update.

---

🛠️ Built by [Huzaifa Zahoor](https://github.com/huzaifazahoor). Found a bug or LinkedIn changed something? [Open an issue](https://github.com/huzaifazahoor/linkedin-post-copier-extension/issues).