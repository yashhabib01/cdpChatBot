const axios = require("axios");
const dotenv = require("dotenv");

// Load env variables if not already loaded
dotenv.config();

class LlmService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  }

  async generateResponse(query) {
    try {
      if (!query) {
        throw new Error("Query is required");
      }

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: query }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response format from API");
      }

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating response:", error.message);
      if (error.response) {
        console.error("API Response:", error.response.data);
      }
      return "I apologize, but I encountered an error processing your request. Please try again.";
    }
  }
}

module.exports = new LlmService();
