const fs = require("fs");
const path = require("path");

class DocumentIndexer {
  constructor() {
    this.dataDir = path.join(__dirname, "../data");
    this.platformFiles = {
      segment: "segment.json",
      mparticle: "mparticle.json",
      lytics: "lytics.json",
      zeotap: "zeotap.json",
    };
  }

  loadPlatformDocs(platform) {
    const filename = this.platformFiles[platform.toLowerCase()];
    if (!filename) return null;

    try {
      const filePath = path.join(this.dataDir, filename);
      const platformData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return platformData;
    } catch (error) {
      console.error(`Error loading ${platform} documentation:`, error);
      return null;
    }
  }

  cleanQuery(query) {
    // Remove special characters and extra spaces
    const cleanedQuery = query
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove all special characters except hyphens
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces

    // Expanded stop words list
    const stopWords = [
      // Question words
      "how",
      "what",
      "why",
      "when",
      "where",
      "which",
      "who",
      "whose",
      "whom",

      // Common verbs
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "do",
      "does",
      "did",
      "doing",
      "done",
      "can",
      "could",
      "will",
      "would",
      "shall",
      "should",
      "have",
      "has",
      "had",
      "having",
      "may",
      "might",
      "must",

      // Articles
      "a",
      "an",
      "the",

      // Prepositions
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "about",
      "into",
      "through",
      "after",
      "over",
      "between",
      "out",
      "against",
      "during",
      "without",
      "before",
      "under",
      "around",
      "among",

      // Conjunctions
      "and",
      "or",
      "but",
      "nor",
      "yet",
      "so",

      // Personal pronouns
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "its",
      "our",
      "their",
      "mine",
      "yours",
      "hers",
      "ours",
      "theirs",

      // Common filler words
      "please",
      "tell",
      "show",
      "want",
      "need",
      "like",
      "help",
      "way",
      "make",
      "made",
      "just",
      "now",
      "get",
      "got",
      "getting",
      "very",
      "really",
      "much",
      "many",
      "some",
      "any",

      // Question helpers
      "can",
      "will",
      "should",
      "would",
      "could",
      "do",
      "does",
      "did",
      "am",
      "is",
      "are",
      "was",
      "were",
    ];

    return cleanedQuery
      .split(" ")
      .filter((word) => !stopWords.includes(word))
      .join(" ");
  }

  findRelevantContent(query, platform) {
    const platformData = this.loadPlatformDocs(platform);
    if (!platformData || !platformData.pages) return null;

    const cleanedQuery = this.cleanQuery(query);
    const keywords = cleanedQuery.split(" ");
    let bestMatch = {
      url: "",
      title: "",
      content: {
        headings: {},
        paragraphs: [],
        lists: {},
        codeBlocks: [],
      },
      score: 0,
    };

    platformData.pages.forEach((page) => {
      let matchScore = 0;

      // URL and title matching
      if (page.url.toLowerCase().includes(keywords.join("-"))) {
        matchScore += 3;
      }
      if (page.title.toLowerCase().includes(keywords.join(" "))) {
        matchScore += 3;
      }

      // Heading matching
      Object.entries(page.headings).forEach(([level, headers]) => {
        headers.forEach((header) => {
          if (
            keywords.some((keyword) => header.toLowerCase().includes(keyword))
          ) {
            matchScore += 2;
          }
        });
      });

      // Paragraph matching
      page.paragraphs.forEach((para) => {
        if (keywords.some((keyword) => para.toLowerCase().includes(keyword))) {
          matchScore += 1;
        }
      });

      // List content matching
      Object.values(page.lists).forEach((listArray) => {
        listArray.forEach((item) => {
          if (
            keywords.some((keyword) => item.toLowerCase().includes(keyword))
          ) {
            matchScore += 1;
          }
        });
      });

      if (matchScore > bestMatch.score) {
        bestMatch = {
          url: page.url,
          title: page.title,
          content: {
            headings: page.headings,
            paragraphs: page.paragraphs,
            lists: page.lists,
            codeBlocks: page.codeBlocks,
          },
          score: matchScore,
        };
      }
    });

    return bestMatch.score > 0 ? bestMatch : null;
  }
}

module.exports = new DocumentIndexer();
