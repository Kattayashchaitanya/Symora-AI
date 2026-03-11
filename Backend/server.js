require("dotenv").config();
const express = require("express");
const cors = require("cors");

const triageRoute = require("./routes/triage");
const reportsRoute = require("./routes/reports");
const chatRoute = require("./routes/chat");
const { router: authRoute } = require("./routes/auth");
const analyticsRoute = require("./routes/analytics");

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use("/api/auth", authRoute);
app.use("/api/triage", triageRoute);
app.use("/api/reports", reportsRoute);
app.use("/api/chat", chatRoute);
app.use("/api/analytics", analyticsRoute);

app.get("/", (req, res) => {
  res.json({
    message: "SymoraAI API running",
    status: "ok",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});