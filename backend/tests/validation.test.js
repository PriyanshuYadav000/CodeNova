const {
  validateRegistration,
  validateLogin,
  validateSubmission,
  validateProblem,
} = require("../src/validators/requestValidation");

describe("validateRegistration", () => {
  test("accepts valid registration data", () => {
    const input = {
      firstName: "Test",
      lastName: "User",
      emailId: "TEST@EXAMPLE.COM",
      age: 22,
      password: "Test@12345",
    };

    const result = validateRegistration(input);

    expect(result).toEqual({
      firstName: "Test",
      lastName: "User",
      emailId: "test@example.com",
      age: 22,
      password: "Test@12345",
    });
  });
});

test("rejects missing required registration fields", () => {
  const input = {
    firstName: "",
    emailId: "",
    password: "",
  };

  expect(() => validateRegistration(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects invalid email and weak password", () => {
  const input = {
    firstName: "Test",
    emailId: "invalid-email",
    password: "123",
  };

  expect(() => validateRegistration(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects invalid age", () => {
  const input = {
    firstName: "Test",
    emailId: "test@example.com",
    password: "Test@12345",
    age: 150,
  };

  expect(() => validateRegistration(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects unexpected registration fields", () => {
  const input = {
    firstName: "Test",
    emailId: "test@example.com",
    password: "Test@12345",
    role: "admin",
  };

  expect(() => validateRegistration(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

describe("validateLogin", () => {
  test("accepts valid login data", () => {
    const input = {
      emailId: "TEST@EXAMPLE.COM",
      password: "Test@12345",
    };

    const result = validateLogin(input);

    expect(result).toEqual({
      emailId: "test@example.com",
      password: "Test@12345",
    });
  });
});

test("rejects invalid login data", () => {
  const input = {
    emailId: "invalid-email",
    password: "",
  };

  expect(() => validateLogin(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects unexpected login fields", () => {
  const input = {
    emailId: "test@example.com",
    password: "Test@12345",
    role: "admin",
  };

  expect(() => validateLogin(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

describe("validateSubmission", () => {
  test("accepts valid submission data", () => {
    const input = {
      code: "console.log('Hello');",
      language: "javascript",
    };

    const result = validateSubmission(input);

    expect(result).toEqual({
      code: "console.log('Hello');",
      language: "javascript",
    });
  });
});

test("rejects unsupported submission language", () => {
  const input = {
    code: "print('Hello')",
    language: "python",
  };

  expect(() => validateSubmission(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects missing submission fields", () => {
  const input = {
    code: "",
    language: "",
  };

  expect(() => validateSubmission(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

describe("validateProblem", () => {
  test("accepts valid problem data", () => {
    const input = {
      title: "Two Sum",
      description:
        "Given an array of integers and a target, return the indices of two numbers that add up to the target.",
      difficulty: "easy",
      tags: ["array", "hashmap"],
      visibleTestCases: [
        {
          input: "4\n2 7 11 15\n9",
          output: "0 1",
          explanation: "2 + 7 = 9",
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
            "function twoSum(nums, target) {\n    // Write your solution here\n}",
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
    };

    const result = validateProblem(input);

    expect(result).toEqual(input);
  });
});

test("rejects invalid problem difficulty", () => {
  const input = {
    title: "Test Problem",
    description: "A valid problem description.",
    difficulty: "extreme",
    tags: ["array"],
    visibleTestCases: [
      {
        input: "1",
        output: "1",
        explanation: "Valid test case",
      },
    ],
    hiddenTestCases: [
      {
        input: "1",
        output: "1",
      },
    ],
    startCode: [
      {
        language: "javascript",
        initialCode: "console.log(1);",
      },
    ],
    referenceSolution: [
      {
        language: "javascript",
        completeCode: "console.log(1);",
      },
    ],
  };

  expect(() => validateProblem(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects empty tags", () => {
  const input = {
    title: "Test Problem",
    description: "A valid problem description.",
    difficulty: "easy",
    tags: [],
    visibleTestCases: [
      {
        input: "1",
        output: "1",
        explanation: "Valid test case",
      },
    ],
    hiddenTestCases: [
      {
        input: "1",
        output: "1",
      },
    ],
    startCode: [
      {
        language: "javascript",
        initialCode: "console.log(1);",
      },
    ],
    referenceSolution: [
      {
        language: "javascript",
        completeCode: "console.log(1);",
      },
    ],
  };

  expect(() => validateProblem(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects invalid visible test cases", () => {
  const input = {
    title: "Test Problem",
    description: "A valid problem description.",
    difficulty: "easy",
    tags: ["array"],
    visibleTestCases: [
      {
        input: "",
        output: "1",
        explanation: "Valid explanation",
      },
    ],
    hiddenTestCases: [
      {
        input: "1",
        output: "1",
      },
    ],
    startCode: [
      {
        language: "javascript",
        initialCode: "console.log(1);",
      },
    ],
    referenceSolution: [
      {
        language: "javascript",
        completeCode: "console.log(1);",
      },
    ],
  };

  expect(() => validateProblem(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects unsupported language in starter code", () => {
  const input = {
    title: "Test Problem",
    description: "A valid problem description.",
    difficulty: "easy",
    tags: ["array"],
    visibleTestCases: [
      {
        input: "1",
        output: "1",
        explanation: "Valid test case",
      },
    ],
    hiddenTestCases: [
      {
        input: "1",
        output: "1",
      },
    ],
    startCode: [
      {
        language: "python",
        initialCode: "print(1)",
      },
    ],
    referenceSolution: [
      {
        language: "javascript",
        completeCode: "console.log(1);",
      },
    ],
  };

  expect(() => validateProblem(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects unexpected problem fields", () => {
  const input = {
    title: "Test Problem",
    description: "A valid problem description.",
    difficulty: "easy",
    tags: ["array"],
    visibleTestCases: [
      {
        input: "1",
        output: "1",
        explanation: "Valid test case",
      },
    ],
    hiddenTestCases: [
      {
        input: "1",
        output: "1",
      },
    ],
    startCode: [
      {
        language: "javascript",
        initialCode: "console.log(1);",
      },
    ],
    referenceSolution: [
      {
        language: "javascript",
        completeCode: "console.log(1);",
      },
    ],
    admin: true,
  };

  expect(() => validateProblem(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});

test("rejects explanation field in hidden test cases", () => {
  const input = {
    title: "Test Problem",
    description: "A valid problem description.",
    difficulty: "easy",
    tags: ["array"],
    visibleTestCases: [
      {
        input: "1",
        output: "1",
        explanation: "Valid explanation",
      },
    ],
    hiddenTestCases: [
      {
        input: "1",
        output: "1",
        explanation: "This should not be allowed",
      },
    ],
    startCode: [
      {
        language: "javascript",
        initialCode: "console.log(1);",
      },
    ],
    referenceSolution: [
      {
        language: "javascript",
        completeCode: "console.log(1);",
      },
    ],
  };

  expect(() => validateProblem(input)).toThrow(
    expect.objectContaining({
      code: "VALIDATION_ERROR",
      statusCode: 400,
    })
  );
});