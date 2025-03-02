const express = require("express");
const router = express.Router();
const { classifyQuery } = require("../utils/queryClassifier");
const cdpService = require("../services/cdpService");
const llmService = require("../services/llmService");

router.post("/chat", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const classification = classifyQuery(query);
    let response;

    if (classification.isCdpRelated) {
      response = await cdpService.generateCdpResponse(query, classification);
    } else {
      response = await llmService.generateResponse(query);
    }

    res.json({
      query,
      classification,
      response,
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
