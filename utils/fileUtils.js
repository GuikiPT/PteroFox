const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');

/**
 * @param {string} folderPath
 * @param {string[]} [exclusions=[]]
 * @param {boolean} [recursive=false]
 * @returns {string[]}
 */
function listFiles(folderPath, exclusions = [], recursive = false) {
  if (!fs.existsSync(folderPath)) {
    console.warn(`Directory not found: ${folderPath}`);
    return [];
  }

  if (!fs.lstatSync(folderPath).isDirectory()) {
    console.warn(`Path is not a directory: ${folderPath}`);
    return [];
  }

  const files = [];

  for (const file of fs.readdirSync(folderPath)) {
    const filePath = path.join(folderPath, file);
    const stats = fs.lstatSync(filePath);

    if (stats.isDirectory()) {
      if (recursive) {
        files.push(...listFiles(filePath, exclusions, recursive));
      }
    } else if (file.endsWith('.js')) {
      if (!micromatch.isMatch(file, exclusions)) {
        files.push(filePath);
      }
    }
  }

  return files;
}

module.exports = { listFiles };
