// どうでもいい裁判所
// 事件を足すときは CASES に1件追加する。verdict は "guilty"（有罪）か "innocent"（無罪）。
(() => {
  const CASES = [
    {
      title: "目玉焼きソース事件",
      facts: "被告人は、醤油派しかいない朝の食卓で、目玉焼きにソースをかけた。",
      defense: "「目玉焼きにはソースが正解です。」",
      verdict: "innocent",
      main: "被告人は無罪。ただし厳重注意とする。",
      reason: "目玉焼きに何をかけるかは個人の自由であり、何人もこれを侵すことはできない（どうでもいい法第1条）。もっとも、醤油派の前で「正解」と言い切った点は食卓の平和を乱すおそれがあり、看過できない。",
    },
    {
      title: "最後の唐揚げ事件",
      facts: "被告人は、大皿に1個だけ残った唐揚げについて「誰も食べないなら…」と言い、返事を待たずに食べた。",
      defense: "「ちゃんと聞きました。」",
      verdict: "guilty",
      main: "被告人を、唐揚げにレモンをかける権利の停止1か月に処する。",
      reason: "「誰も食べないなら」は質問の形をとった宣言であり、同席者の同意を得たとは認められない。返事を待つ時間が0.4秒であったことも、被告人の計画性を裏付けている。",
    },
    {
      title: "「ちょっといいですか」事件",
      facts: "被告人は、会議の終了間際に「ちょっといいですか」と発言し、そのまま40分話した。",
      defense: "「ちょっとのつもりでした。」",
      verdict: "guilty",
      main: "被告人を、次回会議のタイマー係に処する。",
      reason: "40分は、社会通念上「ちょっと」の範囲を明らかに超える。なお、その間に出席者3名が昼食の予定を失っており、被害は軽くない。",
    },
    {
      title: "「了解です」事件",
      facts: "新入社員である被告人は、上司からの連絡に「了解です」と返信した。",
      defense: "「失礼だなんて知りませんでした。」",
      verdict: "innocent",
      main: "被告人は無罪。",
      reason: "「了解」が目上の人に失礼であるという確かな根拠は、当裁判所の調べでは見つからなかった。ただし、気にする人がいることもまた事実であるため、当裁判所は「承知しました」の使用を推奨する。迷ったら丁寧なほうを選べば、裁判にはならない。",
    },
    {
      title: "冷蔵庫のプリン事件",
      facts: "被告人は、共用の冷蔵庫にあった名前の書かれていないプリンを食べた。",
      defense: "「名前が書いていなかったので。」",
      verdict: "guilty",
      main: "被告人を、プリン2個の返還に処する（利息分を含む）。",
      reason: "名前が書かれていないことは、自分のものであることを意味しない。また、プリンのふたには「楽しみ」と書かれた付箋が貼られており、持ち主の強い期待が認められる。",
    },
    {
      title: "既読スルー事件",
      facts: "被告人は、友人からのメッセージを読んだまま3日間返信しなかった。",
      defense: "「返そうと思っているうちに3日経っていました。」",
      verdict: "innocent",
      main: "被告人は無罪。",
      reason: "既読は「読んだ」ことを示すにとどまり、「すぐに返す」ことを約束するものではない。もっとも、3日は長い。当裁判所は、被告人がこの判決を読んだ直後に返信することを強く期待する。",
    },
    {
      title: "全員に返信事件",
      facts: "被告人は、200人に一斉送信されたお知らせメールに「全員に返信」で「ありがとうございます！」と返した。",
      defense: "「感謝を伝えたかったんです。」",
      verdict: "innocent",
      main: "被告人は無罪。ただし、3行の反省文の提出を求める。",
      reason: "感謝の気持ちそのものに罪はない。しかし、これに続いて「全員に返信」で「私も！」と返した12名については、別途審理を行う。",
    },
    {
      title: "立論5分10秒事件",
      facts: "被告人は、ディベートの立論（制限時間5分）を、本番で5分10秒かけて読み上げた。",
      defense: "「練習では4分50秒でした。」",
      verdict: "guilty",
      main: "被告人を、ストップウォッチとの和解に処する。",
      reason: "本番は練習より遅くなる、というのは古くから知られた経験則である。最後の10秒で述べた結論は、ジャッジの記憶にまったく残っていない。",
    },
    {
      title: "エレベーター「閉」連打事件",
      facts: "被告人は、エレベーターに乗るなり「閉」ボタンを8回押した。",
      defense: "「急いでいたんです。」",
      verdict: "innocent",
      main: "被告人は無罪。",
      reason: "押した回数とドアが閉まる速さに関係があるかは、当裁判所の調べでは明らかにならなかった。被告人の焦りは十分に伝わっており、それ以上の罰は必要ないと判断する。",
    },
    {
      title: "「明日やる」事件",
      facts: "被告人は、アプリのアップデートについて「明日やる」と言い続けたあげく、冷凍睡眠に入った。",
      defense: "「技術力を身につけてから、ちゃんとやります。」",
      verdict: "guilty",
      main: "被告人を有罪とする。ただし、解凍の日まで刑の執行を猶予する。",
      reason: "「明日」が来ないまま眠りに入った点は、明らかに約束違反である。ただし、被告人が眠りながらも学び続けていると主張している点を考慮し、目覚めたあとのアプリの出来ばえを見て最終的に判断する。なお、被告人は当サイトの開発者である。",
    },
  ];

  const noEl = document.getElementById("case-no");
  const titleEl = document.getElementById("case-title");
  const factsEl = document.getElementById("case-facts");
  const defenseEl = document.getElementById("case-defense");
  const btnsEl = document.getElementById("verdict-btns");
  const judgEl = document.getElementById("judgment");
  const scoreEl = document.getElementById("court-score");

  // 毎回違う順番で出す
  const order = CASES.map((_, i) => i).sort(() => Math.random() - 0.5);
  let pos = 0;
  let judged = 0;
  let matched = 0;

  function show() {
    const idx = order[pos % order.length];
    const c = CASES[idx];
    noEl.textContent = `令和8年（ど）第${idx + 1}号　${pos % order.length + 1} / ${CASES.length} 件目`;
    titleEl.textContent = c.title;
    factsEl.textContent = c.facts;
    defenseEl.textContent = c.defense;
    btnsEl.hidden = false;
    judgEl.hidden = true;
  }

  function judge(v) {
    const c = CASES[order[pos % order.length]];
    judged += 1;
    const ok = v === c.verdict;
    if (ok) matched += 1;
    document.getElementById("judg-match").textContent = ok
      ? "⚖️ あなたの判断は、当裁判所と一致しました。"
      : "⚖️ 当裁判所は、あなたと異なる判断をしました。控訴は受け付けておりません。";
    document.getElementById("judg-match").className = `match ${ok ? "ok" : "ng"}`;
    document.getElementById("judg-main").textContent = c.main;
    document.getElementById("judg-reason").textContent = c.reason;
    btnsEl.hidden = true;
    judgEl.hidden = false;
    scoreEl.textContent = `一致率 ${matched} / ${judged}　${title(matched / judged)}`;
  }

  function title(rate) {
    if (judged < 3) return "";
    if (rate >= 0.9) return "称号：どうでもいい最高裁判所長官";
    if (rate >= 0.6) return "称号：ベテラン裁判官";
    if (rate >= 0.3) return "称号：見習い裁判官";
    return "称号：独自の法解釈をもつ人";
  }

  btnsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]");
    if (b) judge(b.dataset.v);
  });
  document.getElementById("btn-next-case").addEventListener("click", () => {
    pos += 1;
    show();
    document.getElementById("case").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  show();
})();
