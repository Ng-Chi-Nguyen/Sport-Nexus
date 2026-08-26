export default async function handler(req, res) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return res.status(500).json({ error: "BACKEND_URL not configured" });
  }

  const targetUrl = `${backendUrl}${req.url}`;

  const headers = { ...req.headers };
  delete headers.host;
  headers["host"] = new URL(backendUrl).host;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ["POST", "PUT", "PATCH"].includes(req.method)
        ? await readBody(req)
        : undefined,
    });

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
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
