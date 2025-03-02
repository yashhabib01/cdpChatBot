const CDP_KEYWORDS = {
  segment: ["segment", "segment.com"],
  mparticle: ["mparticle", "mparticle.com"],
  lytics: ["lytics", "lytics.com"],
  zeotap: ["zeotap", "zeotap.com"],
};

const CDP_DOCS = {
  segment: "https://segment.com/docs/",
  mparticle: "https://docs.mparticle.com/",
  lytics: "https://docs.lytics.com/",
  zeotap: "https://docs.zeotap.com/home/en-us/",
};

const HOW_TO_KEYWORDS = [
  "how",
  "how to",
  "how do i",
  "how can i",
  "steps to",
  "guide",
];

function classifyQuery(query) {
  const lowercaseQuery = query.toLowerCase();

  // Check if it's a how-to question
  const isHowTo = HOW_TO_KEYWORDS.some((keyword) =>
    lowercaseQuery.includes(keyword)
  );

  // Identify CDP platform
  let cdpPlatform = null;
  let docUrl = null;

  for (const [platform, keywords] of Object.entries(CDP_KEYWORDS)) {
    if (keywords.some((keyword) => lowercaseQuery.includes(keyword))) {
      cdpPlatform = platform;
      docUrl = CDP_DOCS[platform];
      break;
    }
  }

  return {
    isCdpRelated: cdpPlatform !== null,
    isHowTo,
    cdpPlatform,
    docUrl,
  };
}

module.exports = { classifyQuery };
