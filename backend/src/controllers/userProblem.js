const { validateReferenceSolutions } = require('../utils/judge0Validator');
const prisma = require('../config/prisma');

const normalizeTagName = (tag) => {
  const normalizedTag = tag.trim().toLowerCase();

  return normalizedTag === 'linkedlist' ? 'linkedList' : normalizedTag;
};

const createProblemRelations = async (tx, problemId, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution) => {
  const tagNames = [...new Set(tags.map(normalizeTagName))];
  const tagRecords = await Promise.all(
    tagNames.map((name) => tx.tag.upsert({
      where: { name },
      update: {},
      create: { name }
    }))
  );

  if (tagRecords.length) {
    await tx.problemTag.createMany({
      data: tagRecords.map((tag) => ({ problemId, tagId: tag.id }))
    });
  }

  const testCases = [
    ...visibleTestCases.map((testCase, position) => ({
      problemId,
      visibility: 'visible',
      position,
      input: testCase.input,
      output: testCase.output,
      explanation: testCase.explanation ?? null
    })),
    ...hiddenTestCases.map((testCase, position) => ({
      problemId,
      visibility: 'hidden',
      position,
      input: testCase.input,
      output: testCase.output,
      explanation: testCase.explanation ?? null
    }))
  ];

  if (testCases.length) {
    await tx.problemTestCase.createMany({ data: testCases });
  }

  if (startCode.length) {
    await tx.problemStarterCode.createMany({
      data: startCode.map((code, position) => ({
        problemId,
        position,
        language: code.language,
        initialCode: code.initialCode
      }))
    });
  }

  if (referenceSolution.length) {
    await tx.problemReferenceSolution.createMany({
      data: referenceSolution.map((solution, position) => ({
        problemId,
        position,
        language: solution.language,
        completeCode: solution.completeCode
      }))
    });
  }
};

const problemDetailsInclude = {
  problemTags: {
    include: {
      tag: true
    }
  },
  testCases: {
    where: {
      visibility: 'visible'
    },
    orderBy: {
      position: 'asc'
    }
  },
  starterCode: {
    orderBy: {
      position: 'asc'
    }
  },
  referenceSolutions: {
    orderBy: {
      position: 'asc'
    }
  }
};

const toProblemDetails = (problem) => ({
  _id: problem.id,
  title: problem.title,
  description: problem.description,
  difficulty: problem.difficulty,
  tags: problem.problemTags.map((problemTag) => problemTag.tag.name),
  visibleTestCases: problem.testCases.map((testCase) => ({
    input: testCase.input,
    output: testCase.output,
    explanation: testCase.explanation
  })),
  startCode: problem.starterCode.map((code) => ({
    language: code.language,
    initialCode: code.initialCode
  })),
  referenceSolution: problem.referenceSolutions.map((solution) => ({
    language: solution.language,
    completeCode: solution.completeCode
  }))
});

const toProblemSummary = (problem) => ({
  _id: problem.id,
  title: problem.title,
  difficulty: problem.difficulty,
  tags: problem.problemTags.map((problemTag) => problemTag.tag.name)
});

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution
  } = req.body;

  try {
    await validateReferenceSolutions(referenceSolution, visibleTestCases);

    await prisma.$transaction(async (tx) => {
      const problem = await tx.problem.create({
        data: {
          title,
          description,
          difficulty,
          problemCreatorId: req.result.id
        }
      });

      await createProblemRelations(
        tx,
        problem.id,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution
      );
    });

    res.status(201).send('Problem Saved Successfully');
  } catch (err) {
    res.status(400).send('Error: ' + err);
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution
  } = req.body;

  try {
    if (!id) {
      return res.status(400).send('Missing ID Field');
    }

    const DsaProblem = await prisma.problem.findUnique({
      where: { id }
    });

    if (!DsaProblem) {
      return res.status(404).send('ID is not persent in server');
    }

    await validateReferenceSolutions(referenceSolution, visibleTestCases);

    const newProblem = await prisma.$transaction(async (tx) => {
      await tx.problem.update({
        where: { id },
        data: {
          title,
          description,
          difficulty
        }
      });

      await tx.problemTag.deleteMany({ where: { problemId: id } });
      await tx.problemTestCase.deleteMany({ where: { problemId: id } });
      await tx.problemStarterCode.deleteMany({ where: { problemId: id } });
      await tx.problemReferenceSolution.deleteMany({ where: { problemId: id } });

      await createProblemRelations(
        tx,
        id,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution
      );

      return tx.problem.findUnique({
        where: { id },
        include: problemDetailsInclude
      });
    });

    res.status(200).send(toProblemDetails(newProblem));
  } catch (err) {
    if (err.name === 'ReferenceSolutionValidationError') {
      return res.status(400).send('Error: ' + err);
    }

    res.status(500).send('Error: ' + err);
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send('ID is Missing');
    }

    await prisma.problem.delete({
      where: { id }
    });

    res.status(200).send('Successfully Deleted');
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).send('Problem is Missing');
    }

    res.status(500).send('Error: ' + err);
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send('ID is Missing');
    }

    const getProblem = await prisma.problem.findUnique({
      where: { id },
      include: problemDetailsInclude
    });

    if (!getProblem) {
      return res.status(404).send('Problem is Missing');
    }

    res.status(200).send(toProblemDetails(getProblem));
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

const getAllProblem = async (req, res) => {
  try {
    const getProblem = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        problemTags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (getProblem.length === 0) {
      return res.status(404).send('Problem is Missing');
    }

    res.status(200).send(getProblem.map(toProblemSummary));
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const solvedProblems = await prisma.userSolvedProblem.findMany({
      where: {
        userId: req.result.id
      },
      include: {
        problem: {
          include: {
            problemTags: {
              include: {
                tag: true
              }
            }
          }
        }
      }
    });

    res.status(200).send(solvedProblems.map(({ problem }) => toProblemSummary(problem)));
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result.id;
    const problemId = req.params.pid;
    const ans = await prisma.submission.findMany({
      where: {
        userId,
        problemId
      }
    });

    if (ans.length === 0) {
      return res.status(200).send('No Submission is persent');
    }

    res.status(200).send(ans);
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem
};