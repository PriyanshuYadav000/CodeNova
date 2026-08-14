const prisma = require('../config/prisma');
const { executeJudge0 } = require('../utils/problemUtility');

const judge0StatusToSubmissionStatus = {
  4: 'wrong_answer',
  5: 'time_limit_exceeded',
  6: 'compilation_error',
  7: 'runtime_error',
  8: 'runtime_error',
  9: 'runtime_error',
  10: 'runtime_error',
  11: 'runtime_error',
  12: 'runtime_error',
  13: 'internal_error',
  14: 'runtime_error',
  15: 'memory_limit_exceeded'
};

const getSubmissionStatus = (judge0StatusId) => (
  judge0StatusToSubmissionStatus[judge0StatusId] || 'internal_error'
);

const toJudge0TestCases = (testCases) => testCases.map((testCase) => ({
  input: testCase.input,
  output: testCase.output
}));

const submitCode = async (req, res) => {
  try {
    const userId = req.result.id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language) {
      return res.status(400).send('Some field missing');
    }

    if (language === 'cpp') {
      language = 'c++';
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          where: {
            visibility: 'hidden'
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!problem) {
      return res.status(404).send('Problem not found');
    }

    const hiddenTestCases = toJudge0TestCases(problem.testCases);
    const submittedResult = await prisma.submission.create({
      data: {
        userId,
        problemId,
        code,
        language,
        status: 'pending',
        testCasesTotal: problem.testCases.length
      }
    });

    const testResult = await executeJudge0(code, language, hiddenTestCases);
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory);
      } else {
        status = getSubmissionStatus(test.status_id);
        errorMessage = test.stderr;
      }
    }

    const accepted = status === 'accepted';

    await prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: {
          id: submittedResult.id
        },
        data: {
          status,
          testCasesPassed,
          errorMessage,
          runtime,
          memory
        }
      });

      if (accepted) {
        await tx.userSolvedProblem.upsert({
          where: {
            userId_problemId: {
              userId,
              problemId
            }
          },
          update: {},
          create: {
            userId,
            problemId
          }
        });
      }
    });

    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.result.id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language) {
      return res.status(400).send('Some field missing');
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          where: {
            visibility: 'visible'
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!problem) {
      return res.status(404).send('Problem not found');
    }

    if (language === 'cpp') {
      language = 'c++';
    }

    const visibleTestCases = toJudge0TestCases(problem.testCases);
    const testResult = await executeJudge0(code, language, visibleTestCases);
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory);
      } else {
        status = getSubmissionStatus(test.status_id);
        errorMessage = test.stderr;
      }
    }

    res.status(201).json({
      success: status === 'accepted',
      testCases: testResult,
      runtime,
      memory
    });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { submitCode, runCode };
