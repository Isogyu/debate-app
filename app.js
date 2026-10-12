// ホーム・備忘録・タブ切り替え
(() => {
  // 眠り始めた日時（日本時間）
  const SLEEP_START = new Date("2026-10-12T00:00:00+09:00");

  const SLEEP_TALK = [
    "むにゃ…それ、要件定義に書いてあった…？",
    "あと5分…いや、あと5バージョン…",
    "…TypeScriptの型が…夢に出てくる…",
    "起こさないで…いまレベル上げ中…",
    "…その質問、まず検索してみた…？ むにゃ",
    "本番環境で…テストは…しないで…",
    "…有給…申請…しなきゃ…",
    "立論…あと10秒…足りない…",
    "…ゲームのほうで遊んでて…zzz",
    "コミットメッセージ…「修正」だけは…やめて…",
    "異議あり…むにゃ…",
    "…その条文…ただし書きのほうが…大事…",
    "…確定申告…3月15日…",
    "…それは…論点のすり替え…",
    "…議事録…誰か…とって…",
    "…パスワードを…付箋に…貼らないで…",
    "…push --force…だけは…",
    "…起こしたら…判決…出します…",
    "…冷蔵庫のプリン…ぼくのじゃない…",
    "…「ちょっといいですか」…40分…",
  ];

  // ---- タブ切り替え ----
  const pages = document.querySelectorAll(".page");
  const tabLinks = document.querySelectorAll(".tabs a");

  function showTab() {
    const id = location.hash.replace("#", "") || "home";
    // セクションIDは「page-」付きにして、ブラウザのアンカージャンプを避けている
    const target = document.getElementById(`page-${id}`) ? id : "home";
    pages.forEach((p) => { p.hidden = p.id !== `page-${target}`; });
    tabLinks.forEach((a) => a.classList.toggle("active", a.dataset.tab === target));
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent("tabchange", { detail: target }));
  }
  window.addEventListener("hashchange", showTab);
  showTab();

  // ---- ホーム: 経過時間 ----
  const elapsedEl = document.getElementById("elapsed");
  function tick() {
    const s = Math.max(0, Math.floor((Date.now() - SLEEP_START) / 1000));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    elapsedEl.textContent = `${d}日 ${h}時間 ${m}分 ${sec}秒`;
  }
  tick();
  setInterval(tick, 1000);

  // ---- ホーム: 寝言 ----
  const capsule = document.getElementById("capsule");
  const bubble = document.getElementById("bubble");
  let lastTalk = -1;
  capsule.addEventListener("click", () => {
    let i;
    do { i = Math.floor(Math.random() * SLEEP_TALK.length); } while (i === lastTalk);
    lastTalk = i;
    bubble.textContent = `「${SLEEP_TALK[i]}」`;
    capsule.classList.remove("knock");
    void capsule.offsetWidth;
    capsule.classList.add("knock");
  });

  // ---- 備忘録 ----
  const notes = [...(window.NOTES || [])].sort((a, b) => b.date.localeCompare(a.date));

  // 技術力ゲージ（備忘録1件につき3%、最大99%。100%は起きるときのために取っておく）
  const charge = Math.min(99, 5 + notes.length * 3);
  document.getElementById("gauge-num").textContent = `${charge}%`;
  requestAnimationFrame(() => {
    document.getElementById("gauge-fill").style.width = `${charge}%`;
  });

  const listEl = document.getElementById("note-list");
  const tagsEl = document.getElementById("note-tags");
  const searchEl = document.getElementById("note-search");
  const countEl = document.getElementById("note-count");
  let activeTag = null;

  const esc = (s) => s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  // 本文: 空行で段落、「- 」で箇条書き
  function renderBody(text) {
    return text.trim().split(/\n\s*\n/).map((block) => {
      const lines = block.split("\n");
      let html = "";
      let para = [];
      let items = [];
      const flushPara = () => { if (para.length) { html += `<p>${para.map(esc).join("<br>")}</p>`; para = []; } };
      const flushList = () => { if (items.length) { html += `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`; items = []; } };
      lines.forEach((line) => {
        const m = line.match(/^\s*-\s+(.*)$/);
        if (m) { flushPara(); items.push(m[1]); } else { flushList(); para.push(line.trim()); }
      });
      flushPara();
      flushList();
      return html;
    }).join("");
  }

  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))];
  tagsEl.innerHTML = allTags.map((t) => `<button type="button" class="tag" data-tag="${esc(t)}">#${esc(t)}</button>`).join("");
  tagsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tag");
    if (!btn) return;
    activeTag = activeTag === btn.dataset.tag ? null : btn.dataset.tag;
    tagsEl.querySelectorAll(".tag").forEach((b) => b.classList.toggle("active", b.dataset.tag === activeTag));
    renderNotes();
  });
  searchEl.addEventListener("input", renderNotes);

  function renderNotes() {
    const q = searchEl.value.trim().toLowerCase();
    const hits = notes.filter((n) => {
      if (activeTag && !(n.tags || []).includes(activeTag)) return false;
      if (!q) return true;
      return (n.title + n.body + (n.tags || []).join(" ")).toLowerCase().includes(q);
    });
    countEl.textContent = `${hits.length} 件 / 全 ${notes.length} 件`;
    if (!hits.length) {
      listEl.innerHTML = `<p class="empty">該当する記事はありません。</p>`;
      return;
    }
    listEl.innerHTML = hits.map((n, i) => `
      <details class="note"${i === 0 && !q && !activeTag ? " open" : ""}>
        <summary>
          <span class="note-date">${esc(n.date)}</span>
          <span class="note-title">${esc(n.title)}</span>
          <span class="note-tags">${(n.tags || []).map((t) => `<span>#${esc(t)}</span>`).join("")}</span>
        </summary>
        <div class="note-body">${renderBody(n.body)}</div>
      </details>`).join("");
  }
  renderNotes();
})();
