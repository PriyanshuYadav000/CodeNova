const validator = require("validator");
const AppError = require("../utils/AppError");

const supportedLanguages = new Set(["c++", "cpp", "java", "javascript"]);

const isPlainObject = (value) => (
  value !== null && typeof value === "object" && !Array.isArray(value)
);

const validationError = (details) => new AppError(
  "Validation failed.",
  400,
  "VALIDATION_ERROR",
  details
);

const addError = (details, field, message) => details.push({ field, message });

const rejectUnexpectedFields = (body, allowedFields, details) => {
  Object.keys(body).forEach((field) => {
    if (!allowedFields.includes(field)) {
      addError(details, field, "is not allowed");
    }
  });
};

const optionalTrimmedString = (body, field, maxLength, details, { required = false } = {}) => {
  const value = body[field];

  if (value === undefined || value === null) {
    if (required) addError(details, field, "is required");
    return undefined;
  }

  if (typeof value !== "string") {
    addError(details, field, "must be a string");
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    addError(details, field, "must not be empty");
    return undefined;
  }

  if (trimmed.length > maxLength) {
    addError(details, field, `must not exceed ${maxLength} characters`);
    return undefined;
  }

  return trimmed;
};

const validateRegistration = (body) => {
  const details = [];
  if (!isPlainObject(body)) throw validationError([{ field: "body", message: "must be an object" }]);
  rejectUnexpectedFields(body, ["firstName", "lastName", "emailId", "age", "password"], details);

  const firstName = optionalTrimmedString(body, "firstName", 20, details, { required: true });
  const lastName = optionalTrimmedString(body, "lastName", 20, details);
  const emailId = optionalTrimmedString(body, "emailId", 320, details, { required: true });
  const password = optionalTrimmedString(body, "password", 128, details, { required: true });
  let age;

  if (emailId && !validator.isEmail(emailId)) addError(details, "emailId", "must be a valid email address");
  if (password && !validator.isStrongPassword(password)) {
    addError(details, "password", "does not meet the required strength");
  }

  if (body.age !== undefined && body.age !== null && body.age !== "") {
    age = typeof body.age === "number" ? body.age : Number(body.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      addError(details, "age", "must be an integer between 1 and 120");
    }
  }

  if (details.length) throw validationError(details);
  return { firstName, ...(lastName ? { lastName } : {}), emailId: emailId.toLowerCase(), ...(age !== undefined ? { age } : {}), password };
};

const validateLogin = (body) => {
  const details = [];
  if (!isPlainObject(body)) throw validationError([{ field: "body", message: "must be an object" }]);
  rejectUnexpectedFields(body, ["emailId", "password"], details);
  const emailId = optionalTrimmedString(body, "emailId", 320, details, { required: true });
  const password = optionalTrimmedString(body, "password", 128, details, { required: true });
  if (emailId && !validator.isEmail(emailId)) addError(details, "emailId", "must be a valid email address");
  if (details.length) throw validationError(details);
  return { emailId: emailId.toLowerCase(), password };
};

const validateTestCases = (testCases, field, visible, details) => {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    addError(details, field, "must be a non-empty array");
    return [];
  }

  return testCases.map((testCase, index) => {
    const path = `${field}[${index}]`;
    if (!isPlainObject(testCase)) {
      addError(details, path, "must be an object");
      return null;
    }

    const allowed = visible ? ["input", "output", "explanation"] : ["input", "output"];
    rejectUnexpectedFields(testCase, allowed, details);
    const input = optionalTrimmedString(testCase, "input", 10_000, details, { required: true });
    const output = optionalTrimmedString(testCase, "output", 10_000, details, { required: true });
    const explanation = visible ? optionalTrimmedString(testCase, "explanation", 10_000, details) : undefined;

    return { input, output, ...(visible && explanation ? { explanation } : {}) };
  });
};

const validateCodeEntries = (entries, field, codeField, details) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    addError(details, field, "must be a non-empty array");
    return [];
  }

  return entries.map((entry, index) => {
    const path = `${field}[${index}]`;
    if (!isPlainObject(entry)) {
      addError(details, path, "must be an object");
      return null;
    }

    rejectUnexpectedFields(entry, ["language", codeField], details);
    const language = optionalTrimmedString(entry, "language", 32, details, { required: true });
    const code = optionalTrimmedString(entry, codeField, 50_000, details, { required: true });
    if (language && !supportedLanguages.has(language.toLowerCase())) {
      addError(details, `${path}.language`, "is not supported");
    }
    return { language, [codeField]: code };
  });
};

const validateProblem = (body) => {
  const details = [];
  if (!isPlainObject(body)) throw validationError([{ field: "body", message: "must be an object" }]);
  const allowed = ["title", "description", "difficulty", "tags", "visibleTestCases", "hiddenTestCases", "startCode", "referenceSolution"];
  rejectUnexpectedFields(body, allowed, details);

  const title = optionalTrimmedString(body, "title", 255, details, { required: true });
  const description = optionalTrimmedString(body, "description", 20_000, details, { required: true });
  const difficulty = optionalTrimmedString(body, "difficulty", 10, details, { required: true });
  if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) addError(details, "difficulty", "must be easy, medium, or hard");

  const rawTags = typeof body.tags === "string" ? [body.tags] : body.tags;
  if (!Array.isArray(rawTags) || rawTags.length === 0) {
    addError(details, "tags", "must be a non-empty array of strings");
  }
  const tags = Array.isArray(rawTags) ? rawTags.map((tag, index) => {
    if (typeof tag !== "string" || !tag.trim() || tag.trim().length > 50) {
      addError(details, `tags[${index}]`, "must be a non-empty string up to 50 characters");
      return tag;
    }
    return tag.trim();
  }) : [];

  const visibleTestCases = validateTestCases(body.visibleTestCases, "visibleTestCases", true, details);
  const hiddenTestCases = validateTestCases(body.hiddenTestCases, "hiddenTestCases", false, details);
  const startCode = validateCodeEntries(body.startCode, "startCode", "initialCode", details);
  const referenceSolution = validateCodeEntries(body.referenceSolution, "referenceSolution", "completeCode", details);

  if (details.length) throw validationError(details);
  return { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution };
};

const validateSubmission = (body) => {
  const details = [];
  if (!isPlainObject(body)) throw validationError([{ field: "body", message: "must be an object" }]);
  rejectUnexpectedFields(body, ["code", "language"], details);
  const code = optionalTrimmedString(body, "code", 50_000, details, { required: true });
  const language = optionalTrimmedString(body, "language", 32, details, { required: true });
  if (language && !supportedLanguages.has(language.toLowerCase())) addError(details, "language", "is not supported");
  if (details.length) throw validationError(details);
  return { code, language };
};

const validateBody = (validatorFn) => (req, res, next) => {
  try {
    req.body = validatorFn(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateBody,
  validateRegistration,
  validateLogin,
  validateProblem,
  validateSubmission,
};
