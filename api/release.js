export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
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

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal Error" });
  }
}
