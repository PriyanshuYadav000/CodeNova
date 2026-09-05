const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require('./problemUtility');

const validateReferenceSolutions = async (
  referenceSolution,
  visibleTestCases
) => {
  for (const { language, completeCode } of referenceSolution) {
    const languageId = getLanguageById(language);

    const submissions = visibleTestCases.map((testcase) => ({
      source_code: completeCode,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map(
      (value) => value.token
    );

    const testResult = await submitToken(resultToken);

    for (const [testCaseIndex, test] of testResult.entries()) {
      if (test.status_id !== 3) {
        const error = new Error(
          `Reference solution for ${language} failed visible test case ${
            testCaseIndex + 1
          } (status_id: ${test.status_id}).`
        );

        error.name = 'ReferenceSolutionValidationError';

        throw error;
      }
    }
  }
};

module.exports = {
  validateReferenceSolutions,
};