module.exports = async function handler(_req, res) {
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return res.status(200).json({ models: [] });
    const json = await response.json();
    const models = (json.models || []).map((item) => item.name).filter(Boolean);
    res.status(200).json({ models });
  } catch {
    res.status(200).json({ models: [] });
  }
};
