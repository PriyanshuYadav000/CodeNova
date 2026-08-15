const normalizeProblemTitle = (title) => title.trim().toLowerCase().replace(/\s+/g, " ");

module.exports = normalizeProblemTitle;
