// api/parse-pdf.js — handles PDF, images, and any base64 content

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { base64, prompt, media_type = "application/pdf" } = req.body;
  if (!base64 || !prompt) return res.status(400).json({ error: "Missing base64 or prompt" });

  const isImage = media_type.startsWith("image/");

  const contentItem = isImage
    ? { type: "image", source: { type: "base64", media_type, data: base64 } }
    : { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages: [{ role: "user", content: [contentItem, { type: "text", text: prompt }] }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content.map(b => b.text || "").join("");
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
