jest.mock("../src/utils/problemUtility", () => ({
  ...jest.requireActual("../src/utils/problemUtility"),
  executeJudge0: jest.fn(),
}));

const request = require("supertest");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const { executeJudge0 } = require("../src/utils/problemUtility");

describe("Submission API", () => {
  test("authenticated user can get submission history for a problem", async () => {
    const emailId = `submission-history-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const user = await prisma.user.create({
      data: {
        firstName: "Submission",
        lastName: "User",
        emailId,
        age: 22,
        password: await require("bcrypt").hash(password, 10),
        role: "user",
      },
    });

    const problem = await prisma.problem.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(problem).not.toBeNull();

    const olderSubmission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        code: "console.log(1);",
        language: "javascript",
        status: "wrong_answer",
        testCasesPassed: 0,
        testCasesTotal: 1,
        runtime: 0.02,
        memory: 7000,
      },
    });

    const newerSubmission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        code: "console.log(1);",
        language: "javascript",
        status: "accepted",
        testCasesPassed: 1,
        testCasesTotal: 1,
        runtime: 0.01,
        memory: 6800,
      },
    });

    const agent = request.agent(app);

    const loginResponse = await agent
      .post("/user/login")
      .send({
        emailId,
        password,
      });

    expect(loginResponse.statusCode).toBe(200);

    const response = await agent
      .get(`/problem/submittedProblem/${problem.id}`);

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);

    expect(response.body.length).toBeGreaterThanOrEqual(2);

    expect(response.body[0].id).toBe(newerSubmission.id);
    expect(response.body[1].id).toBe(olderSubmission.id);

    expect(response.body.length).toBeLessThanOrEqual(20);
  });
});

test("returns no submission message when user has no submissions", async () => {
  const emailId = `no-submissions-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const user = await prisma.user.create({
    data: {
      firstName: "No",
      lastName: "Submission",
      emailId,
      age: 22,
      password: await require("bcrypt").hash(password, 10),
      role: "user",
    },
  });

  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  expect(problem).not.toBeNull();

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await agent
    .get(`/problem/submittedProblem/${problem.id}`);

  expect(response.statusCode).toBe(200);
  expect(response.text).toBe("No Submission is persent");
});


test("submits accepted code and marks the problem as solved", async () => {
  const emailId = `accepted-submit-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await require("bcrypt").hash(
    password,
    10
  );

  const user = await prisma.user.create({
    data: {
      firstName: "Submit",
      lastName: "User",
      emailId,
      age: 22,
      password: hashedPassword,
      role: "user",
    },
  });

  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      testCases: {
        where: {
          visibility: "hidden",
        },
      },
    },
  });

  expect(problem).not.toBeNull();

  executeJudge0.mockResolvedValue([
    {
      status_id: 3,
      time: "0.024",
      memory: 7000,
      stderr: null,
    },
  ]);

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await agent
    .post(`/submission/submit/${problem.id}`)
    .send({
      code: "console.log(1);",
      language: "javascript",
    });

  expect(response.statusCode).toBe(201);

  expect(response.body).toEqual({
    accepted: true,
    totalTestCases: problem.testCases.length,
    passedTestCases: problem.testCases.length,
    runtime: 0.024,
    memory: 7000,
  });

  expect(executeJudge0).toHaveBeenCalledTimes(1);

  const submission = await prisma.submission.findFirst({
    where: {
      userId: user.id,
      problemId: problem.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  expect(submission).not.toBeNull();
  expect(submission.status).toBe("accepted");
  expect(submission.testCasesPassed).toBe(
    problem.testCases.length
  );
  expect(submission.testCasesTotal).toBe(
    problem.testCases.length
  );

  const solvedProblem = await prisma.userSolvedProblem.findUnique({
    where: {
      userId_problemId: {
        userId: user.id,
        problemId: problem.id,
      },
    },
  });

  expect(solvedProblem).not.toBeNull();
});

test("persists wrong-answer submission without marking problem solved", async () => {
  const emailId = `wrong-answer-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await require("bcrypt").hash(
    password,
    10
  );

  const user = await prisma.user.create({
    data: {
      firstName: "Wrong",
      lastName: "Answer",
      emailId,
      age: 22,
      password: hashedPassword,
      role: "user",
    },
  });

  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      testCases: {
        where: {
          visibility: "hidden",
        },
      },
    },
  });

  expect(problem).not.toBeNull();

  executeJudge0.mockResolvedValue([
    {
      status_id: 4,
      time: "0.030",
      memory: 7100,
      stderr: null,
    },
  ]);

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await agent
    .post(`/submission/submit/${problem.id}`)
    .send({
      code: "console.log(999);",
      language: "javascript",
    });

  expect(response.statusCode).toBe(201);

  expect(response.body.accepted).toBe(false);
  expect(response.body.passedTestCases).toBe(0);

  const submission = await prisma.submission.findFirst({
    where: {
      userId: user.id,
      problemId: problem.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  expect(submission).not.toBeNull();
  expect(submission.status).toBe("wrong_answer");
  expect(submission.testCasesPassed).toBe(0);
  expect(submission.testCasesTotal).toBe(
    problem.testCases.length
  );

  const solvedProblem =
    await prisma.userSolvedProblem.findUnique({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
    });

  expect(solvedProblem).toBeNull();
});

test("persists runtime-error submission status", async () => {
  const emailId = `runtime-error-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await require("bcrypt").hash(
    password,
    10
  );

  const user = await prisma.user.create({
    data: {
      firstName: "Runtime",
      lastName: "Error",
      emailId,
      age: 22,
      password: hashedPassword,
      role: "user",
    },
  });

  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      testCases: {
        where: {
          visibility: "hidden",
        },
      },
    },
  });

  expect(problem).not.toBeNull();

  executeJudge0.mockResolvedValue([
    {
      status_id: 7,
      time: "0.020",
      memory: 7000,
      stderr: "Runtime error",
    },
  ]);

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await agent
    .post(`/submission/submit/${problem.id}`)
    .send({
      code: "throw new Error('test');",
      language: "javascript",
    });

  expect(response.statusCode).toBe(201);
  expect(response.body.accepted).toBe(false);
  expect(response.body.passedTestCases).toBe(0);

  const submission = await prisma.submission.findFirst({
    where: {
      userId: user.id,
      problemId: problem.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  expect(submission).not.toBeNull();
  expect(submission.status).toBe("runtime_error");
  expect(submission.testCasesPassed).toBe(0);
  expect(submission.errorMessage).toBe("Runtime error");

  const solvedProblem =
    await prisma.userSolvedProblem.findUnique({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
    });

  expect(solvedProblem).toBeNull();
});


test("runs code successfully without creating a submission", async () => {
  const emailId = `run-code-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await require("bcrypt").hash(
    password,
    10
  );

  const user = await prisma.user.create({
    data: {
      firstName: "Run",
      lastName: "Code",
      emailId,
      age: 22,
      password: hashedPassword,
      role: "user",
    },
  });

  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      testCases: {
        where: {
          visibility: "visible",
        },
      },
    },
  });

  expect(problem).not.toBeNull();

  executeJudge0.mockResolvedValue([
    {
      status_id: 3,
      time: "0.024",
      memory: 7800,
      stdout: "0 1\n",
      stderr: null,
    },
  ]);

  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/user/login")
    .send({
      emailId,
      password,
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await agent
    .post(`/submission/run/${problem.id}`)
    .send({
      code: "console.log('0 1');",
      language: "javascript",
    });

  expect(response.statusCode).toBe(201);

  expect(response.body.success).toBe(true);
  expect(response.body.runtime).toBe(0.024);
  expect(response.body.memory).toBe(7800);
  expect(response.body.testCases).toHaveLength(1);

  expect(executeJudge0).toHaveBeenCalledTimes(1);

  const submission = await prisma.submission.findFirst({
    where: {
      userId: user.id,
      problemId: problem.id,
    },
  });

  expect(submission).toBeNull();
});