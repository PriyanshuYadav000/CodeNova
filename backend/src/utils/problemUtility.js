const axios = require('axios');
const AppError = require('./AppError');

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';

const getLanguageById = (lang) => {
  const language = {
    'c++': 54,
    cpp: 54,
    java: 62,
    javascript: 63,
  };

  if (typeof lang !== 'string') {
    throw new AppError(
      'Unsupported language.',
      400,
      'VALIDATION_ERROR'
    );
  }

  const languageId = language[lang.trim().toLowerCase()];

  if (!languageId) {
    throw new AppError(
      'Unsupported language.',
      400,
      'VALIDATION_ERROR'
    );
  }

  return languageId;
};

const getJudge0Headers = () => {
  const key = process.env.JUDGE0_KEY;

  if (!key) {
    throw new AppError(
      'JUDGE0_KEY is not configured.',
      500,
      'CONFIGURATION_ERROR'
    );
  }

  return {
    'x-rapidapi-key': key,
    'x-rapidapi-host': JUDGE0_HOST,
    'Content-Type': 'application/json',
  };
};

const handleJudge0Error = (error, operation) => {
  const status = error.response?.status;
  const responseData = error.response?.data;

  console.error(`\n========== JUDGE0 ${operation} ERROR ==========`);

  console.error('Status:', status || 'NO_RESPONSE');

  console.error(
    'Response:',
    JSON.stringify(responseData, null, 2)
  );

  console.error('Message:', error.message);

  console.error('==========================================\n');

  if (!process.env.JUDGE0_KEY) {
    throw new AppError(
      'JUDGE0_KEY is not configured.',
      500,
      'CONFIGURATION_ERROR'
    );
  }

  if (status === 401 || status === 403) {
    throw new AppError(
      'Judge0 authentication failed. Check your JUDGE0_KEY and RapidAPI access.',
      503,
      'EXTERNAL_SERVICE_ERROR'
    );
  }

  if (status === 429) {
    throw new AppError(
      'Judge0 rate limit exceeded.',
      503,
      'EXTERNAL_SERVICE_ERROR'
    );
  }

  throw new AppError(
    'Code execution service is unavailable.',
    503,
    'EXTERNAL_SERVICE_ERROR'
  );
};

const submitBatch = async (submissions) => {
  try {
    const response = await axios.post(
      `${JUDGE0_URL}/submissions/batch`,
      {
        submissions,
      },
      {
        params: {
          base64_encoded: 'false',
        },
        headers: getJudge0Headers(),
        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    handleJudge0Error(error, 'SUBMIT');
  }
};

const waiting = (timer) =>
  new Promise((resolve) => {
    setTimeout(resolve, timer);
  });

const fetchSubmissions = async (resultToken) => {
  try {
    const response = await axios.get(
      `${JUDGE0_URL}/submissions/batch`,
      {
        params: {
          tokens: resultToken.join(','),
          base64_encoded: 'false',
          fields: '*',
        },
        headers: getJudge0Headers(),
        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    handleJudge0Error(error, 'POLL');
  }
};

const submitToken = async (resultToken) => {
  const maxPollingAttempts = 30;

  for (
    let attempt = 0;
    attempt < maxPollingAttempts;
    attempt++
  ) {
    const result = await fetchSubmissions(resultToken);

    const isResultObtained = result.submissions.every(
      (submission) => submission.status_id > 2
    );

    if (isResultObtained) {
      return result.submissions;
    }

    if (attempt < maxPollingAttempts - 1) {
      await waiting(1000);
    }
  }

  throw new AppError(
    'Code execution timed out.',
    503,
    'EXTERNAL_SERVICE_ERROR'
  );
};

const executeJudge0 = async (
  sourceCode,
  language,
  testCases
) => {
  const languageId = getLanguageById(language);

  const submissions = testCases.map((testcase) => ({
    source_code: sourceCode,
    language_id: languageId,
    stdin: testcase.input,
    expected_output: testcase.output,
  }));

  const submitResult = await submitBatch(submissions);

  const resultToken = submitResult.map(
    (value) => value.token
  );

  return submitToken(resultToken);
};

module.exports = {
  getLanguageById,
  submitBatch,
  submitToken,
  executeJudge0,
};