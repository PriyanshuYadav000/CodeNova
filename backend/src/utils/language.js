const AppError = require("./AppError");

const LANGUAGE_REGISTRY = {
  cpp: {
    label: "C++",
    judge0Id: 54,
    aliases: ["cpp", "c++"],
  },

  java: {
    label: "Java",
    judge0Id: 62,
    aliases: ["java"],
  },

  javascript: {
    label: "JavaScript",
    judge0Id: 63,
    aliases: ["javascript", "js"],
  },
};

const ALIAS_TO_CANONICAL = {};

for (const [canonical, config] of Object.entries(LANGUAGE_REGISTRY)) {
  for (const alias of config.aliases) {
    ALIAS_TO_CANONICAL[alias.toLowerCase()] = canonical;
  }
}

const normalizeLanguage = (language) => {
  if (typeof language !== "string") {
    throw new AppError(
      "Unsupported language.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const normalized = language.trim().toLowerCase();
  const canonical = ALIAS_TO_CANONICAL[normalized];

  if (!canonical) {
    throw new AppError(
      "Unsupported language.",
      400,
      "VALIDATION_ERROR"
    );
  }

  return canonical;
};

const getLanguageById = (language) => {
  const canonical = normalizeLanguage(language);

  return LANGUAGE_REGISTRY[canonical].judge0Id;
};

const getLanguageLabel = (language) => {
  const canonical = normalizeLanguage(language);

  return LANGUAGE_REGISTRY[canonical].label;
};

const getSupportedLanguages = () =>
  Object.entries(LANGUAGE_REGISTRY).map(
    ([value, config]) => ({
      value,
      label: config.label,
    })
  );

module.exports = {
  LANGUAGE_REGISTRY,
  normalizeLanguage,
  getLanguageById,
  getLanguageLabel,
  getSupportedLanguages,
};