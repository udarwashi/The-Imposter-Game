/**
 * Every piece of UI copy in the game, in both languages.
 *
 * `Strings` is the contract: adding a key here is a type error until BOTH
 * locales define it, which is the only reliable way to stop one language
 * silently drifting behind the other.
 *
 * Anything that interpolates a value is a function rather than a template with
 * placeholders — word order differs between Arabic and English, and a function
 * lets each locale put the number wherever its own grammar wants it.
 *
 * Category names and the word bank are NOT here: they live next to the data
 * they label, in `assets/data/categories.ts` and `assets/data/words.json`.
 */

export type Lang = "ar" | "en";

/** Display order of the language switcher. Arabic first — it is the default. */
export const LANGS: readonly Lang[] = ["ar", "en"] as const;

/** Short label for the language toggle, written in the language it selects. */
export const LANG_LABEL: Record<Lang, string> = { ar: "ع", en: "EN" };

/** Which languages read right-to-left. Drives every direction-aware style. */
export const LANG_RTL: Record<Lang, boolean> = { ar: true, en: false };

export type Strings = {
  // ---------------------------------------------------------------- app-wide
  appName: string;
  tagline: string;
  loading: string;
  /** Stand-in initial for a player whose name starts with whitespace. */
  unknownInitial: string;

  // -------------------------------------------------------------- home screen
  play: string;
  howToPlayTitle: string;
  howToPlayBody: string;
  savedSquad: (players: number, categories: number) => string;
  a11yMute: string;
  a11yUnmute: string;
  a11ySwitchLang: string;

  // -------------------------------------------------------- categories screen
  categoriesTitle: string;
  categoriesSubtitle: string;
  stepCategories: string;
  selectAll: string;
  clearAll: string;
  pickAtLeastOne: string;
  nextPlayers: string;
  /** "3 of 7" under a group header. */
  ofTotal: (on: number, total: number) => string;

  // ----------------------------------------------------------- players screen
  playersTitle: string;
  playersSubtitle: string;
  stepPlayers: string;
  playerNamePlaceholder: string;
  a11yAddPlayer: string;
  a11yEditPlayer: (name: string) => string;
  playersCount: (n: number) => string;
  categoriesCount: (n: number) => string;
  reorderHint: string;
  addAtLeast: (n: number) => string;
  turnNumber: (n: number) => string;
  startRound: string;
  needMorePlayers: (n: number) => string;

  // ------------------------------------------------------------ reveal screen
  revealStage: (index: number, total: number) => string;
  upNext: string;
  passPhoneHint: string;
  playerLabel: string;
  showWord: string;
  youAreImposter: string;
  imposterHint: string;
  memoriseHint: string;
  next: string;
  startDiscussion: string;
  endRound: string;

  // -------------------------------------------------------- discussion screen
  votingStage: string;
  whoIsImposter: string;
  discussionNote: string;
  categoryLabel: string;
  imposterWas: string;
  wordWas: string;
  revealImposter: string;
  newRound: string;
  backToPlayers: string;

  // ------------------------------------------------------------------ dialogs
  confirmTitle: string;
  yes: string;
  cancel: string;
  ok: string;
  endRoundBody: string;
  endRoundConfirm: string;
  revealImposterBody: string;
  revealImposterConfirm: string;
  editPlayerTitle: string;
  save: string;
  delete: string;

  // ------------------------------------------------------------- validation
  holdOn: string;
  needThreePlayers: (n: number) => string;
  needOneCategory: string;
  errorTitle: string;
  wordListTooSmall: (category: string) => string;

  // ------------------------------------------------------------------ shared
  a11yBack: string;
};

const ar: Strings = {
  appName: "المندس",
  tagline: "كلمة واحدة يعرفها الجميع… إلا واحد",
  loading: "جاري التحميل…",
  unknownInitial: "؟",

  play: "ابدأ اللعب",
  howToPlayTitle: "كيف نلعب؟",
  howToPlayBody:
    "كل اللاعبين يشوفوا نفس الكلمة… إلا واحد، هو المندس.\n\n" +
    "١. اختاروا الفئات وأضيفوا اللاعبين.\n" +
    "٢. مرروا الجوال، وكل واحد يشوف دوره لوحده.\n" +
    "٣. بالتناوب، كل واحد يوصف الكلمة بكلمة أو كلمتين — بدون ما يقولها.\n" +
    "٤. المندس ما يعرف الكلمة، فلازم يتمثّل ويخمّن.\n" +
    "٥. تناقشوا وصوّتوا: من المندس؟",
  savedSquad: (p, c) => `${p} لاعبين و${c} فئة محفوظة`,
  a11yMute: "كتم الصوت",
  a11yUnmute: "تشغيل الصوت",
  a11ySwitchLang: "التبديل إلى الإنجليزية",

  categoriesTitle: "اختر الفئات",
  categoriesSubtitle: "كل فئة تفتحها تزيد تنوّع الكلمات",
  stepCategories: "١ / ٢",
  selectAll: "تحديد الكل",
  clearAll: "مسح الكل",
  pickAtLeastOne: "اختر فئة واحدة على الأقل",
  nextPlayers: "التالي · اللاعبون",
  ofTotal: (on, total) => `${on} من ${total}`,

  playersTitle: "اللاعبون",
  playersSubtitle: "الترتيب هو ترتيب الكشف",
  stepPlayers: "٢ / ٢",
  playerNamePlaceholder: "اسم اللاعب",
  a11yAddPlayer: "إضافة لاعب",
  a11yEditPlayer: (name) => `تعديل ${name}`,
  playersCount: (n) => `${n} لاعبين`,
  categoriesCount: (n) => `${n} فئة`,
  reorderHint: "اسحب من المقبض لتغيير ترتيب الأدوار",
  addAtLeast: (n) => `أضف ${n} لاعبين على الأقل للبدء`,
  turnNumber: (n) => `الدور ${n}`,
  startRound: "ابدأ جولة جديدة",
  needMorePlayers: (n) => `تحتاج ${n} لاعبين إضافيين`,

  revealStage: (i, total) => `مرحلة الكشف · ${i} من ${total}`,
  upNext: "الدور على",
  passPhoneHint: "سلّم الجوال لهذا اللاعب، واضغط عندما يكون جاهزًا",
  playerLabel: "اللاعب",
  showWord: "عرض الكلمة",
  youAreImposter: "أنت المندس",
  imposterHint: "لا تعرف الكلمة — جاري وحاول ما ينكشف عليك",
  memoriseHint: "احفظها، ثم اضغط “التالي” وسلّم الجوال للي بعدك",
  next: "التالي",
  startDiscussion: "ابدأ النقاش",
  endRound: "إنهاء الجولة",

  votingStage: "مرحلة التصويت",
  whoIsImposter: "مين المندس؟",
  discussionNote: "كل اللاعبين شافوا أدوارهم. تناقشوا، وصوّتوا على اللي تشكّون فيه.",
  categoryLabel: "الفئة",
  imposterWas: "المندس كان",
  wordWas: "والكلمة كانت",
  revealImposter: "عرض المندس",
  newRound: "جولة جديدة",
  backToPlayers: "رجوع للاعبين",

  confirmTitle: "تأكيد",
  yes: "نعم",
  cancel: "إلغاء",
  ok: "تمام",
  endRoundBody: "هل تريد فعلاً إنهاء الجولة والرجوع للإعداد؟ سيتم فقدان الجولة الحالية.",
  endRoundConfirm: "نعم، إنهاء",
  revealImposterBody: "هل تريد فعلاً عرض المندس؟",
  revealImposterConfirm: "نعم، عرض",
  editPlayerTitle: "تعديل اللاعب",
  save: "حفظ",
  delete: "حذف",

  holdOn: "سلامات صاحبي",
  needThreePlayers: (n) => `لازم ${n} لاعبين على الأقل.`,
  needOneCategory: "اختر فئة واحدة على الأقل.",
  errorTitle: "خطأ",
  wordListTooSmall: (category) => `قائمة كلمات فئة ${category} صغيرة جدًا.`,

  a11yBack: "رجوع",
};

/** English pluralisation, kept tiny — every case here is a regular noun. */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const en: Strings = {
  appName: "The Imposter",
  tagline: "One word everyone knows… except one of you",
  loading: "Loading…",
  unknownInitial: "?",

  play: "Start Playing",
  howToPlayTitle: "How to Play",
  howToPlayBody:
    "Everyone sees the same word… except one player — the imposter.\n\n" +
    "1. Pick your categories and add the players.\n" +
    "2. Pass the phone around, and each player looks at their card alone.\n" +
    "3. Take turns describing the word in a word or two — without ever saying it.\n" +
    "4. The imposter doesn't know the word, so they have to bluff and guess.\n" +
    "5. Talk it out and vote: who is the imposter?",
  savedSquad: (p, c) => `${plural(p, "player", "players")} and ${plural(c, "category", "categories")} saved`,
  a11yMute: "Mute sound",
  a11yUnmute: "Unmute sound",
  a11ySwitchLang: "Switch to Arabic",

  categoriesTitle: "Pick Categories",
  categoriesSubtitle: "Every category you switch on adds more words",
  stepCategories: "1 / 2",
  selectAll: "Select all",
  clearAll: "Clear all",
  pickAtLeastOne: "Pick at least one category",
  nextPlayers: "Next · Players",
  ofTotal: (on, total) => `${on} of ${total}`,

  playersTitle: "Players",
  playersSubtitle: "This order is the reveal order",
  stepPlayers: "2 / 2",
  playerNamePlaceholder: "Player name",
  a11yAddPlayer: "Add player",
  a11yEditPlayer: (name) => `Edit ${name}`,
  playersCount: (n) => plural(n, "player", "players"),
  categoriesCount: (n) => plural(n, "category", "categories"),
  reorderHint: "Drag the handle to change the turn order",
  addAtLeast: (n) => `Add at least ${plural(n, "player", "players")} to start`,
  turnNumber: (n) => `Turn ${n}`,
  startRound: "Start a New Round",
  needMorePlayers: (n) => `Need ${plural(n, "more player", "more players")}`,

  revealStage: (i, total) => `Reveal · ${i} of ${total}`,
  upNext: "Up next",
  passPhoneHint: "Hand the phone to this player, then tap when they are ready",
  playerLabel: "Player",
  showWord: "Show the Word",
  youAreImposter: "You're the Imposter",
  imposterHint: "You don't know the word — play along and don't get caught",
  memoriseHint: "Memorize it, then tap “Next” and pass the phone on",
  next: "Next",
  startDiscussion: "Start the Discussion",
  endRound: "End Round",

  votingStage: "Voting round",
  whoIsImposter: "Who's the Imposter?",
  discussionNote: "Everyone has seen their card. Talk it out, then vote for whoever you suspect.",
  categoryLabel: "Category",
  imposterWas: "The imposter was",
  wordWas: "And the word was",
  revealImposter: "Reveal the Imposter",
  newRound: "New Round",
  backToPlayers: "Back to Players",

  confirmTitle: "Confirm",
  yes: "Yes",
  cancel: "Cancel",
  ok: "Got it",
  endRoundBody: "End this round and go back to setup? The current round will be lost.",
  endRoundConfirm: "Yes, end it",
  revealImposterBody: "Reveal the imposter now?",
  revealImposterConfirm: "Yes, reveal",
  editPlayerTitle: "Edit Player",
  save: "Save",
  delete: "Delete",

  holdOn: "Hold on",
  needThreePlayers: (n) => `You need at least ${plural(n, "player", "players")}.`,
  needOneCategory: "Pick at least one category.",
  errorTitle: "Error",
  wordListTooSmall: (category) => `The word list for “${category}” is too small.`,

  a11yBack: "Back",
};

export const STRINGS: Record<Lang, Strings> = { ar, en };
