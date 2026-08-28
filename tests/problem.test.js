jest.mock("../src/utils/judge0Validator", () => ({
  validateReferenceSolutions: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Problem API", () => {
  test("admin can create a problem successfully", async () => {
    const emailId = `problem-admin-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName: "Problem",
        lastName: "Admin",
        emailId,
        age: 30,
        password: hashedPassword,
        role: "admin",
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
    expect(loginResponse.body.data.role).toBe("admin");

    const title = `Test Problem ${Date.now()}`;

    const response = await agent
      .post("/problem/create")
      .send({
        title,
        description:
          "Temporary problem for testing problem creation.",
        difficulty: "easy",
        tags: ["array"],
        visibleTestCases: [
          {
            input: "1",
            output: "1",
            explanation: "Test case",
          },
        ],
        hiddenTestCases: [
          {
            input: "2",
            output: "2",
          },
        ],
        startCode: [
          {
            language: "javascript",
            initialCode: "// Write your solution here",
          },
        ],
        referenceSolution: [
          {
            language: "javascript",
            completeCode: "console.log(1);",
          },
        ],
      });

    expect(response.statusCode).toBe(201);

    expect(response.text).toBe(
      "Problem Saved Successfully"
    );

    const createdProblem = await prisma.problem.findUnique({
      where: {
        normalizedTitle: title.toLowerCase(),
      },
      include: {
        problemTags: {
          include: {
            tag: true,
          },
        },
        testCases: true,
        starterCode: true,
        referenceSolutions: true,
      },
    });

    expect(createdProblem).not.toBeNull();

    expect(createdProblem.title).toBe(title);
    expect(createdProblem.difficulty).toBe("easy");

    expect(createdProblem.problemTags).toHaveLength(1);
    expect(createdProblem.problemTags[0].tag.name).toBe("array");

    expect(createdProblem.testCases).toHaveLength(2);

    expect(createdProblem.starterCode).toHaveLength(1);
    expect(createdProblem.starterCode[0].language).toBe(
      "javascript"
    );

    expect(createdProblem.referenceSolutions).toHaveLength(1);
    expect(
      createdProblem.referenceSolutions[0].language
    ).toBe("javascript");
  });

  test("authenticated user can get all problems", async () => {
    const emailId = `problem-user-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName: "Problem",
        lastName: "User",
        emailId,
        age: 22,
        password: hashedPassword,
        role: "user",
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
      .get("/problem/getAllProblem");

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    expect(response.body[0]).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        title: expect.any(String),
        difficulty: expect.any(String),
        tags: expect.any(Array),
      })
    );
  });

  test("authenticated user can get a problem by id", async () => {
    const problem = await prisma.problem.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(problem).not.toBeNull();

    const emailId = `problem-details-${Date.now()}@codenova.test`;
    const password = "Test@12345";

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName: "Problem",
        lastName: "Details",
        emailId,
        age: 22,
        password: hashedPassword,
        role: "user",
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
      .get(`/problem/problemById/${problem.id}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        _id: problem.id,
        title: expect.any(String),
        description: expect.any(String),
        difficulty: expect.any(String),
        tags: expect.any(Array),
        visibleTestCases: expect.any(Array),
        startCode: expect.any(Array),
        referenceSolution: expect.any(Array),
      })
    );
  });
});

test("admin can update a problem successfully", async () => {
  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  expect(problem).not.toBeNull();

  const emailId = `problem-update-admin-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      firstName: "Update",
      lastName: "Admin",
      emailId,
      age: 30,
      password: hashedPassword,
      role: "admin",
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

  const updatedTitle = `Updated Problem ${Date.now()}`;

  const response = await agent
    .put(`/problem/update/${problem.id}`)
    .send({
      title: updatedTitle,
      description:
        "Updated problem description for automated testing.",
      difficulty: "medium",
      tags: ["array", "hashmap"],
      visibleTestCases: [
        {
          input: "2\n1 2\n3",
          output: "0 1",
          explanation: "Updated visible test case",
        },
      ],
      hiddenTestCases: [
        {
          input: "2\n3 3\n6",
          output: "0 1",
        },
      ],
      startCode: [
        {
          language: "javascript",
          initialCode:
            "function twoSum(nums, target) {\n" +
            "    // Updated starter code\n" +
            "}",
        },
      ],
      referenceSolution: [
        {
          language: "javascript",
          completeCode:
            "const fs = require('fs');\n" +
            "const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n" +
            "const n = input[0];\n" +
            "const nums = input.slice(1, n + 1);\n" +
            "const target = input[n + 1];\n" +
            "const map = new Map();\n" +
            "for (let i = 0; i < nums.length; i++) {\n" +
            "    const complement = target - nums[i];\n" +
            "    if (map.has(complement)) {\n" +
            "        console.log(map.get(complement) + ' ' + i);\n" +
            "        break;\n" +
            "    }\n" +
            "    map.set(nums[i], i);\n" +
            "}",
        },
      ],
    });

  expect(response.statusCode).toBe(200);

  expect(response.body).toEqual(
    expect.objectContaining({
      _id: problem.id,
      title: updatedTitle,
      difficulty: "medium",
      tags: ["array", "hashmap"],
    })
  );

  const updatedProblem = await prisma.problem.findUnique({
    where: {
      id: problem.id,
    },
  });

  expect(updatedProblem).not.toBeNull();
  expect(updatedProblem.title).toBe(updatedTitle);
  expect(updatedProblem.difficulty).toBe("medium");
});

test("admin can delete a problem successfully", async () => {
  const emailId = `problem-delete-admin-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      firstName: "Delete",
      lastName: "Admin",
      emailId,
      age: 30,
      password: hashedPassword,
      role: "admin",
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

  const title = `Delete Test Problem ${Date.now()}`;

  // Create a problem directly in the test environment
  // so we have a real ID to delete.
  const problem = await prisma.problem.create({
    data: {
      title,
      normalizedTitle: title.trim().toLowerCase(),
      description: "Problem created for delete testing.",
      difficulty: "easy",
      problemCreatorId: (
        await prisma.user.findUnique({
          where: { emailId },
          select: { id: true },
        })
      ).id,
    },
  });

  const deleteResponse = await agent
    .delete(`/problem/delete/${problem.id}`);

  expect(deleteResponse.statusCode).toBe(200);

  expect(deleteResponse.text).toBe(
    "Successfully Deleted"
  );

  const deletedProblem = await prisma.problem.findUnique({
    where: {
      id: problem.id,
    },
  });

  expect(deletedProblem).toBeNull();

  const getResponse = await agent
    .get(`/problem/problemById/${problem.id}`);

  expect(getResponse.statusCode).toBe(404);

  expect(getResponse.body).toEqual({
    success: false,
    message: "Problem not found.",
    error: {
      code: "NOT_FOUND",
    },
  });
});

test("rejects duplicate normalized problem title", async () => {
  const emailId = `problem-duplicate-admin-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      firstName: "Duplicate",
      lastName: "Admin",
      emailId,
      age: 30,
      password: hashedPassword,
      role: "admin",
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

  const title = `Normalized Title Test ${Date.now()}`;

  const problemBody = {
    title,
    description: "Problem for duplicate-title testing.",
    difficulty: "easy",
    tags: ["array"],
    visibleTestCases: [
      {
        input: "1",
        output: "1",
        explanation: "Test case",
      },
    ],
    hiddenTestCases: [
      {
        input: "2",
        output: "2",
      },
    ],
    startCode: [
      {
        language: "javascript",
        initialCode: "// Write your solution here",
      },
    ],
    referenceSolution: [
      {
        language: "javascript",
        completeCode: "console.log(1);",
      },
    ],
  };

  const firstResponse = await agent
    .post("/problem/create")
    .send(problemBody);

  expect(firstResponse.statusCode).toBe(201);

  const duplicateResponse = await agent
    .post("/problem/create")
    .send({
      ...problemBody,
      title: `  ${title.toUpperCase()}  `,
    });

  expect(duplicateResponse.statusCode).toBe(409);

  expect(duplicateResponse.body).toEqual({
    success: false,
    message: "A problem with this title already exists.",
    error: {
      code: "DUPLICATE_PROBLEM",
    },
  });
});

test("problem details include all related data", async () => {
  const problem = await prisma.problem.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      problemTags: {
        include: {
          tag: true,
        },
      },
      testCases: true,
      starterCode: true,
      referenceSolutions: true,
    },
  });

  expect(problem).not.toBeNull();

  const emailId = `problem-relations-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      firstName: "Relations",
      lastName: "User",
      emailId,
      age: 22,
      password: hashedPassword,
      role: "user",
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
    .get(`/problem/problemById/${problem.id}`);

  expect(response.statusCode).toBe(200);

  expect(response.body).toEqual(
    expect.objectContaining({
      _id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      tags: expect.any(Array),
      visibleTestCases: expect.any(Array),
      startCode: expect.any(Array),
      referenceSolution: expect.any(Array),
    })
  );

  expect(response.body.tags.length).toBe(
    problem.problemTags.length
  );

  expect(response.body.visibleTestCases.length).toBe(
    problem.testCases.filter(
      (testCase) => testCase.visibility === "visible"
    ).length
  );

  expect(response.body.startCode.length).toBe(
    problem.starterCode.length
  );

  expect(response.body.referenceSolution.length).toBe(
    problem.referenceSolutions.length
  );
});


test("authenticated user can get solved problems", async () => {
  const emailId = `solved-problems-${Date.now()}@codenova.test`;
  const password = "Test@12345";

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Solved",
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
  });

  expect(problem).not.toBeNull();

  await prisma.userSolvedProblem.create({
    data: {
      userId: user.id,
      problemId: problem.id,
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
    .get("/problem/problemSolvedByUser");

  expect(response.statusCode).toBe(200);

  expect(Array.isArray(response.body)).toBe(true);

  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: expect.any(Array),
      }),
    ])
  );
});