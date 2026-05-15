const fs = require("node:fs/promises");
const path = require("node:path");

async function listHtml(dir) {
  try {
    const entries = await fs.readdir(path.join(process.cwd(), dir));
    return entries.filter((entry) => entry.endsWith(".html")).sort();
  } catch {
    return [];
  }
}

module.exports = async function handler(_req, res) {
  const demos = await listHtml("demos");
  const showcases = await fs
    .readdir(path.join(process.cwd(), "assets", "showcases"), { withFileTypes: true })
    .then((entries) => entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name))
    .catch(() => []);

  res.status(200).json({ repoRoot: process.cwd(), demos, showcases });
};
