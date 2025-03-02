const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const path = require("path");

class DocumentationFetcher {
  constructor() {
    this.sources = {
      segment: {
        baseUrl: "https://segment.com/docs/",
        name: "Segment",
        urlLimit: 300,
      },
      mparticle: {
        baseUrl: "https://docs.mparticle.com/",
        name: "mParticle",
        urlLimit: 300,
      },
      lytics: {
        baseUrl: "https://docs.lytics.com/",
        name: "Lytics",
        urlLimit: 300,
      },
      zeotap: {
        baseUrl: "https://docs.zeotap.com/",
        name: "Zeotap",
        urlLimit: 300,
      },
    };
    this.visitedUrls = new Map();
    this.platformData = {};
    // Create data directory if it doesn't exist
    this.dataDir = path.join(__dirname, "data");
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error("Error creating data directory:", error);
    }
  }

  async fetchAllDocumentation() {
    for (const [platform, source] of Object.entries(this.sources)) {
      try {
        console.log(`Starting to fetch ${source.name} documentation...`);
        this.platformData[platform] = [];
        this.visitedUrls.set(platform, new Set());

        await this.crawlDocumentation(source.baseUrl, platform);

        // Log platform statistics
        const platformUrls = this.visitedUrls.get(platform);
        console.log(`\n${platform} Statistics:`);
        console.log(`Total URLs fetched: ${platformUrls.size}`);
        console.log(`URL limit: ${source.urlLimit}`);
        console.log("-------------------");

        await this.savePlatformData(platform);
      } catch (error) {
        console.error(
          `Error fetching ${source.name} documentation:`,
          error.message
        );
      }
    }
  }

  async crawlDocumentation(url, platform) {
    const platformUrls = this.visitedUrls.get(platform);
    const baseUrl = this.sources[platform].baseUrl;

    // Check URL limit and if URL starts with the correct base URL
    if (
      platformUrls.size >= this.sources[platform].urlLimit ||
      !url.startsWith(baseUrl)
    ) {
      return;
    }

    try {
      platformUrls.add(url);

      console.log(`\nCrawling: ${url}`);
      console.log(`Platform: ${platform}`);
      console.log(
        `URLs fetched for ${platform}: ${platformUrls.size}/${this.sources[platform].urlLimit}`
      );

      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      });
      const $ = cheerio.load(response.data);

      // Extract page data
      const pageData = {
        url,
        platform,
        title: $("h1").first().text().trim(),
        headings: {
          h1: $("h1")
            .map((_, el) => $(el).text().trim())
            .get(),
          h2: $("h2")
            .map((_, el) => $(el).text().trim())
            .get(),
          h3: $("h3")
            .map((_, el) => $(el).text().trim())
            .get(),
          h4: $("h4")
            .map((_, el) => $(el).text().trim())
            .get(),
        },
        paragraphs: $("p")
          .map((_, el) => $(el).text().trim())
          .get(),
        lists: {
          unordered: $("ul li")
            .map((_, el) => $(el).text().trim())
            .get(),
          ordered: $("ol li")
            .map((_, el) => $(el).text().trim())
            .get(),
        },
        tables: $("table")
          .map((_, el) => ({
            headers: $(el)
              .find("th")
              .map((_, th) => $(th).text().trim())
              .get(),
            rows: $(el)
              .find("td")
              .map((_, td) => $(td).text().trim())
              .get(),
          }))
          .get(),
        codeBlocks: $("pre code, .code-block")
          .map((_, el) => $(el).text().trim())
          .get(),
        timestamp: new Date().toISOString(),
      };

      this.platformData[platform].push(pageData);

      if (platformUrls.size < this.sources[platform].urlLimit) {
        const links = this.extractLinks($, url, platform);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limiting

        for (const link of links) {
          await this.crawlDocumentation(link, platform);
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error.message);
    }
  }

  extractContent($) {
    // Remove navigation, footer, etc.
    $(".navigation, .footer, .sidebar").remove();

    // Get main content
    return {
      text: $("main, .content, article").text().trim(),
      headings: $("h1, h2, h3, h4")
        .map((_, el) => $(el).text().trim())
        .get(),
      codeBlocks: $("pre code")
        .map((_, el) => $(el).text().trim())
        .get(),
    };
  }

  extractLinks($, baseUrl, platform) {
    const links = new Set();
    const platformUrls = this.visitedUrls.get(platform);
    const platformBaseUrl = this.sources[platform].baseUrl;

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).toString();
          const urlWithoutHash = absoluteUrl.split("#")[0];

          if (
            absoluteUrl.startsWith(platformBaseUrl) &&
            !platformUrls.has(absoluteUrl) &&
            platformUrls.size < this.sources[platform].urlLimit
          ) {
            links.add(absoluteUrl);
          }
        } catch (error) {
          // Skip invalid URLs
        }
      }
    });
    return Array.from(links);
  }

  async savePlatformData(platform) {
    try {
      const filepath = path.join(this.dataDir, `${platform}.json`);
      const dataToStore = {
        platform,
        baseUrl: this.sources[platform].baseUrl,
        totalPages: this.platformData[platform].length,
        lastUpdated: new Date().toISOString(),
        pages: this.platformData[platform],
      };

      await fs.writeFile(
        filepath,
        JSON.stringify(dataToStore, null, 2),
        "utf8"
      );

      console.log(
        `Saved ${platform} data with ${dataToStore.totalPages} pages to: ${filepath}`
      );
    } catch (error) {
      console.error(`Error saving ${platform} data:`, error.message);
    }
  }
}

// Create a run function
const run = async () => {
  try {
    const fetcher = new DocumentationFetcher();
    await fetcher.fetchAllDocumentation();
    console.log("Documentation fetching completed!");
    console.log(`Total unique URLs processed: ${fetcher.visitedUrls.size}`);
  } catch (error) {
    console.error("Error in fetching process:", error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  run();
}

module.exports = DocumentationFetcher;
