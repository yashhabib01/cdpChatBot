const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", chatRoutes);
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
