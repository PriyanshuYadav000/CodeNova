import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Editor from '@monaco-editor/react';
import {
  NavLink,
  useParams,
} from 'react-router';
import { useSelector } from 'react-redux';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  Code2,
  Expand,
  Minimize2,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';

const LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
};

const normalizeLanguage = (language) => {
  if (typeof language !== 'string') {
    return '';
  }

  const value = language.trim().toLowerCase();

  if (
    value === 'cpp' ||
    value === 'c++'
  ) {
    return 'cpp';
  }

  if (
    value === 'javascript' ||
    value === 'js'
  ) {
    return 'javascript';
  }

  if (value === 'java') {
    return 'java';
  }

  return value;
};

const getInitialCode = (
  problemData,
  selectedLanguage
) => {
  if (!problemData?.startCode?.length) {
    return '';
  }

  const normalizedSelectedLanguage =
    normalizeLanguage(
      selectedLanguage
    );

  const matchingCode =
    problemData.startCode.find(
      (item) =>
        normalizeLanguage(
          item.language
        ) ===
        normalizedSelectedLanguage
    );

  return (
    matchingCode?.initialCode ||
    ''
  );
};

const getErrorMessage = (
  error,
  fallback
) => {
  const status =
    error?.response?.status;

  if (status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  if (status === 403) {
    return 'You are not allowed to perform this action.';
  }

  if (status === 404) {
    return 'The requested problem or resource was not found.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (status >= 500) {
    return 'The server encountered an error. Please try again.';
  }

  if (!error?.response) {
    return 'Unable to connect to the CodeNova server. Please check your connection.';
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.error?.message ||
    error.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const getDifficultyColor = (
  difficulty
) => {
  switch (
    difficulty?.toLowerCase()
  ) {
    case 'easy':
      return 'text-success';

    case 'medium':
      return 'text-warning';

    case 'hard':
      return 'text-error';

    default:
      return 'text-base-content/60';
  }
};

const getDifficultyBadge = (
  difficulty
) => {
  switch (
    difficulty?.toLowerCase()
  ) {
    case 'easy':
      return 'badge-success';

    case 'medium':
      return 'badge-warning';

    case 'hard':
      return 'badge-error';

    default:
      return 'badge-neutral';
  }
};

const getRunTestCaseStatus = (
  testCase
) => {
  return testCase?.status_id === 3
    ? 'Passed'
    : 'Failed';
};

const ProblemPage = () => {
  const { problemId } =
    useParams();

  const { user } = useSelector(
    (state) => state.auth
  );

  const editorRef =
    useRef(null);

  const mountedRef =
    useRef(true);

  const [problem, setProblem] =
    useState(null);

  const [isSolved, setIsSolved] =
    useState(false);

  const [
    selectedLanguage,
    setSelectedLanguage,
  ] = useState('javascript');

  const [code, setCode] =
    useState('');

  const [pageLoading, setPageLoading] =
    useState(true);

  const [
    problemRetrying,
    setProblemRetrying,
  ] = useState(false);

  const [isRunning, setIsRunning] =
    useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [runResult, setRunResult] =
    useState(null);

  const [
    submitResult,
    setSubmitResult,
  ] = useState(null);

  const [
    activeLeftTab,
    setActiveLeftTab,
  ] = useState('description');

  const [
    activeRightTab,
    setActiveRightTab,
  ] = useState('code');

  const [pageError, setPageError] =
    useState('');

  const [
    solvedStatusError,
    setSolvedStatusError,
  ] = useState('');

  const [
    editorFullscreen,
    setEditorFullscreen,
  ] = useState(false);

  const [
    editorFontSize,
    setEditorFontSize,
  ] = useState(14);

  const isBusy =
    isRunning ||
    isSubmitting;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadProblem =
    useCallback(async () => {
      if (!problemId) {
        setPageLoading(false);
        setPageError(
          'Missing problem ID.'
        );
        return;
      }

      setPageLoading(true);
      setPageError('');
      setSolvedStatusError('');

      try {
        const problemResponse =
          await axiosClient.get(
            `/problem/problemById/${problemId}`
          );

        const problemData =
          problemResponse.data;

        if (!problemData) {
          throw new Error(
            'Problem data is empty.'
          );
        }

        if (
          !mountedRef.current
        ) {
          return;
        }

        setProblem(
          problemData
        );

        setSelectedLanguage(
          'javascript'
        );

        setCode(
          getInitialCode(
            problemData,
            'javascript'
          )
        );

        setRunResult(null);
        setSubmitResult(null);
        setActiveLeftTab(
          'description'
        );
        setActiveRightTab(
          'code'
        );

        try {
          const solvedResponse =
            await axiosClient.get(
              '/problem/problemSolvedByUser'
            );

          if (
            !mountedRef.current
          ) {
            return;
          }

          const solvedProblems =
            Array.isArray(
              solvedResponse.data
            )
              ? solvedResponse.data
              : [];

          const alreadySolved =
            solvedProblems.some(
              (solvedProblem) =>
                solvedProblem._id ===
                problemData._id
            );

          setIsSolved(
            alreadySolved
          );
        } catch (error) {
          if (
            !mountedRef.current
          ) {
            return;
          }

          console.error(
            'Error fetching solved status:',
            error.response?.data ||
              error
          );

          setIsSolved(false);

          setSolvedStatusError(
            getErrorMessage(
              error,
              'Unable to load your solved status.'
            )
          );
        }
      } catch (error) {
        if (
          !mountedRef.current
        ) {
          return;
        }

        console.error(
          'Error fetching problem:',
          error.response?.data ||
            error
        );

        setProblem(null);
        setCode('');
        setPageError(
          getErrorMessage(
            error,
            'Unable to load this problem.'
          )
        );
      } finally {
        if (
          mountedRef.current
        ) {
          setPageLoading(false);
        }
      }
    }, [problemId]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  useEffect(() => {
    if (!problem) {
      return;
    }

    const initialCode =
      getInitialCode(
        problem,
        selectedLanguage
      );

    setCode(initialCode);

    setRunResult(null);
    setSubmitResult(null);
    setActiveRightTab(
      'code'
    );
  }, [
    selectedLanguage,
    problem,
  ]);

  const handleEditorChange =
    (value) => {
      setCode(value || '');
    };

  const handleEditorDidMount =
    (editor) => {
      editorRef.current =
        editor;
    };

  const handleLanguageChange =
    (language) => {
      if (isBusy) {
        return;
      }

      setSelectedLanguage(
        language
      );
    };

  const handleResetCode = () => {
    if (!problem || isBusy) {
      return;
    }

    const initialCode =
      getInitialCode(
        problem,
        selectedLanguage
      );

    setCode(initialCode);
    setRunResult(null);
    setSubmitResult(null);
    setActiveRightTab(
      'code'
    );
  };

  const handleEditorFullscreen =
    () => {
      setEditorFullscreen(
        (previous) =>
          !previous
      );
    };

  const handleRun = async () => {
    if (!problem || isBusy) {
      return;
    }

    if (!code.trim()) {
      setRunResult({
        success: false,
        error:
          'Please write some code before running.',
        testCases: [],
      });

      setSubmitResult(null);
      setActiveRightTab(
        'testcase'
      );

      return;
    }

    setIsRunning(true);
    setRunResult(null);
    setSubmitResult(null);

    try {
      const response =
        await axiosClient.post(
          `/submission/run/${problemId}`,
          {
            code,
            language:
              selectedLanguage,
          }
        );

      if (!mountedRef.current) {
        return;
      }

      const result =
        response.data;

      setRunResult({
        success: Boolean(
          result?.success
        ),

        testCases:
          Array.isArray(
            result?.testCases
          )
            ? result.testCases
            : [],

        runtime:
          result?.runtime ?? 0,

        memory:
          result?.memory ?? 0,

        error:
          result?.error || null,
      });

      setActiveRightTab(
        'testcase'
      );
    } catch (error) {
      if (
        !mountedRef.current
      ) {
        return;
      }

      console.error(
        'Error running code:',
        error.response?.data ||
          error
      );

      setRunResult({
        success: false,
        error: getErrorMessage(
          error,
          'Unable to run code.'
        ),
        testCases: [],
        runtime: 0,
        memory: 0,
      });

      setActiveRightTab(
        'testcase'
      );
    } finally {
      if (
        mountedRef.current
      ) {
        setIsRunning(false);
      }
    }
  };

  const handleSubmitCode =
    async () => {
      if (!problem || isBusy) {
        return;
      }

      if (!code.trim()) {
        setSubmitResult({
          accepted: false,
          error:
            'Please write some code before submitting.',
          passedTestCases: 0,
          totalTestCases: 0,
          runtime: 0,
          memory: 0,
        });

        setRunResult(null);
        setActiveRightTab(
          'result'
        );

        return;
      }

      setIsSubmitting(true);
      setSubmitResult(null);
      setRunResult(null);

      try {
        const response =
          await axiosClient.post(
            `/submission/submit/${problemId}`,
            {
              code,
              language:
                selectedLanguage,
            }
          );

        if (!mountedRef.current) {
          return;
        }

        const result =
          response.data;

        const accepted = Boolean(
          result?.accepted
        );

        setSubmitResult({
          accepted,

          error:
            result?.error || null,

          passedTestCases:
            result?.passedTestCases ??
            0,

          totalTestCases:
            result?.totalTestCases ??
            0,

          runtime:
            result?.runtime ?? 0,

          memory:
            result?.memory ?? 0,
        });

        if (accepted) {
          setIsSolved(true);
          setSolvedStatusError('');
        }

        setActiveRightTab(
          'result'
        );
      } catch (error) {
        if (
          !mountedRef.current
        ) {
          return;
        }

        console.error(
          'Error submitting code:',
          error.response?.data ||
            error
        );

        setSubmitResult({
          accepted: false,

          error: getErrorMessage(
            error,
            'Unable to submit code.'
          ),

          passedTestCases: 0,

          totalTestCases: 0,

          runtime: 0,

          memory: 0,
        });

        setActiveRightTab(
          'result'
        );
      } finally {
        if (
          mountedRef.current
        ) {
          setIsSubmitting(false);
        }
      }
    };

  const getLanguageForMonaco =
    (language) => {
      switch (
        normalizeLanguage(language)
      ) {
        case 'javascript':
          return 'javascript';

        case 'java':
          return 'java';

        case 'cpp':
          return 'cpp';

        default:
          return 'plaintext';
      }
    };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg" />

          <p className="text-base-content/60">
            Loading problem...
          </p>
        </div>
      </div>
    );
  }

  if (pageError || !problem) {
    return (
      <div className="min-h-screen bg-base-200">
        <header className="navbar bg-base-100 border-b border-base-300 px-4 shadow-sm">
          <div className="flex-1">
            <NavLink
              to="/"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <Code2
                size={22}
                className="text-primary"
              />
              CodeNova
            </NavLink>
          </div>

          <div className="flex-none text-sm">
            {user?.firstName}
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
          <div className="card bg-base-100 shadow-xl max-w-xl w-full">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-error" />

                <h2 className="card-title text-error">
                  Unable to load problem
                </h2>
              </div>

              <p className="text-base-content/70 mt-2">
                {pageError ||
                  'Problem not found.'}
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() =>
                    loadProblem()
                  }
                  className="btn btn-primary"
                  disabled={
                    problemRetrying
                  }
                >
                  <RefreshCw
                    size={16}
                    className={
                      problemRetrying
                        ? 'animate-spin'
                        : ''
                    }
                  />

                  Try Again
                </button>

                <NavLink
                  to="/"
                  className="btn btn-ghost"
                >
                  <ChevronLeft
                    size={18}
                  />
                  Back to Problems
                </NavLink>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-100 overflow-hidden">
      <header className="h-14 shrink-0 bg-base-100 border-b border-base-300 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors"
          >
            <Code2
              size={21}
              className="text-primary"
            />

            CodeNova
          </NavLink>

          <div className="h-5 w-px bg-base-300" />

          <NavLink
            to="/"
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft size={16} />
            Problems
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              loadProblem()
            }
            disabled={isBusy}
            className="btn btn-ghost btn-circle btn-sm"
            title="Refresh problem"
          >
            <RefreshCw size={16} />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm text-base-content/60">
            <span>
              {user?.firstName}
            </span>
          </div>

          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-8">
              <span className="font-semibold">
                {user?.firstName
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        <div
          className={
            editorFullscreen
              ? 'hidden'
              : 'w-1/2 flex flex-col border-r border-base-300'
          }
        >
          <div className="shrink-0 p-5 border-b border-base-300 bg-base-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold">
                    {problem.title}
                  </h1>

                  {isSolved && (
                    <span className="badge badge-success gap-1">
                      <CheckCircle2
                        size={13}
                      />
                      Solved
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span
                    className={`badge badge-sm ${getDifficultyBadge(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty
                      ? problem.difficulty
                          .charAt(0)
                          .toUpperCase() +
                        problem.difficulty.slice(
                          1
                        )
                      : 'Unknown'}
                  </span>

                  {Array.isArray(
                    problem.tags
                  ) &&
                    problem.tags.map(
                      (tag) => (
                        <span
                          key={tag}
                          className="badge badge-outline badge-sm"
                        >
                          {tag}
                        </span>
                      )
                    )}
                </div>

                {solvedStatusError && (
                  <div className="mt-3 text-xs text-warning flex items-center gap-2">
                    <AlertCircle
                      size={14}
                    />

                    <span>
                      Your solved status
                      could not be loaded.
                    </span>

                    <button
                      type="button"
                      className="underline font-medium"
                      onClick={() =>
                        loadProblem()
                      }
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tabs tabs-bordered bg-base-100 px-4 shrink-0 overflow-x-auto">
            <button
              type="button"
              className={`tab whitespace-nowrap ${
                activeLeftTab ===
                'description'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveLeftTab(
                  'description'
                )
              }
            >
              Description
            </button>

            <button
              type="button"
              className={`tab whitespace-nowrap ${
                activeLeftTab ===
                'editorial'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveLeftTab(
                  'editorial'
                )
              }
            >
              Editorial
            </button>

            <button
              type="button"
              className={`tab whitespace-nowrap ${
                activeLeftTab ===
                'solutions'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveLeftTab(
                  'solutions'
                )
              }
            >
              Solutions
            </button>

            <button
              type="button"
              className={`tab whitespace-nowrap ${
                activeLeftTab ===
                'submissions'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveLeftTab(
                  'submissions'
                )
              }
            >
              Submissions
            </button>

            <button
              type="button"
              className={`tab whitespace-nowrap ${
                activeLeftTab ===
                'chatAI'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveLeftTab(
                  'chatAI'
                )
              }
            >
              AI Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeLeftTab ===
              'description' && (
              <div>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-7 text-base-content/85">
                    {
                      problem.description
                    }
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Examples
                  </h3>

                  <div className="space-y-4">
                    {Array.isArray(
                      problem.visibleTestCases
                    ) &&
                      problem.visibleTestCases.map(
                        (
                          example,
                          index
                        ) => (
                          <div
                            key={index}
                            className="border border-base-300 rounded-xl overflow-hidden"
                          >
                            <div className="px-4 py-3 bg-base-200 border-b border-base-300 font-semibold text-sm">
                              Example{' '}
                              {index + 1}
                            </div>

                            <div className="p-4 space-y-4 text-sm">
                              <div>
                                <div className="text-xs uppercase tracking-wide text-base-content/50 mb-1">
                                  Input
                                </div>

                                <pre className="bg-base-200 rounded-lg p-3 overflow-x-auto">
                                  <code>
                                    {
                                      example.input
                                    }
                                  </code>
                                </pre>
                              </div>

                              <div>
                                <div className="text-xs uppercase tracking-wide text-base-content/50 mb-1">
                                  Output
                                </div>

                                <pre className="bg-base-200 rounded-lg p-3 overflow-x-auto">
                                  <code>
                                    {
                                      example.output
                                    }
                                  </code>
                                </pre>
                              </div>

                              {example.explanation && (
                                <div>
                                  <div className="text-xs uppercase tracking-wide text-base-content/50 mb-1">
                                    Explanation
                                  </div>

                                  <p className="text-base-content/70 leading-6">
                                    {
                                      example.explanation
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}

                    {!problem
                      .visibleTestCases
                      ?.length && (
                      <div className="text-sm text-base-content/50">
                        No visible examples
                        available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeLeftTab ===
              'editorial' && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Editorial
                </h2>

                <div className="rounded-xl border border-base-300 bg-base-100 p-5">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <Sparkles
                      size={17}
                    />

                    <span className="font-semibold">
                      Coming soon
                    </span>
                  </div>

                  <p className="text-sm text-base-content/60 leading-6">
                    A detailed explanation
                    and optimal approach for
                    this problem will be
                    available here.
                  </p>
                </div>
              </div>
            )}

            {activeLeftTab ===
              'solutions' && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Solutions
                </h2>

                <div className="space-y-6">
                  {Array.isArray(
                    problem.referenceSolution
                  ) &&
                  problem
                    .referenceSolution
                    .length > 0 ? (
                    problem.referenceSolution.map(
                      (
                        solution,
                        index
                      ) => (
                        <div
                          key={`${solution.language}-${index}`}
                          className="border border-base-300 rounded-xl overflow-hidden"
                        >
                          <div className="bg-base-200 px-4 py-3 border-b border-base-300">
                            <h3 className="font-semibold text-sm">
                              {LANGUAGE_LABELS[
                                normalizeLanguage(
                                  solution.language
                                )
                              ] ||
                                solution.language}
                            </h3>
                          </div>

                          <div className="p-4">
                            <pre className="bg-base-300 rounded-lg p-4 text-sm overflow-x-auto">
                              <code>
                                {
                                  solution.completeCode
                                }
                              </code>
                            </pre>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-sm text-base-content/50">
                      Solutions will be
                      available after you
                      solve the problem.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeLeftTab ===
              'submissions' && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  My Submissions
                </h2>

                <SubmissionHistory
                  problemId={
                    problemId
                  }
                />
              </div>
            )}

            {activeLeftTab ===
              'chatAI' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BotIcon />

                  <h2 className="text-xl font-bold">
                    AI Coding Assistant
                  </h2>
                </div>

                <ChatAi />
              </div>
            )}
          </div>
        </div>

        <div
          className={
            editorFullscreen
              ? 'w-full flex flex-col'
              : 'w-1/2 flex flex-col'
          }
        >
          <div className="tabs tabs-bordered bg-base-200 px-4 shrink-0">
            <button
              type="button"
              className={`tab ${
                activeRightTab ===
                'code'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveRightTab(
                  'code'
                )
              }
            >
              Code
            </button>

            <button
              type="button"
              className={`tab ${
                activeRightTab ===
                'testcase'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveRightTab(
                  'testcase'
                )
              }
            >
              Testcase
            </button>

            <button
              type="button"
              className={`tab ${
                activeRightTab ===
                'result'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveRightTab(
                  'result'
                )
              }
            >
              Result
            </button>
          </div>

          {activeRightTab ===
            'code' && (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="h-12 shrink-0 border-b border-base-300 bg-base-100 flex items-center justify-between px-3">
                <div className="flex items-center gap-1">
                  {[
                    'javascript',
                    'java',
                    'cpp',
                  ].map(
                    (language) => (
                      <button
                        key={language}
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleLanguageChange(
                            language
                          )
                        }
                        className={`btn btn-xs sm:btn-sm ${
                          selectedLanguage ===
                          language
                            ? 'btn-primary'
                            : 'btn-ghost'
                        }`}
                      >
                        {
                          LANGUAGE_LABELS[
                            language
                          ]
                        }
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setEditorFontSize(
                        (size) =>
                          Math.max(
                            11,
                            size - 1
                          )
                      )
                    }
                    className="btn btn-ghost btn-xs"
                    disabled={
                      isBusy
                    }
                    title="Decrease font size"
                  >
                    A-
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditorFontSize(
                        (size) =>
                          Math.min(
                            22,
                            size + 1
                          )
                      )
                    }
                    className="btn btn-ghost btn-xs"
                    disabled={
                      isBusy
                    }
                    title="Increase font size"
                  >
                    A+
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleResetCode
                    }
                    disabled={isBusy}
                    className="btn btn-ghost btn-sm"
                    title="Reset code"
                  >
                    <RotateCcw
                      size={15}
                    />

                    <span className="hidden xl:inline">
                      Reset
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleEditorFullscreen
                    }
                    className="btn btn-ghost btn-sm"
                    title={
                      editorFullscreen
                        ? 'Exit fullscreen'
                        : 'Fullscreen editor'
                    }
                  >
                    {editorFullscreen ? (
                      <Minimize2
                        size={16}
                      />
                    ) : (
                      <Expand
                        size={16}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    title="Editor settings"
                  >
                    <Settings2
                      size={16}
                    />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(
                    selectedLanguage
                  )}
                  value={code}
                  onChange={
                    handleEditorChange
                  }
                  onMount={
                    handleEditorDidMount
                  }
                  theme="vs-dark"
                  options={{
                    fontSize:
                      editorFontSize,

                    minimap: {
                      enabled: false,
                    },

                    automaticLayout:
                      true,

                    readOnly:
                      isBusy,

                    cursorStyle:
                      'line',

                    mouseWheelZoom:
                      true,

                    padding: {
                      top: 12,
                      bottom: 12,
                    },

                    scrollBeyondLastLine:
                      false,

                    smoothScrolling:
                      true,

                    tabSize: 2,

                    wordWrap: 'on',
                  }}
                />
              </div>

              <div className="shrink-0 min-h-16 border-t border-base-300 bg-base-100 flex items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setActiveRightTab(
                      'testcase'
                    )
                  }
                >
                  Testcase
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleRun}
                    disabled={
                      isBusy ||
                      !problem
                    }
                  >
                    {isRunning ? (
                      <>
                        <span className="loading loading-spinner loading-xs" />
                        Running
                      </>
                    ) : (
                      <>
                        <Play
                          size={15}
                        />
                        Run
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={
                      handleSubmitCode
                    }
                    disabled={
                      isBusy ||
                      !problem
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-xs" />
                        Submitting
                      </>
                    ) : (
                      <>
                        <Send
                          size={15}
                        />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab ===
            'testcase' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold">
                    Test Results
                  </h3>

                  <p className="text-sm text-base-content/50">
                    Run your code against
                    the visible test cases.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setActiveRightTab(
                      'code'
                    )
                  }
                >
                  Back to Code
                </button>
              </div>

              {!runResult ? (
                <div className="border border-dashed border-base-300 rounded-2xl p-8 text-center">
                  <Play
                    size={28}
                    className="mx-auto text-base-content/30"
                  />

                  <p className="mt-3 text-sm text-base-content/50">
                    Click Run to test
                    your solution.
                  </p>
                </div>
              ) : (
                <div
                  className={`rounded-2xl border p-5 ${
                    runResult.success
                      ? 'border-success/30 bg-success/5'
                      : 'border-error/30 bg-error/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {runResult.success ? (
                      <CheckCircle2
                        className="text-success"
                        size={24}
                      />
                    ) : (
                      <AlertCircle
                        className="text-error"
                        size={24}
                      />
                    )}

                    <div>
                      <h4 className="font-bold">
                        {runResult.success
                          ? 'All test cases passed'
                          : 'Some test cases failed'}
                      </h4>

                      <p className="text-sm text-base-content/60">
                        {runResult.success
                          ? 'Your code produced the expected output.'
                          : runResult.error ||
                            'One or more test cases did not pass.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="rounded-xl bg-base-100 border border-base-300 p-3">
                      <p className="text-xs text-base-content/50">
                        Runtime
                      </p>

                      <p className="font-semibold mt-1">
                        {
                          runResult.runtime
                        }{' '}
                        sec
                      </p>
                    </div>

                    <div className="rounded-xl bg-base-100 border border-base-300 p-3">
                      <p className="text-xs text-base-content/50">
                        Memory
                      </p>

                      <p className="font-semibold mt-1">
                        {
                          runResult.memory
                        }{' '}
                        KB
                      </p>
                    </div>
                  </div>

                  {runResult.testCases
                    ?.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {runResult.testCases.map(
                        (
                          testCase,
                          index
                        ) => (
                          <div
                            key={index}
                            className="bg-base-100 border border-base-300 rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-sm">
                                Test Case{' '}
                                {index + 1}
                              </span>

                              <span
                                className={
                                  testCase.status_id ===
                                  3
                                    ? 'text-success text-xs font-medium'
                                    : 'text-error text-xs font-medium'
                                }
                              >
                                {getRunTestCaseStatus(
                                  testCase
                                )}
                              </span>
                            </div>

                            <div className="space-y-3 font-mono text-xs">
                              <div>
                                <p className="text-base-content/50 mb-1">
                                  Input
                                </p>

                                <pre className="bg-base-200 rounded-lg p-3 overflow-x-auto">
                                  {
                                    testCase.stdin
                                  }
                                </pre>
                              </div>

                              <div>
                                <p className="text-base-content/50 mb-1">
                                  Expected
                                </p>

                                <pre className="bg-base-200 rounded-lg p-3 overflow-x-auto">
                                  {
                                    testCase.expected_output
                                  }
                                </pre>
                              </div>

                              <div>
                                <p className="text-base-content/50 mb-1">
                                  Output
                                </p>

                                <pre className="bg-base-200 rounded-lg p-3 overflow-x-auto">
                                  {testCase.stdout ||
                                    'No output'}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeRightTab ===
            'result' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              <div className="mb-5">
                <h3 className="text-lg font-bold">
                  Submission Result
                </h3>

                <p className="text-sm text-base-content/50">
                  Final evaluation from the
                  hidden test cases.
                </p>
              </div>

              {!submitResult ? (
                <div className="border border-dashed border-base-300 rounded-2xl p-8 text-center">
                  <Send
                    size={28}
                    className="mx-auto text-base-content/30"
                  />

                  <p className="mt-3 text-sm text-base-content/50">
                    Submit your solution to
                    see the result.
                  </p>
                </div>
              ) : (
                <div
                  className={`rounded-2xl border p-6 ${
                    submitResult.accepted
                      ? 'border-success/30 bg-success/5'
                      : 'border-error/30 bg-error/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {submitResult.accepted ? (
                      <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center">
                        <CheckCircle2
                          className="text-success"
                          size={24}
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-error/10 flex items-center justify-center">
                        <AlertCircle
                          className="text-error"
                          size={24}
                        />
                      </div>
                    )}

                    <div>
                      <h4 className="text-xl font-bold">
                        {submitResult.accepted
                          ? 'Accepted'
                          : 'Submission Failed'}
                      </h4>

                      <p className="text-sm text-base-content/60 mt-1">
                        {submitResult.accepted
                          ? 'Great work! Your solution passed all hidden test cases.'
                          : submitResult.error ||
                            'Your solution did not pass all test cases.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                    <div className="bg-base-100 border border-base-300 rounded-xl p-4">
                      <p className="text-xs text-base-content/50">
                        Test Cases
                      </p>

                      <p className="font-bold text-lg mt-1">
                        {
                          submitResult.passedTestCases
                        }
                        /
                        {
                          submitResult.totalTestCases
                        }
                      </p>
                    </div>

                    <div className="bg-base-100 border border-base-300 rounded-xl p-4">
                      <p className="text-xs text-base-content/50">
                        Runtime
                      </p>

                      <p className="font-bold text-lg mt-1">
                        {
                          submitResult.runtime
                        }{' '}
                        sec
                      </p>
                    </div>

                    <div className="bg-base-100 border border-base-300 rounded-xl p-4">
                      <p className="text-xs text-base-content/50">
                        Memory
                      </p>

                      <p className="font-bold text-lg mt-1">
                        {
                          submitResult.memory
                        }{' '}
                        KB
                      </p>
                    </div>
                  </div>

                  {submitResult.accepted && (
                    <div className="mt-6 flex items-center gap-2 text-success text-sm font-medium">
                      <CheckCircle2
                        size={17}
                      />
                      Problem marked as
                      solved.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BotIcon = () => {
  return (
    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
      <Sparkles size={19} />
    </div>
  );
};

export default ProblemPage;