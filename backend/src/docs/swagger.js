const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.3",

  info: {
    title: "CodeNova API",
    version: "1.0.0",
    description:
      "REST API for CodeNova — an AI-powered coding and interview preparation platform.",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Health",
      description: "API health and availability",
    },
    {
      name: "Authentication",
      description: "User authentication and account management",
    },
    {
      name: "Problems",
      description: "Coding problem management and retrieval",
    },
    {
      name: "Submissions",
      description: "Code execution and code submissions",
    },
  ],

  components: {
    // ==================================================
    // SECURITY
    // ==================================================

    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description:
          "JWT authentication stored in the HTTP-only 'token' cookie.",
      },
    },

    // ==================================================
    // REUSABLE HEADERS
    // ==================================================

    headers: {
      RetryAfter: {
        description:
          "Number of seconds to wait before retrying the request.",
        schema: {
          type: "integer",
          example: 42,
        },
      },

      XRateLimitLimit: {
        description:
          "Maximum number of requests allowed in the current rate-limit window.",
        schema: {
          type: "integer",
          example: 10,
        },
      },

      XRateLimitRemaining: {
        description:
          "Number of requests remaining in the current rate-limit window.",
        schema: {
          type: "integer",
          example: 9,
        },
      },

      XRateLimitReset: {
        description:
          "Unix timestamp when the current rate-limit window resets.",
        schema: {
          type: "integer",
          example: 1788290264,
        },
      },

      SetCookie: {
        description:
          "HTTP-only JWT authentication cookie named 'token'.",
        schema: {
          type: "string",
        },
      },
    },

    // ==================================================
    // SCHEMAS
    // ==================================================

    schemas: {
      // --------------------------------------------------
      // COMMON ERROR SCHEMAS
      // --------------------------------------------------

      ValidationErrorDetail: {
        type: "object",
        required: ["field", "message"],
        properties: {
          field: {
            type: "string",
            example: "emailId",
          },

          message: {
            type: "string",
            example: "must be a valid email address",
          },
        },
      },

      ErrorObject: {
        type: "object",
        required: ["code"],
        properties: {
          code: {
            type: "string",
            example: "VALIDATION_ERROR",
          },

          details: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ValidationErrorDetail",
            },
          },
        },
      },

      ErrorResponse: {
        type: "object",
        required: ["success", "message", "error"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },

          message: {
            type: "string",
            example: "Validation failed.",
          },

          error: {
            $ref: "#/components/schemas/ErrorObject",
          },
        },
      },

      // --------------------------------------------------
      // AUTHENTICATION REQUEST SCHEMAS
      // --------------------------------------------------

      RegisterRequest: {
        type: "object",
        required: ["firstName", "emailId", "password"],
        additionalProperties: false,

        properties: {
          firstName: {
            type: "string",
            maxLength: 20,
            example: "Priyanshu",
          },

          lastName: {
            type: "string",
            maxLength: 20,
            example: "Yadav",
          },

          emailId: {
            type: "string",
            format: "email",
            maxLength: 320,
            example: "user@example.com",
          },

          age: {
            type: "integer",
            minimum: 1,
            maximum: 120,
            example: 22,
          },

          password: {
            type: "string",
            format: "password",
            maxLength: 128,
            example: "ExamplePassword123!",
          },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["emailId", "password"],
        additionalProperties: false,

        properties: {
          emailId: {
            type: "string",
            format: "email",
            maxLength: 320,
            example: "user@example.com",
          },

          password: {
            type: "string",
            format: "password",
            maxLength: 128,
            example: "ExamplePassword123!",
          },
        },
      },

      // --------------------------------------------------
      // AUTHENTICATION RESPONSE SCHEMAS
      // --------------------------------------------------

      UserData: {
        type: "object",
        required: ["firstName", "emailId", "_id", "role"],

        properties: {
          firstName: {
            type: "string",
            example: "Priyanshu",
          },

          emailId: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },

          _id: {
            type: "string",
            format: "uuid",
            example: "00000000-0000-0000-0000-000000000000",
          },

          role: {
            type: "string",
            enum: ["user", "admin"],
            example: "user",
          },
        },
      },

      RegisterResponse: {
        type: "object",
        required: ["success", "message", "data"],

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          message: {
            type: "string",
            example: "Registered successfully",
          },

          data: {
            $ref: "#/components/schemas/UserData",
          },
        },
      },

      AdminRegisterResponse: {
        type: "object",
        required: ["success", "message", "data"],

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          message: {
            type: "string",
            example: "User registered successfully",
          },

          data: {
            $ref: "#/components/schemas/UserData",
          },
        },

        example: {
          success: true,
          message: "User registered successfully",
          data: {
            firstName: "Employee",
            emailId: "employee@company.com",
            _id: "00000000-0000-0000-0000-000000000000",
            role: "admin",
          },
        },
      },

      LoginResponse: {
        type: "object",
        required: ["success", "message", "data"],

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          message: {
            type: "string",
            example: "Logged in successfully",
          },

          data: {
            $ref: "#/components/schemas/UserData",
          },
        },
      },

      AuthCheckResponse: {
        type: "object",
        required: ["success", "message", "data"],

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          message: {
            type: "string",
            example: "Valid User",
          },

          data: {
            $ref: "#/components/schemas/UserData",
          },
        },
      },

      EmptyDataResponse: {
        type: "object",
        required: ["success", "message", "data"],

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          message: {
            type: "string",
            example: "Operation completed successfully",
          },

          data: {
            nullable: true,
            example: null,
          },
        },
      },

      // --------------------------------------------------
      // PROBLEM SCHEMAS
      // --------------------------------------------------

      ProblemTestCase: {
        type: "object",
        required: ["input", "output"],
        additionalProperties: false,

        properties: {
          input: {
            type: "string",
            maxLength: 10000,
            example: "5",
          },

          output: {
            type: "string",
            maxLength: 10000,
            example: "120",
          },

          explanation: {
            type: "string",
            maxLength: 10000,
            example: "5! = 5 × 4 × 3 × 2 × 1 = 120",
          },
        },
      },

      HiddenTestCase: {
        type: "object",
        required: ["input", "output"],
        additionalProperties: false,

        properties: {
          input: {
            type: "string",
            maxLength: 10000,
            example: "10",
          },

          output: {
            type: "string",
            maxLength: 10000,
            example: "3628800",
          },
        },
      },

      StarterCode: {
        type: "object",
        required: ["language", "initialCode"],
        additionalProperties: false,

        properties: {
          language: {
            type: "string",
            maxLength: 32,
            enum: ["c++", "cpp", "java", "javascript"],
            example: "cpp",
          },

          initialCode: {
            type: "string",
            maxLength: 50000,
            example:
              "int factorial(int n) {\n    // Write your code here\n}",
          },
        },
      },

      ReferenceSolution: {
        type: "object",
        required: ["language", "completeCode"],
        additionalProperties: false,

        properties: {
          language: {
            type: "string",
            maxLength: 32,
            enum: ["c++", "cpp", "java", "javascript"],
            example: "cpp",
          },

          completeCode: {
            type: "string",
            maxLength: 50000,
            example:
              "int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}",
          },
        },
      },

      ProblemRequest: {
        type: "object",
        required: [
          "title",
          "description",
          "difficulty",
          "tags",
          "visibleTestCases",
          "hiddenTestCases",
          "startCode",
          "referenceSolution",
        ],
        additionalProperties: false,

        properties: {
          title: {
            type: "string",
            maxLength: 255,
            example: "Factorial of a Number",
          },

          description: {
            type: "string",
            maxLength: 20000,
            example:
              "Given a non-negative integer n, return the factorial of n.",
          },

          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
            example: "easy",
          },

          tags: {
            type: "array",
            minItems: 1,
            items: {
              type: "string",
              maxLength: 50,
            },
            example: ["recursion", "math"],
          },

          visibleTestCases: {
            type: "array",
            minItems: 1,
            items: {
              $ref: "#/components/schemas/ProblemTestCase",
            },
          },

          hiddenTestCases: {
            type: "array",
            minItems: 1,
            items: {
              $ref: "#/components/schemas/HiddenTestCase",
            },
          },

          startCode: {
            type: "array",
            minItems: 1,
            items: {
              $ref: "#/components/schemas/StarterCode",
            },
          },

          referenceSolution: {
            type: "array",
            minItems: 1,
            items: {
              $ref: "#/components/schemas/ReferenceSolution",
            },
          },
        },
      },

      ProblemSummary: {
        type: "object",
        required: ["_id", "title", "difficulty", "tags"],

        properties: {
          _id: {
            type: "string",
            format: "uuid",
            example: "00000000-0000-0000-0000-000000000000",
          },

          title: {
            type: "string",
            example: "Factorial of a Number",
          },

          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
            example: "easy",
          },

          tags: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["recursion", "math"],
          },
        },
      },

      ProblemDetails: {
        type: "object",
        required: [
          "_id",
          "title",
          "description",
          "difficulty",
          "tags",
          "visibleTestCases",
          "startCode",
          "referenceSolution",
        ],

        properties: {
          _id: {
            type: "string",
            format: "uuid",
            example: "00000000-0000-0000-0000-000000000000",
          },

          title: {
            type: "string",
            example: "Factorial of a Number",
          },

          description: {
            type: "string",
            example:
              "Given a non-negative integer n, return the factorial of n.",
          },

          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
            example: "easy",
          },

          tags: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["recursion", "math"],
          },

          visibleTestCases: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ProblemTestCase",
            },
          },

          startCode: {
            type: "array",
            items: {
              $ref: "#/components/schemas/StarterCode",
            },
          },

          referenceSolution: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ReferenceSolution",
            },
          },
        },
      },

      // --------------------------------------------------
      // SUBMISSION SCHEMAS
      // --------------------------------------------------

      SubmissionRequest: {
        type: "object",
        required: ["code", "language"],
        additionalProperties: false,

        properties: {
          code: {
            type: "string",
            maxLength: 50000,
            example:
              "int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}",
          },

          language: {
            type: "string",
            maxLength: 32,
            enum: ["c++", "cpp", "java", "javascript"],
            example: "cpp",
          },
        },
      },

      SubmitResponse: {
        type: "object",
        required: [
          "accepted",
          "totalTestCases",
          "passedTestCases",
          "runtime",
          "memory",
        ],

        properties: {
          accepted: {
            type: "boolean",
            example: true,
          },

          totalTestCases: {
            type: "integer",
            example: 5,
          },

          passedTestCases: {
            type: "integer",
            example: 5,
          },

          runtime: {
            type: "number",
            example: 0.123,
          },

          memory: {
            type: "number",
            example: 10240,
          },
        },
      },

      RunResponse: {
        type: "object",
        required: ["success", "testCases", "runtime", "memory"],

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          testCases: {
            type: "array",
            description:
              "Judge0 results for each visible test case.",
            items: {
              type: "object",
              additionalProperties: true,
            },
          },

          runtime: {
            type: "number",
            example: 0.123,
          },

          memory: {
            type: "number",
            example: 10240,
          },
        },
      },
    },
  },

  // ==================================================
  // API PATHS
  // ==================================================

  paths: {
    // ==================================================
    // HEALTH
    // ==================================================

    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        description:
          "Returns the current health status of the CodeNova API.",

        responses: {
          200: {
            description: "API is healthy",

            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "CodeNova API is healthy",
                },
              },
            },
          },
        },
      },
    },

    // ==================================================
    // AUTHENTICATION
    // ==================================================

    "/user/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a user",

        description:
          "Creates a normal user account. The generated JWT is stored in an HTTP-only 'token' cookie. Registration is limited to 5 requests per IP within the configured rate-limit window.",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },

        responses: {
          201: {
            description: "User successfully registered",

            headers: {
              "Set-Cookie": {
                $ref: "#/components/headers/SetCookie",
              },

              "X-RateLimit-Limit": {
                $ref: "#/components/headers/XRateLimitLimit",
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterResponse",
                },

                example: {
                  success: true,
                  message: "Registered successfully",
                  data: {
                    firstName: "Priyanshu",
                    emailId: "user@example.com",
                    _id: "00000000-0000-0000-0000-000000000000",
                    role: "user",
                  },
                },
              },
            },
          },

          400: {
            description: "Validation error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Validation failed.",
                  error: {
                    code: "VALIDATION_ERROR",
                    details: [
                      {
                        field: "emailId",
                        message:
                          "must be a valid email address",
                      },
                    ],
                  },
                },
              },
            },
          },

          409: {
            description: "Duplicate user record",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "A record with that value already exists.",
                  error: {
                    code: "DUPLICATE_RECORD",
                  },
                },
              },
            },
          },

          429: {
            description: "Registration rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                $ref: "#/components/headers/XRateLimitLimit",
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "Too many requests. Please try again later.",
                  error: {
                    code: "RATE_LIMIT_EXCEEDED",
                  },
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description: "Rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "Rate limiting service is temporarily unavailable. Please try again later.",
                  error: {
                    code:
                      "RATE_LIMIT_SERVICE_UNAVAILABLE",
                  },
                },
              },
            },
          },
        },
      },
    },

    "/user/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login a user or admin",

        description:
          "Authenticates either a normal user or an admin account. Both account types use this same endpoint. The generated JWT is stored in an HTTP-only 'token' cookie. Login is limited to 10 requests per IP within the configured rate-limit window.",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },

        responses: {
          200: {
            description: "User successfully authenticated",

            headers: {
              "Set-Cookie": {
                $ref: "#/components/headers/SetCookie",
              },

              "X-RateLimit-Limit": {
                $ref: "#/components/headers/XRateLimitLimit",
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },

                example: {
                  success: true,
                  message: "Logged in successfully",
                  data: {
                    firstName: "User",
                    emailId: "user@example.com",
                    _id: "00000000-0000-0000-0000-000000000000",
                    role: "user",
                  },
                },
              },
            },
          },

          400: {
            description: "Validation error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Validation failed.",
                  error: {
                    code: "VALIDATION_ERROR",
                    details: [
                      {
                        field: "emailId",
                        message:
                          "must be a valid email address",
                      },
                    ],
                  },
                },
              },
            },
          },

          401: {
            description: "Invalid email or password",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Invalid email or password.",
                  error: {
                    code: "AUTHENTICATION_ERROR",
                  },
                },
              },
            },
          },

          429: {
            description: "Login rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                $ref: "#/components/headers/XRateLimitLimit",
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "Too many requests. Please try again later.",
                  error: {
                    code: "RATE_LIMIT_EXCEEDED",
                  },
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description: "Rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "Rate limiting service is temporarily unavailable. Please try again later.",
                  error: {
                    code:
                      "RATE_LIMIT_SERVICE_UNAVAILABLE",
                  },
                },
              },
            },
          },
        },
      },
    },

    "/user/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout current user",

        description:
          "Invalidates the current JWT through the Redis token blocklist and clears the authentication cookie.",

        security: [{ cookieAuth: [] }],

        responses: {
          200: {
            description: "User successfully logged out",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmptyDataResponse",
                },

                example: {
                  success: true,
                  message: "Logged out successfully",
                  data: null,
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Authentication required.",
                  error: {
                    code: "AUTHENTICATION_ERROR",
                  },
                },
              },
            },
          },

          503: {
            description: "Logout service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "Unable to log out at this time. Please try again later.",
                  error: {
                    code: "EXTERNAL_SERVICE_ERROR",
                  },
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/user/check": {
      get: {
        tags: ["Authentication"],
        summary: "Check authenticated user",

        description:
          "Returns the currently authenticated user's profile information.",

        security: [{ cookieAuth: [] }],

        responses: {
          200: {
            description: "Authenticated user information",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthCheckResponse",
                },

                example: {
                  success: true,
                  message: "Valid User",
                  data: {
                    firstName: "User",
                    emailId: "user@example.com",
                    _id: "00000000-0000-0000-0000-000000000000",
                    role: "user",
                  },
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Authentication required.",
                  error: {
                    code: "AUTHENTICATION_ERROR",
                  },
                },
              },
            },
          },

          503: {
            description: "Authentication service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/user/deleteProfile": {
      delete: {
        tags: ["Authentication"],
        summary: "Delete current user profile",

        description:
          "Deletes the currently authenticated user's account.",

        security: [{ cookieAuth: [] }],

        responses: {
          200: {
            description: "Profile successfully deleted",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmptyDataResponse",
                },

                example: {
                  success: true,
                  message: "Profile deleted successfully",
                  data: null,
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          404: {
            description: "User not found",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description: "Authentication service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/user/admin/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register an admin or employee",

        description:
          "Creates an admin/employee account. Requires an authenticated administrator. This endpoint is intended for administrative account provisioning and is not public registration. Admin registration is limited to 3 requests per authenticated admin within the configured rate-limit window.",

        security: [{ cookieAuth: [] }],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },

        responses: {
          201: {
            description: "Admin successfully registered",

            headers: {
              "Set-Cookie": {
                $ref: "#/components/headers/SetCookie",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminRegisterResponse",
                },
              },
            },
          },

          400: {
            description: "Validation error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          403: {
            description: "Admin privileges required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Administrator access is required.",
                  error: {
                    code: "AUTHORIZATION_ERROR",
                  },
                },
              },
            },
          },

          409: {
            description: "Duplicate user record",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "A record with that value already exists.",
                  error: {
                    code: "DUPLICATE_RECORD",
                  },
                },
              },
            },
          },

          429: {
            description: "Admin registration rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                description:
                  "Maximum admin registration requests per window.",
                schema: {
                  type: "integer",
                  example: 3,
                },
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "Too many requests. Please try again later.",
                  error: {
                    code: "RATE_LIMIT_EXCEEDED",
                  },
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    // ==================================================
    // PROBLEMS
    // ==================================================

    "/problem/create": {
      post: {
        tags: ["Problems"],
        summary: "Create a coding problem",

        description:
          "Creates a new coding problem. Requires an authenticated admin account. Admin problem writes are limited to 20 requests per authenticated admin within the configured rate-limit window.",

        security: [{ cookieAuth: [] }],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProblemRequest",
              },
            },
          },
        },

        responses: {
          201: {
            description: "Problem successfully created",

            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Problem Saved Successfully",
                },
              },
            },
          },

          400: {
            description:
              "Validation error or invalid reference solution",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          403: {
            description: "Admin privileges required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Administrator access is required.",
                  error: {
                    code: "AUTHORIZATION_ERROR",
                  },
                },
              },
            },
          },

          409: {
            description: "Duplicate problem title",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "A problem with this title already exists.",
                  error: {
                    code: "DUPLICATE_PROBLEM",
                  },
                },
              },
            },
          },

          429: {
            description: "Admin write rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                $ref: "#/components/headers/XRateLimitLimit",
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/problem/update/{id}": {
      put: {
        tags: ["Problems"],
        summary: "Update a coding problem",

        description:
          "Updates an existing coding problem. Requires an authenticated admin account.",

        security: [{ cookieAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unique identifier of the problem.",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProblemRequest",
              },
            },
          },
        },

        responses: {
          200: {
            description: "Problem successfully updated",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProblemDetails",
                },
              },
            },
          },

          400: {
            description:
              "Validation error, invalid reference solution, or missing ID",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          403: {
            description: "Admin privileges required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          404: {
            description: "Problem not found",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Problem not found.",
                  error: {
                    code: "NOT_FOUND",
                  },
                },
              },
            },
          },

          409: {
            description: "Duplicate problem title",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          429: {
            description: "Admin write rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                $ref: "#/components/headers/XRateLimitLimit",
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/problem/delete/{id}": {
      delete: {
        tags: ["Problems"],
        summary: "Delete a coding problem",

        description:
          "Deletes an existing coding problem. Requires an authenticated admin account.",

        security: [{ cookieAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unique identifier of the problem.",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        responses: {
          200: {
            description: "Problem successfully deleted",

            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Successfully Deleted",
                },
              },
            },
          },

          400: {
            description: "Missing problem ID",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          403: {
            description: "Admin privileges required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          404: {
            description: "Problem not found",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          429: {
            description: "Admin write rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                $ref: "#/components/headers/XRateLimitLimit",
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/problem/problemById/{id}": {
      get: {
        tags: ["Problems"],
        summary: "Get a problem by ID",

        description:
          "Returns complete problem details including visible test cases, starter code, and reference solutions. Hidden test cases are not returned by this endpoint.",

        security: [{ cookieAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unique identifier of the problem.",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        responses: {
          200: {
            description: "Problem details returned",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProblemDetails",
                },
              },
            },
          },

          400: {
            description: "Missing problem ID",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          404: {
            description: "Problem not found",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Problem not found.",
                  error: {
                    code: "NOT_FOUND",
                  },
                },
              },
            },
          },

          429: {
            description: "General rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                $ref: "#/components/headers/XRateLimitLimit",
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/problem/getAllProblem": {
      get: {
        tags: ["Problems"],
        summary: "Get all coding problems",

        description:
          "Returns a list of problem summaries. Requires authentication.",

        security: [{ cookieAuth: [] }],

        responses: {
          200: {
            description: "Problem list returned",

            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/ProblemSummary",
                  },
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          404: {
            description: "No problems found",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Problem not found.",
                  error: {
                    code: "NOT_FOUND",
                  },
                },
              },
            },
          },

          429: {
            description: "General rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                description:
                  "Maximum general requests per window.",
                schema: {
                  type: "integer",
                  example: 120,
                },
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/problem/problemSolvedByUser": {
      get: {
        tags: ["Problems"],
        summary: "Get problems solved by current user",

        description:
          "Returns coding problems solved by the currently authenticated user.",

        security: [{ cookieAuth: [] }],

        responses: {
          200: {
            description: "Solved problems returned",

            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/ProblemSummary",
                  },
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          429: {
            description: "General rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                description:
                  "Maximum general requests per window.",
                schema: {
                  type: "integer",
                  example: 120,
                },
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/problem/submittedProblem/{pid}": {
      get: {
        tags: ["Problems"],
        summary: "Get current user's submissions for a problem",

        description:
          "Returns up to the 20 most recent submissions for the authenticated user and specified problem.",

        security: [{ cookieAuth: [] }],

        parameters: [
          {
            name: "pid",
            in: "path",
            required: true,
            description: "Unique identifier of the problem.",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        responses: {
          200: {
            description:
              "Submission history returned, or a message when none exist.",

            content: {
              "application/json": {
                oneOf: [
                  {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: true,
                    },
                  },
                  {
                    type: "string",
                    example: "No Submission is persent",
                  },
                ],
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          429: {
            description: "General rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                description:
                  "Maximum general requests per window.",
                schema: {
                  type: "integer",
                  example: 120,
                },
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    // ==================================================
    // SUBMISSIONS
    // ==================================================

    "/submission/submit/{id}": {
      post: {
        tags: ["Submissions"],
        summary: "Submit code for a problem",

        description:
          "Executes the submitted code against hidden test cases and records the submission result. Requires authentication. Code submissions are limited to 5 requests per authenticated user within the configured rate-limit window.",

        security: [{ cookieAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unique identifier of the problem.",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubmissionRequest",
              },
            },
          },
        },

        responses: {
          201: {
            description: "Code submission evaluated",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SubmitResponse",
                },

                example: {
                  accepted: true,
                  totalTestCases: 5,
                  passedTestCases: 5,
                  runtime: 0.123,
                  memory: 10240,
                },
              },
            },
          },

          400: {
            description: "Missing required submission fields",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          404: {
            description: "Problem not found",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Problem not found.",
                  error: {
                    code: "NOT_FOUND",
                  },
                },
              },
            },
          },

          429: {
            description: "Code submission rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                description:
                  "Maximum code submissions per user per window.",
                schema: {
                  type: "integer",
                  example: 5,
                },
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "Too many requests. Please try again later.",
                  error: {
                    code: "RATE_LIMIT_EXCEEDED",
                  },
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/submission/run/{id}": {
      post: {
        tags: ["Submissions"],
        summary: "Run code against visible test cases",

        description:
          "Executes submitted code against the problem's visible test cases without creating a submission record. Requires authentication. Code execution is limited to 10 requests per authenticated user within the configured rate-limit window.",

        security: [{ cookieAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unique identifier of the problem.",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubmissionRequest",
              },
            },
          },
        },

        responses: {
          201: {
            description:
              "Code executed against visible test cases",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RunResponse",
                },

                example: {
                  success: true,
                  testCases: [],
                  runtime: 0.123,
                  memory: 10240,
                },
              },
            },
          },

          400: {
            description: "Missing required submission fields",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          401: {
            description: "Authentication required",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          404: {
            description: "Problem not found",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message: "Problem not found.",
                  error: {
                    code: "NOT_FOUND",
                  },
                },
              },
            },
          },

          429: {
            description: "Code execution rate limit exceeded",

            headers: {
              "Retry-After": {
                $ref: "#/components/headers/RetryAfter",
              },

              "X-RateLimit-Limit": {
                description:
                  "Maximum code execution requests per user per window.",
                schema: {
                  type: "integer",
                  example: 10,
                },
              },

              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/XRateLimitRemaining",
              },

              "X-RateLimit-Reset": {
                $ref: "#/components/headers/XRateLimitReset",
              },
            },

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },

                example: {
                  success: false,
                  message:
                    "Too many requests. Please try again later.",
                  error: {
                    code: "RATE_LIMIT_EXCEEDED",
                  },
                },
              },
            },
          },

          500: {
            description: "Internal server error",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },

          503: {
            description:
              "Authentication or rate limiting service unavailable",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});

module.exports = swaggerSpec;