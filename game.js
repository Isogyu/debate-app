// ゲーム「起こさないで」
(() => {
  const area = document.getElementById("game-area");
  const capsule = document.getElementById("game-capsule");
  const startOv = document.getElementById("game-start");
  const overOv = document.getElementById("game-over");
  const hudTime = document.getElementById("hud-time");
  const hudBest = document.getElementById("hud-best");

  // 眠りを妨げるもの。hp = 追い払うのに必要なタップ数、speed = px/秒、weight = 出やすさ
  const FOES = [
    { emoji: "⏰", label: "目覚まし", hp: 1, speed: 70, weight: 5,
      cause: "目覚まし時計が鳴りました。開発者は反射的にスヌーズを押し、そのまま3回押し、昼になりました。" },
    { emoji: "💬", label: "@channel", hp: 1, speed: 110, weight: 4,
      cause: "深夜2時の @channel で起こされました。内容は「明日の会議室、変更です」でした。" },
    { emoji: "☎️", label: "上司の電話", hp: 2, speed: 65, weight: 3,
      cause: "上司から電話が来ました。「ちょっといい？」——よくはなかった。" },
    { emoji: "📧", label: "件名「至急」", hp: 1, speed: 90, weight: 4,
      cause: "件名「至急」のメールを開いてしまいました。本文は「来月の件ですが」でした。" },
    { emoji: "🐈", label: "猫", hp: 3, speed: 45, weight: 2,
      cause: "猫がカプセルの上に座りました。猫に勝てる人類はいません。" },
    { emoji: "🍜", label: "夜食の匂い", hp: 1, speed: 80, weight: 3, wobble: true,
      cause: "ラーメンの匂いで目が覚めました。冷凍睡眠より食欲のほうが強かったようです。" },
    { emoji: "📄", label: "締切", hp: 2, speed: 55, weight: 2,
      cause: "締切が夢の中まで追いかけてきました。締切はいつも、思ったより近くにいます。" },
    { emoji: "🔥", label: "本番障害", hp: 3, speed: 120, weight: 1, minTime: 20,
      cause: "本番障害が発生しました。本番障害は、眠っている人を最優先で起こす仕様です。" },
    { emoji: "🔔", label: "宅配便", hp: 1, speed: 85, weight: 3,
      cause: "宅配便のチャイムで起きました。時間指定をしたのは、昨日の自分でした。" },
    { emoji: "🦟", label: "蚊", hp: 1, speed: 100, weight: 2, wobble: true,
      cause: "耳元で蚊が鳴きました。-196℃でも生きている蚊がいるとは、誰も知りませんでした。" },
    { emoji: "🗓️", label: "1on1", hp: 1, speed: 75, weight: 2,
      cause: "1on1の時間です。「最近どう？」と聞かれました。最近は、寝ていました。" },
    { emoji: "🧾", label: "確定申告", hp: 2, speed: 60, weight: 2, minTime: 10,
      cause: "確定申告の期限が来ました。3月15日は、冷凍睡眠中の人にも平等に訪れます。" },
    { emoji: "📮", label: "内容証明", hp: 2, speed: 70, weight: 1, minTime: 15,
      cause: "内容証明郵便が届きました。差出人は、冷蔵庫のプリンの持ち主でした。" },
    { emoji: "⚖️", label: "異議あり", hp: 2, speed: 95, weight: 1, minTime: 25,
      cause: "どこからか「異議あり！」と聞こえて、飛び起きました。ディベートの夢を見ていたようです。" },
    { emoji: "🛏️", label: "羽毛布団", hp: 1, speed: 60, weight: 1, minTime: 8, good: true },
  ];

  const RANKS = [
    [0, "うたた寝（授業中レベル）"],
    [180, "仮眠（昼休みレベル）"],
    [480, "熟睡（休日の朝レベル）"],
    [900, "冬眠するクマ"],
    [1440, "眠れる森の開発者"],
    [2880, "冷凍マンモス（解凍の予定なし）"],
  ];

  const MIN_PER_SEC = 10; // 実時間1秒 = 睡眠10分
  const HIT_RADIUS = 46;
  const BEST_KEY = "coldsleep-best";

  let foes = [];
  let running = false;
  let elapsed = 0;
  let lastTs = 0;
  let spawnTimer = 0;
  let rafId = 0;
  let best = loadBest();

  function loadBest() {
    try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* 保存できなくても遊べる */ }
  }

  function fmt(min) {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60);
    return h ? `${h}時間${m}分` : `${m}分`;
  }

  function showBest() { hudBest.textContent = best ? fmt(best) : "-"; }
  showBest();

  function pickFoe() {
    const pool = FOES.filter((f) => !f.minTime || elapsed >= f.minTime);
    let r = Math.random() * pool.reduce((s, f) => s + f.weight, 0);
    for (const f of pool) { r -= f.weight; if (r <= 0) return f; }
    return pool[0];
  }

  function spawn() {
    const type = pickFoe();
    const w = area.clientWidth;
    const h = area.clientHeight;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.hypot(w, h) / 2 + 20;
    const el = document.createElement("button");
    el.type = "button";
    el.className = "foe";
    el.setAttribute("aria-label", type.label);
    el.innerHTML = `<span class="label">${type.label}</span>${type.emoji}${type.hp > 1 ? `<span class="hp">${type.hp}</span>` : ""}`;
    const foe = {
      type, el, hp: type.hp,
      x: w / 2 + Math.cos(angle) * r,
      y: h / 2 + Math.sin(angle) * r,
      // 時間が経つほど速くなる
      speed: type.speed * (1 + Math.min(elapsed, 60) / 50) * (0.85 + Math.random() * 0.3),
      phase: Math.random() * 10,
    };
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); hit(foe); });
    area.appendChild(el);
    foes.push(foe);
    place(foe);
  }

  function place(f) { f.el.style.left = `${f.x}px`; f.el.style.top = `${f.y}px`; }

  function poof(x, y, text) {
    const p = document.createElement("span");
    p.className = "poof";
    p.textContent = text;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    area.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }

  function remove(f) { f.el.remove(); foes = foes.filter((o) => o !== f); }

  function hit(f) {
    if (!running) return;
    if (f.type.good) {
      foes.slice().forEach((o) => { if (o !== f) poof(o.x, o.y, "ぬくぬく"); remove(o); });
      poof(f.x, f.y, "ふかふか！");
      return;
    }
    f.hp -= 1;
    f.el.classList.remove("hit");
    void f.el.offsetWidth;
    f.el.classList.add("hit");
    const hp = f.el.querySelector(".hp");
    if (hp) hp.textContent = f.hp;
    if (f.hp <= 0) { poof(f.x, f.y, "しーっ"); remove(f); }
  }

  function loop(ts) {
    if (!running) return;
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    elapsed += dt;
    hudTime.textContent = fmt(elapsed * MIN_PER_SEC);

    // 出現間隔は 1.3秒 → 0.45秒 まで縮む
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawn();
      spawnTimer = Math.max(0.45, 1.3 - elapsed * 0.02);
    }

    const cx = area.clientWidth / 2;
    const cy = area.clientHeight / 2;
    for (const f of foes.slice()) {
      const dx = cx - f.x;
      const dy = cy - f.y;
      const dist = Math.hypot(dx, dy);
      if (dist < HIT_RADIUS) {
        if (f.type.good) { remove(f); continue; } // 布団は届いても害なし
        return gameOver(f.type);
      }
      let vx = (dx / dist) * f.speed;
      let vy = (dy / dist) * f.speed;
      if (f.type.wobble) {
        const s = Math.sin(elapsed * 4 + f.phase) * 60;
        vx += (-dy / dist) * s;
        vy += (dx / dist) * s;
      }
      f.x += vx * dt;
      f.y += vy * dt;
      place(f);
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    foes.forEach((f) => f.el.remove());
    foes = [];
    elapsed = 0;
    spawnTimer = 0.6;
    running = true;
    capsule.classList.remove("awake");
    capsule.firstElementChild.textContent = "😴";
    startOv.hidden = true;
    overOv.hidden = true;
    lastTs = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function gameOver(type) {
    running = false;
    cancelAnimationFrame(rafId);
    capsule.classList.add("awake");
    capsule.firstElementChild.textContent = "😫";
    const min = elapsed * MIN_PER_SEC;
    if (min > best) { best = min; saveBest(best); }
    showBest();
    document.getElementById("over-cause").textContent = `${type.emoji} ${type.cause}`;
    document.getElementById("over-time").textContent = fmt(min);
    const rank = RANKS.filter(([t]) => min >= t).pop()[1];
    document.getElementById("over-rank").textContent = `称号：${rank}`;
    setTimeout(() => { overOv.hidden = false; }, 400);
  }

  // 別のタブに移ったら中断して最初からにする
  document.addEventListener("tabchange", (e) => {
    if (e.detail !== "game" && running) {
      running = false;
      cancelAnimationFrame(rafId);
      foes.forEach((f) => f.el.remove());
      foes = [];
      hudTime.textContent = "0分";
      overOv.hidden = true;
      startOv.hidden = false;
    }
  });

  document.getElementById("btn-start").addEventListener("click", start);
  document.getElementById("btn-retry").addEventListener("click", start);
})();
