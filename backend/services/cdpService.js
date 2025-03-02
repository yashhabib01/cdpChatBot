const axios = require("axios");
const dotenv = require("dotenv");
const documentIndexer = require("./documentIndexer");

// Load env variables if not already loaded
dotenv.config();

class CdpService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  }

  formatContentForPrompt(content) {
    let formattedContent = "";

    // Add headings
    Object.entries(content.headings).forEach(([level, headers]) => {
      if (headers.length > 0) {
        formattedContent += `\n${level.toUpperCase()}:\n${headers.join(
          "\n"
        )}\n`;
      }
    });

    // Add paragraphs
    if (content.paragraphs.length > 0) {
      formattedContent += "\nContent:\n" + content.paragraphs.join("\n");
    }

    // Add lists
    if (content.lists.unordered?.length > 0) {
      formattedContent +=
        "\nRelated Topics:\n- " + content.lists.unordered.join("\n- ");
    }
    if (content.lists.ordered?.length > 0) {
      formattedContent += "\nSteps:\n1. " + content.lists.ordered.join("\n2. ");
    }

    // Add code blocks if any
    if (content.codeBlocks?.length > 0) {
      formattedContent +=
        "\nCode Examples:\n```\n" +
        content.codeBlocks.join("\n```\n```\n") +
        "\n```";
    }

    return formattedContent;
  }

  async generateCdpResponse(query, cdpInfo) {
    try {
      const relevantContent = documentIndexer.findRelevantContent(
        query,
        cdpInfo.cdpPlatform
      );

      let prompt = `Question: ${query}\nPlatform: ${cdpInfo.cdpPlatform}\n`;

      if (relevantContent) {
        prompt += `
          Using the following documentation from ${relevantContent.url}:
          Title: ${relevantContent.title}
          ${this.formatContentForPrompt(relevantContent.content)}
          
          Please provide a clear, structured response that addresses the question.
          Format the response with:
          1. Proper markdown for headings
          2. Code blocks where applicable
          3. Bullet points for lists
          4. Step-by-step instructions when relevant
        `;
      } else {
        prompt += `\nNo specific documentation found. Please provide a general response about ${cdpInfo.cdpPlatform} CDP platform.`;
      }

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating CDP response:", error);
      throw error;
    }
  }
}

module.exports = new CdpService();
