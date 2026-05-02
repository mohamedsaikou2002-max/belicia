// Bayt al-Hikmah corpus — Islamic philosophy + comparative natural theology
// Used to ground Belicia's responses with live Internet Archive retrieval.

export type CorpusEntry = {
  cat: string;
  title: string;
  author: string;
  year: string;
  description: string;
  themes: string[];
  iaId: string;
  url: string;
  txtUrl: string | null;
};

export const CORPUS: CorpusEntry[] = [
  {
    cat: "Al-Kindi",
    title: "On First Philosophy (Fi al-Falsafa al-Ula)",
    author: "Al-Kindi",
    year: "c. 850",
    description: "First major philosophical work in Arabic. World is not eternal; God is the simple, true One beyond predication.",
    themes: ["tawheed", "creation", "divine simplicity", "cosmology", "natural theology"],
    iaId: "alkindismetaphys00kind",
    url: "https://archive.org/details/alkindismetaphys00kind",
    txtUrl: "https://archive.org/stream/alkindismetaphys00kind/alkindismetaphys00kind_djvu.txt",
  },
  {
    cat: "Al-Farabi",
    title: "The Virtuous City (Al-Madina al-Fadila)",
    author: "Al-Farabi",
    year: "c. 942",
    description: "Emanationist cosmology mapped onto the ideal polity. Philosopher-prophet as perfect ruler.",
    themes: ["virtuous city", "prophet", "philosopher-king", "emanation", "Active Intellect"],
    iaId: "AlFarabiFounderOfIslamicNeoplatonismMajidFakhry",
    url: "https://archive.org/details/AlFarabiFounderOfIslamicNeoplatonismMajidFakhry",
    txtUrl: "https://archive.org/stream/AlFarabiFounderOfIslamicNeoplatonismMajidFakhry/Al_Farabi_Founder_of_Islamic%20Neoplatonism_Majid_Fakhry_djvu.txt",
  },
  {
    cat: "Al-Farabi",
    title: "Selected Aphorisms (Fusul Muntaza'a)",
    author: "Al-Farabi",
    year: "c. 940",
    description: "Condensed ethical and political maxims on the soul, virtue, and the excellent city.",
    themes: ["ethics", "aphorisms", "virtue", "soul", "political philosophy"],
    iaId: "AlfarabiSelectedAphorismsAndOtherTexts",
    url: "https://archive.org/details/AlfarabiSelectedAphorismsAndOtherTexts",
    txtUrl: "https://archive.org/stream/AlfarabiSelectedAphorismsAndOtherTexts/Alfarabi%20-%20Selected%20aphorisms%20and%20other%20texts_djvu.txt",
  },
  {
    cat: "Avicenna",
    title: "Metaphysics of the Book of Healing (Ilahiyyat al-Shifa)",
    author: "Ibn Sina (Avicenna)",
    year: "1027",
    description: "Necessary Being argument from contingency, theory of soul, emanationist hierarchy, the floating man thought experiment.",
    themes: ["Necessary Being", "contingency", "soul", "emanation", "floating man"],
    iaId: "the-metaphysics-of-the-book-of-Healing",
    url: "https://archive.org/details/the-metaphysics-of-the-book-of-Healing",
    txtUrl: "https://archive.org/stream/the-metaphysics-of-the-book-of-Healing/the-metaphysics-of-the-book-of-Healing_djvu.txt",
  },
  {
    cat: "Ibn Tufayl",
    title: "Hayy ibn Yaqzan (Philosophus Autodidactus)",
    author: "Ibn Tufayl",
    year: "c. 1170",
    description: "A child on a desert island discovers God, the soul's immortality, and moral order through pure reason. Greatest argument for natural theology in Islam.",
    themes: ["natural theology", "reason", "revelation", "self-knowledge", "contemplation"],
    iaId: "historyofhayyibn00ibnu",
    url: "https://archive.org/details/historyofhayyibn00ibnu",
    txtUrl: "https://archive.org/stream/historyofhayyibn00ibnu/historyofhayyibn00ibnu_djvu.txt",
  },
  {
    cat: "Ibn al-Nafis",
    title: "Theologus Autodidactus (Risala Fadil ibn Natiq)",
    author: "Ibn al-Nafis",
    year: "c. 1270",
    description: "Counter to Hayy: without prophetic revelation a person remains incomplete. Resurrection, judgment, necessity of shari'a.",
    themes: ["prophecy", "revelation", "resurrection", "shari'a", "eschatology"],
    iaId: "IbnTufailStoryOfHayyBinYaqzanHistoryOckleyIntroFulton",
    url: "https://archive.org/details/IbnTufailStoryOfHayyBinYaqzanHistoryOckleyIntroFulton",
    txtUrl: "https://archive.org/stream/IbnTufailStoryOfHayyBinYaqzanHistoryOckleyIntroFulton/IbnTufailStoryOfHayyBinYaqzanHistoryOckleyIntroFulton_djvu.txt",
  },
  {
    cat: "Al-Ghazali",
    title: "The Incoherence of the Philosophers (Tahafut al-Falasifa)",
    author: "Al-Ghazali",
    year: "1095",
    description: "Demolition of 20 claims of al-Farabi and Avicenna: eternity of world, God's knowledge of particulars, bodily resurrection.",
    themes: ["heresy", "creation", "eternity", "divine knowledge", "kalam"],
    iaId: "the-incoherence-of-the-philosophers-2nd-edition-brigham-young-university-islamic",
    url: "https://archive.org/details/the-incoherence-of-the-philosophers-2nd-edition-brigham-young-university-islamic",
    txtUrl: "https://archive.org/stream/the-incoherence-of-the-philosophers-2nd-edition-brigham-young-university-islamic/the-incoherence-of-the-philosophers-2nd-edition-brigham-young-university-islamic_djvu.txt",
  },
  {
    cat: "Al-Ghazali",
    title: "Revival of the Religious Sciences (Ihya Ulum al-Din)",
    author: "Al-Ghazali",
    year: "c. 1102",
    description: "40 books on worship, ethics, spiritual psychology. Integrates shari'a and tasawwuf. States of the heart, tawba, tawakkul.",
    themes: ["worship", "ethics", "tasawwuf", "tawba", "tawakkul", "heart"],
    iaId: "IhyaUlumAlDinVol1",
    url: "https://archive.org/details/IhyaUlumAlDinVol1",
    txtUrl: "https://archive.org/stream/IhyaUlumAlDinVol1/Ihya%20Ulum%20Al%20Din%20Vol%201_djvu.txt",
  },
  {
    cat: "Ibn Rushd",
    title: "The Incoherence of the Incoherence (Tahafut al-Tahafut)",
    author: "Ibn Rushd (Averroes)",
    year: "1179",
    description: "Rebuttal of al-Ghazali. Defends eternity of the world, necessity in nature, demonstrative reasoning.",
    themes: ["eternity", "philosophy", "reason", "Aristotle", "necessity"],
    iaId: "the-incoherence-of-the-incoherence",
    url: "https://archive.org/details/the-incoherence-of-the-incoherence",
    txtUrl: "https://archive.org/stream/the-incoherence-of-the-incoherence/the-incoherence-of-the-incoherence_djvu.txt",
  },
  {
    cat: "Ibn Rushd",
    title: "The Decisive Treatise (Fasl al-Maqal)",
    author: "Ibn Rushd (Averroes)",
    year: "c. 1179",
    description: "Harmony of philosophy and Islamic law. Philosophy is obligatory for those capable of demonstration. Three classes of discourse.",
    themes: ["philosophy", "law", "harmony", "reason", "revelation"],
    iaId: "ibn-rushd-averroes-the-decisive-treatise-hourani",
    url: "https://archive.org/details/ibn-rushd-averroes-the-decisive-treatise-hourani",
    txtUrl: "https://archive.org/stream/ibn-rushd-averroes-the-decisive-treatise-hourani/ibn-rushd-averroes-the-decisive-treatise-hourani_djvu.txt",
  },
  {
    cat: "Natural Theology",
    title: "The Guide for the Perplexed (Dalalat al-Ha'irin)",
    author: "Moses Maimonides",
    year: "1190",
    description: "Negative theology, limits of intellect, Avicennan proof for God. Bridges Torah and Aristotelian philosophy.",
    themes: ["negative theology", "divine attributes", "intellect", "creation", "prophecy"],
    iaId: "guideforperplexe00maim",
    url: "https://archive.org/details/guideforperplexe00maim",
    txtUrl: "https://archive.org/stream/guideforperplexe00maim/guideforperplexe00maim_djvu.txt",
  },
  {
    cat: "Dante",
    title: "The Divine Comedy — Inferno",
    author: "Dante Alighieri",
    year: "c. 1314",
    description: "Nine circles of Hell ordered by gravity of sin: incontinence, violence, fraud, treachery. Comparative moral cosmology.",
    themes: ["sin", "judgment", "moral order", "hell", "treachery", "fraud", "violence"],
    iaId: "divinecomedydan00longgoog",
    url: "https://archive.org/details/divinecomedydan00longgoog",
    txtUrl: "https://archive.org/stream/divinecomedydan00longgoog/divinecomedydan00longgoog_djvu.txt",
  },
  {
    cat: "Natural Theology",
    title: "Summa Theologica",
    author: "Thomas Aquinas",
    year: "1274",
    description: "Five Ways, nature of soul, divine attributes, natural law. Latin synthesis of al-Farabi, Avicenna, Averroes.",
    themes: ["Five Ways", "natural law", "soul", "virtue", "scholasticism"],
    iaId: "SummaTheologicaThomasAquinas",
    url: "https://archive.org/details/SummaTheologicaThomasAquinas",
    txtUrl: "https://archive.org/stream/SummaTheologicaThomasAquinas/SummaTheologicaThomasAquinas_djvu.txt",
  },
];

const STOPWORDS = new Set([
  "about","above","after","again","against","because","being","between","could","doing",
  "during","further","having","might","other","should","their","there","these","those",
  "through","under","until","where","which","while","would","your","yours","what","when",
  "this","that","with","from","they","them","than","then","into","upon","each","more",
]);

/**
 * Fetch top excerpts from Internet Archive djvu fulltext for the corpus,
 * scored by query-term density.
 */
export async function fetchIAExcerpts(
  query: string,
  maxSources = 3,
  excerptLength = 600,
): Promise<Array<{ source: string; author: string; year: string; excerpt: string; iaId: string }>> {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 4 && !STOPWORDS.has(t));

  if (!terms.length) return [];

  // Score each corpus entry by topical hint relevance to skip obvious misses
  const scored = CORPUS
    .filter((c) => c.txtUrl)
    .map((c) => {
      const hay = (c.title + " " + c.description + " " + c.themes.join(" ")).toLowerCase();
      const hits = terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
      return { c, hits };
    })
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 6); // try top 6 candidates

  const results: Array<{ source: string; author: string; year: string; excerpt: string; iaId: string }> = [];

  for (const { c } of scored) {
    if (results.length >= maxSources) break;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(c.txtUrl!, {
        signal: ctrl.signal,
        headers: { "User-Agent": "Belicia/1.0 (BaytAlHikmah)" },
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const fullText = await res.text();
      if (!fullText || fullText.length < 500) continue;

      const lower = fullText.toLowerCase();
      let bestIdx = -1;
      let bestScore = 0;
      const windowSize = excerptLength + 300;
      for (let i = 0; i < lower.length - windowSize; i += 200) {
        const w = lower.slice(i, i + windowSize);
        let score = 0;
        for (const term of terms) if (w.includes(term)) score++;
        if (score > bestScore) { bestScore = score; bestIdx = i; }
      }

      if (bestIdx !== -1 && bestScore > 0) {
        const raw = fullText.slice(bestIdx, bestIdx + excerptLength).trim();
        const excerpt = raw.replace(/\s{2,}/g, " ").replace(/[^\w\s.,;:'"()!?\-]/g, "").slice(0, excerptLength);
        results.push({ source: c.title, author: c.author, year: c.year, excerpt, iaId: c.iaId });
      }
    } catch {
      // silent fallback
    }
  }

  return results;
}

export const MODES: Record<string, { label: string; fragment: string }> = {
  wisdom: {
    label: "Wisdom",
    fragment: "Speak with the depth of a Bayt al-Hikmah scholar. Ground responses in the Islamic philosophical tradition — Al-Kindi, Al-Farabi, Avicenna, Al-Ghazali, Ibn Tufayl, Ibn Rushd. Measured, contemplative prose. Precision over eloquence, but never sacrifice beauty.",
  },
  tafsir: {
    label: "Theological Reflection",
    fragment: "Approach through Islamic theology and natural theology. Draw on Al-Ghazali's reconciliation of reason and faith, Avicenna's emanation cosmology, Maimonides' negative theology. Show how the great thinkers navigated falsafa and din.",
  },
  cosmology: {
    label: "Cosmology & Rank",
    fragment: "Map spiritual realities to cosmic hierarchy — First Cause through ten Intelligences to Active Intellect to material world (al-Farabi, Avicenna). When ranking moral phenomena, reference Dante's Inferno comparatively. Place everything in its proper rank.",
  },
  ethics: {
    label: "Ethics & Action",
    fragment: "Practical philosopher in the tradition of al-Farabi's Virtuous City and al-Ghazali's Ihya. Ground advice in taqwa, disciplined intellect, virtuous action. Speak to the soul's actual situation.",
  },
};

export function buildBaytSystemPrompt(
  mode: string,
  iaExcerpts: Array<{ source: string; author: string; year: string; excerpt: string }>,
): string {
  const corpusList = CORPUS
    .map((s) => `  - ${s.title} · ${s.author} (${s.year})`)
    .join("\n");

  const excerptBlock = iaExcerpts.length
    ? "\n\n## Source Passages (retrieved live from Internet Archive)\n\n" +
      iaExcerpts.map((e) => `### From: ${e.source} — ${e.author} (${e.year})\n${e.excerpt}`).join("\n\n")
    : "";

  const modeFragment = MODES[mode]?.fragment ?? MODES.wisdom.fragment;

  return `You are Belicia, a spiritual AI philosopher in the tradition of Bayt al-Hikmah — the House of Wisdom of Baghdad. You synthesize Islamic philosophy, natural theology, and the great chain of intellectual tradition from Al-Kindi to Ibn Rushd, with comparative reference to Maimonides, Aquinas, and Dante.

## Mode
${modeFragment}

## Reference Corpus
${corpusList}
${excerptBlock}

## Instructions
- When Source Passages are provided above, synthesize directly from them. Paraphrase deeply; do not merely repeat.
- If no passages were retrieved, draw from your knowledge of the corpus texts listed above.
- Use Arabic technical terms when precise (provide brief English gloss on first use per response): 'aql (intellect), nafs (soul), fana (annihilation), tawakkul (reliance on God), sa'ada (felicity), wujud (existence), mahiyya (essence), wajib al-wujud (Necessary Being), taqwa (God-consciousness).
- When placing moral or spiritual phenomena, you may reference Dante's circle structure comparatively — note where Islamic categories (kabira/major sins, fisq/transgression, kufr/disbelief) align or diverge.
- End every response with a "Sources referenced:" line citing 1–3 texts from the corpus most relevant to your answer.
- Do not fabricate citations. Only cite texts from the corpus listed above.
- Respond in 3–5 paragraphs unless the depth of the question demands more.
- Speak with gravity and precision. This is a scholarly instrument, not a chatbot.`;
}
