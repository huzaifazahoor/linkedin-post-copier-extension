const btn = document.getElementById('copyBtn');
const countInput = document.getElementById('count');
const skipInput = document.getElementById('skipReposts');
const statusEl = document.getElementById('status');

const BTN_LABEL = 'Copy posts';
let resetTimer = null;

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = type || '';
}

// Reads the box. Returns null for "all", a number, or NaN if invalid.
function readCount() {
  const raw = countInput.value.trim();
  if (raw === '') return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : NaN;
}

// Tries the modern Clipboard API first, which Windows may keep in Win+V history.
// Falls back to the old hidden text box method if that fails.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.warn('[PostCopier] clipboard.writeText failed, using fallback:', e);
  }
  const box = document.createElement('textarea');
  box.value = text;
  box.setAttribute('readonly', '');
  box.style.position = 'fixed';
  box.style.left = '-9999px';
  document.body.appendChild(box);
  box.focus();
  box.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  box.remove();
  return ok;
}

// Runs inside the LinkedIn page. Must be self-contained.
function extractPosts(skipReposts, limit) {
  const posts = new Map();
  const cards = document.querySelectorAll('[role="listitem"][componentkey^="update-card-focus"]');

  for (const card of cards) {
    if (limit && posts.size >= limit) break;

    const all = card.innerText;
    if (skipReposts && /reposted this/.test(all)) continue;

    const box = card.querySelector('[data-testid="expandable-text-box"]');
    if (!box) continue;

    const link = card.querySelector('a[href*="/analytics/post-summary/"]');
    const id = link ? link.href : card.getAttribute('componentkey');
    if (posts.has(id)) continue;

    const clone = box.cloneNode(true);
    clone.querySelectorAll('button').forEach(b => b.remove());
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    const text = clone.textContent
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const num = re => { const m = all.match(re); return m ? m[1] : '0'; };

    // LinkedIn shows counts as bare numbers inside the action buttons.
    // An empty count is a zero-width space, so treat "no digits" as 0.
    const btnCount = selector => {
      const btn = card.querySelector(selector);
      if (!btn) return '0';
      const m = btn.textContent.replace(/\u200b/g, '').match(/[\d.,]+[KM]?/i);
      return m ? m[0] : '0';
    };

    posts.set(id, {
      age: num(/^(\d+(?:h|d|w|mo|yr?))$/m),
      text,
      reactions: btnCount('button[aria-label^="Reaction button state"]'),
      comments: btnCount('button[aria-label="Comment"]'),
      reposts: btnCount('button[aria-label="Repost"]'),
      impressions: num(/([\d,]+) impressions/)
    });
  }

  const list = [...posts.values()];
  const out = list.map((p, i) =>
    `Post ${i + 1}${p.age !== '0' ? ` (${p.age})` : ''}\n${p.text}\n` +
    `Reactions: ${p.reactions} | Comments: ${p.comments} | Reposts: ${p.reposts} | Impressions: ${p.impressions}`
  ).join('\n\n----------\n\n');

  return { count: list.length, out };
}

async function run() {
  const limit = readCount();
  if (Number.isNaN(limit)) {
    setStatus('Enter a whole number like 1 or 5, or leave it empty.', 'bad');
    countInput.focus();
    return;
  }

  clearTimeout(resetTimer);
  btn.disabled = true;
  btn.classList.remove('done');
  btn.textContent = 'Copying...';
  setStatus('', '');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/^https:\/\/www\.linkedin\.com\//.test(tab.url || '')) {
      setStatus('Open your LinkedIn activity page first.', 'bad');
      return;
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPosts,
      args: [skipInput.checked, limit]
    });

    if (!result || result.count === 0) {
      setStatus('No posts found. Open your activity page and scroll a bit.', 'bad');
      return;
    }

    if (!(await copyText(result.out))) {
      setStatus('The browser blocked the copy. Try again.', 'bad');
      return;
    }

    const n = `${result.count} post${result.count === 1 ? '' : 's'}`;
    if (limit && result.count < limit) {
      setStatus(`Copied ${n}. Only ${result.count} loaded, scroll down for more.`, 'ok');
    } else {
      setStatus(`Copied ${n}.`, 'ok');
    }
    btn.textContent = 'Copied';
    btn.classList.add('done');
    resetTimer = setTimeout(() => {
      btn.textContent = BTN_LABEL;
      btn.classList.remove('done');
    }, 2000);
  } catch (err) {
    setStatus('Copy failed: ' + err.message, 'bad');
  } finally {
    btn.disabled = false;
    if (!btn.classList.contains('done')) btn.textContent = BTN_LABEL;
  }
}

btn.addEventListener('click', run);
countInput.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
countInput.focus();