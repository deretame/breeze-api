import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/release", async (req, res) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  // Express 中获取 query 参数直接用 req.query
  const { path } = req.query;

  const safePattern =
    /^\/repos\/[\w.-]+\/Breeze-plugin-[\w.-]+\/releases\/latest$/i;

  if (!path || !safePattern.test(path)) {
    return res.status(403).json({ error: "Access Denied" });
  }

  try {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Breeze-Proxy",
      },
    });

    const data = await response.json();

    // 缓存设置（Zeabur 如果配合 Cloudflare 使用依然有效）
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Error" });
  }
});

// 根目录给个提示，防止访问时 404
app.get("/", (req, res) => {
  res.send("Breeze API Proxy is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
