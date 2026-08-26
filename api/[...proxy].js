module.exports = async function handler(req, res) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return res.status(500).json({ error: "BACKEND_URL not configured" });
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const targetUrl = `${backendUrl}${url.pathname}${url.search}`;

  const headers = { ...req.headers };
  delete headers.host;
  headers["host"] = new URL(backendUrl).host;

  try {
    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      fetchOptions.body = Buffer.concat(chunks);
    }

    const response = await fetch(targetUrl, fetchOptions);

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else if (contentType.includes("text/")) {
      const text = await response.text();
      res.send(text);
    } else {
      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    }
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(502).json({ error: "Backend unreachable", detail: error.message });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
