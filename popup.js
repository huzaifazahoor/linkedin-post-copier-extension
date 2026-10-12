const btn = document.getElementById('copyBtn');
const statusEl = document.getElementById('status');
const output = document.getElementById('output');
const copyAgain = document.getElementById('copyAgain');

// A fresh click keeps the browser's user-gesture, so this copy is not blocked.
copyAgain.addEventListener('click', () => {
  output.focus();
  output.select();
  const ok = document.execCommand('copy');
  if (ok) {
    copyAgain.textContent = 'Copied';
    setTimeout(() => { copyAgain.textContent = 'Copy text'; }, 1500);
  } else {
    navigator.clipboard.writeText(output.value)
      .then(() => { copyAgain.textContent = 'Copied'; })
      .catch(() => setStatus('Clipboard blocked. Select the text and press Ctrl+C.', 'bad'));
  }
});

// execCommand works reliably in extension popups; Clipboard API is the fallback.
async function copyText(text) {
  output.value = text;
  output.style.display = 'block';
  copyAgain.style.display = 'block';
  output.focus();
  output.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  if (!ok) {
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = false; }
  }
  return ok;
}

function setStatus(msg, type = '') {
  statusEl.textContent = msg;
  statusEl.className = type;
}

// Runs inside the LinkedIn page. Must be self-contained.
function extractPosts(skipReposts) {
  const posts = new Map();
  const cards = document.querySelectorAll('[role="listitem"][componentkey^="update-card-focus"]');

  cards.forEach(card => {
    const all = card.innerText;
    if (skipReposts && /reposted this/.test(all)) return;

    const box = card.querySelector('[data-testid="expandable-text-box"]');
    if (!box) return;

    const link = card.querySelector('a[href*="/analytics/post-summary/"]');
    const id = link ? link.href : card.getAttribute('componentkey');
    if (posts.has(id)) return;

    const clone = box.cloneNode(true);
    clone.querySelectorAll('button').forEach(b => b.remove()); // drop "… more"
    // A detached clone ignores <br> in innerText, so turn each <br> into a real newline.
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    const text = clone.textContent
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const num = re => { const m = all.match(re); return m ? m[1] : '0'; };
    const r = all.match(/and ([\d,]+) others? reacted/);
    const reactions = r ? Number(r[1].replace(/,/g, '')) + 1 : (/reacted/.test(all) ? 1 : 0);
    const age = num(/^(\d+(?:h|d|w|mo|yr?))$/m);

    posts.set(id, { age, text, reactions,
      comments: num(/([\d,]+) comments?/),
      reposts: num(/([\d,]+) reposts?/),
      impressions: num(/([\d,]+) impressions/)
    });
  });

  const list = [...posts.values()];
  const out = list.map((p, i) =>
    `Post ${i + 1}${p.age !== '0' ? ` (${p.age})` : ''}\n${p.text}\n` +
    `Reactions: ${p.reactions} | Comments: ${p.comments} | Reposts: ${p.reposts} | Impressions: ${p.impressions}`
  ).join('\n\n----------\n\n');

  return { count: list.length, out };
}

btn.addEventListener('click', async () => {
  btn.disabled = true;
  setStatus('Reading posts...');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/^https:\/\/www\.linkedin\.com\//.test(tab.url || '')) {
      setStatus('Open a LinkedIn page first.', 'bad');
      return;
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPosts,
      args: [document.getElementById('skipReposts').checked]
    });

    if (!result || result.count === 0) {
      setStatus('No posts found. Open your activity page and scroll a bit.', 'bad');
      return;
    }

    const ok = await copyText(result.out);
    const n = `${result.count} post${result.count === 1 ? '' : 's'}`;
    if (ok) {
      setStatus(`Found ${n}. If paste is empty, click Copy text.`, 'ok');
    } else {
      setStatus(`Found ${n}, but the clipboard was blocked. Press Ctrl+C to copy the text below.`, 'bad');
    }
  } catch (err) {
    setStatus('Copy failed: ' + err.message, 'bad');
  } finally {
    btn.disabled = false;
  }
});
