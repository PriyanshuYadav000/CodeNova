import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { NavLink, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  LogOut,
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

  if (value === 'cpp' || value === 'c++') {
    return 'cpp';
  }

  if (value === 'javascript' || value === 'js') {
    return 'javascript';
  }

  if (value === 'java') {
    return 'java';
  }

  return value;
};

const getInitialCode = (problemData, selectedLanguage) => {
  if (!problemData?.startCode?.length) {
    return '';
  }

  const normalizedSelectedLanguage =
    normalizeLanguage(selectedLanguage);

  const matchingCode = problemData.startCode.find(
    (item) =>
      normalizeLanguage(item.language) ===
      normalizedSelectedLanguage
  );

  return matchingCode?.initialCode || '';
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const ProblemPage = () => {
  const { problemId } = useParams();

  const { user } = useSelector((state) => state.auth);

  const [problem, setProblem] = useState(null);

  const [isSolved, setIsSolved] = useState(false);

  const [selectedLanguage, setSelectedLanguage] =
    useState('javascript');

  const [code, setCode] = useState('');

  // Only used while initially loading the problem.
  const [pageLoading, setPageLoading] =
    useState(true);

  // Separate loading states for Run and Submit.
  const [isRunning, setIsRunning] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [runResult, setRunResult] = useState(null);

  const [submitResult, setSubmitResult] =
    useState(null);

  const [activeLeftTab, setActiveLeftTab] =
    useState('description');

  const [activeRightTab, setActiveRightTab] =
    useState('code');

  const [pageError, setPageError] =
    useState('');

  const editorRef = useRef(null);

  // ============================================================
  // FETCH PROBLEM
  // ============================================================

  useEffect(() => {
    const fetchProblem = async () => {
      setPageLoading(true);
      setPageError('');

      try {
        const response = await axiosClient.get(
          `/problem/problemById/${problemId}`
        );

        const problemData = response.data;

        if (!problemData) {
          throw new Error(
            'Problem data is empty.'
          );
        }

        setProblem(problemData);

        const solvedResponse = await axiosClient.get(
          '/problem/problemSolvedByUser'
        );

        const solvedProblems = Array.isArray(solvedResponse.data)
          ? solvedResponse.data
            : [];

        const alreadySolved = solvedProblems.some(
          (solvedProblem) =>
            solvedProblem._id === problemData._id
        );

        setIsSolved(alreadySolved);

        setSelectedLanguage('javascript');

        setCode(
          getInitialCode(
            problemData,
            'javascript'
          )
        );
      } catch (error) {
        console.error(
          'Error fetching problem:',
          error.response?.data || error
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
        setPageLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  // ============================================================
  // CHANGE LANGUAGE
  // ============================================================

  useEffect(() => {
    if (!problem) {
      return;
    }

    const initialCode = getInitialCode(
      problem,
      selectedLanguage
    );

    setCode(initialCode);

    setRunResult(null);
    setSubmitResult(null);

    setActiveRightTab('code');
  }, [selectedLanguage]);

  // ============================================================
  // EDITOR
  // ============================================================

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    if (isRunning || isSubmitting) {
      return;
    }

    setSelectedLanguage(language);
  };

  // ============================================================
  // RUN CODE
  // ============================================================

  const handleRun = async () => {
    if (!problem) {
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
      setActiveRightTab('testcase');

      return;
    }

    setIsRunning(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(
        `/submission/run/${problemId}`,
        {
          code,
          language: selectedLanguage,
        }
      );

      const result = response.data;

      setRunResult({
        success: Boolean(result?.success),
        testCases: Array.isArray(
          result?.testCases
        )
          ? result.testCases
          : [],
        runtime: result?.runtime ?? 0,
        memory: result?.memory ?? 0,
        error: result?.error || null,
      });

      setActiveRightTab('testcase');
    } catch (error) {
      console.error(
        'Error running code:',
        error.response?.data || error
      );

      setRunResult({
        success: false,
        error: getErrorMessage(
          error,
          'Unable to run code.'
        ),
        testCases: [],
      });

      setActiveRightTab('testcase');
    } finally {
      setIsRunning(false);
    }
  };

  // ============================================================
  // SUBMIT CODE
  // ============================================================

  const handleSubmitCode = async () => {
  if (!problem) {
    return;
  }

  // Prevent blank submission.
  if (!code.trim()) {
    setSubmitResult({
      accepted: false,
      error: 'Please write some code before submitting.',
      passedTestCases: 0,
      totalTestCases: 0,
      runtime: 0,
      memory: 0,
    });

    setRunResult(null);
    setActiveRightTab('result');

    return;
  }

  setIsSubmitting(true);
  setSubmitResult(null);

  try {
    const response = await axiosClient.post(
      `/submission/submit/${problemId}`,
      {
        code,
        language: selectedLanguage,
      }
    );

    const result = response.data;

    const accepted = Boolean(result?.accepted);

    setSubmitResult({
      accepted,
      error: result?.error || null,
      passedTestCases:
        result?.passedTestCases ?? 0,
      totalTestCases:
        result?.totalTestCases ?? 0,
      runtime: result?.runtime ?? 0,
      memory: result?.memory ?? 0,
    });

    // Immediately update solved state in the UI.
    if (accepted) {
      setIsSolved(true);
    }

    setActiveRightTab('result');
  } catch (error) {
    console.error(
      'Error submitting code:',
      error.response?.data || error
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

    setActiveRightTab('result');
  } finally {
    setIsSubmitting(false);
  }
  };

  // ============================================================
  // MONACO LANGUAGE
  // ============================================================

  const getLanguageForMonaco = (language) => {
    switch (normalizeLanguage(language)) {
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

  // ============================================================
  // DIFFICULTY COLOR
  // ============================================================

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
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

  // ============================================================
  // PAGE LOADING
  // ============================================================

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // ============================================================
  // PAGE ERROR
  // ============================================================

  if (pageError || !problem) {
    return (
      <div className="min-h-screen bg-base-200">
        <header className="navbar bg-base-100 border-b border-base-300 px-4 shadow-sm">
          <div className="flex-1">
            <NavLink
              to="/"
              className="btn btn-ghost text-xl font-bold"
            >
              CodeNova
            </NavLink>
          </div>

          <div className="flex-none">
            <span className="text-sm font-medium">
              {user?.firstName}
            </span>
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

              <p className="text-base-content/70">
                {pageError ||
                  'Problem not found.'}
              </p>

              <div className="card-actions justify-end mt-4">
                <NavLink
                  to="/"
                  className="btn btn-primary"
                >
                  <ChevronLeft size={18} />
                  Back to Problems
                </NavLink>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isBusy =
    isRunning || isSubmitting;

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="navbar min-h-14 h-14 bg-base-100 border-b border-base-300 px-4 shadow-sm">
        {/* CodeNova → Homepage */}
        <div className="flex-1">
          <NavLink
            to="/"
            className="btn btn-ghost text-xl font-bold gap-2"
          >
            <span>CodeNova</span>
          </NavLink>
        </div>

        {/* User */}
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost gap-2"
            >
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span>
                    {user?.firstName
                      ?.charAt(0)
                      ?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              <span className="hidden sm:inline">
                {user?.firstName || 'User'}
              </span>
            </div>

            <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 z-50">
              <li>
                <NavLink to="/dashboard">
                  Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink to="/">
                  Problems
                </NavLink>
              </li>

              {user?.role === 'admin' && (
                <li>
                  <NavLink to="/admin">
                    Admin
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </header>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-h-0 flex">
        {/* ======================================================
            LEFT PANEL
        ====================================================== */}

        <div className="w-1/2 flex flex-col border-r border-base-300">
          {/* Left Tabs */}
          <div className="tabs tabs-bordered bg-base-200 px-4">
            <button
              type="button"
              className={`tab ${
                activeLeftTab === 'description'
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
              className={`tab ${
                activeLeftTab === 'editorial'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveLeftTab('editorial')
              }
            >
              Editorial
            </button>

            <button
              type="button"
              className={`tab ${
                activeLeftTab === 'solutions'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveLeftTab('solutions')
              }
            >
              Solutions
            </button>

            <button
              type="button"
              className={`tab ${
                activeLeftTab === 'submissions'
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
              className={`tab ${
                activeLeftTab === 'chatAI'
                  ? 'tab-active'
                  : ''
              }`}
              onClick={() =>
                setActiveLeftTab('chatAI')
              }
            >
              ChatAI
            </button>
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* DESCRIPTION */}
            {activeLeftTab ===
              'description' && (
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <h1 className="text-2xl font-bold">
                    {problem.title}
                  </h1>
                  {isSolved && (
                      <div className="badge badge-success gap-1">
                        <CheckCircle2 size={14} />
                        Solved
                      </div>
                  )}
                  <div
                    className={`badge badge-outline ${getDifficultyColor(
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
                      : ''}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(
                      problem.tags
                    ) &&
                      problem.tags.map(
                        (tag) => (
                          <div
                            key={tag}
                            className="badge badge-primary"
                          >
                            {tag}
                          </div>
                        )
                      )}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {problem.description}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Examples:
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
                            className="bg-base-200 p-4 rounded-lg"
                          >
                            <h4 className="font-semibold mb-2">
                              Example{' '}
                              {index + 1}:
                            </h4>

                            <div className="space-y-2 text-sm font-mono">
                              <div>
                                <strong>
                                  Input:
                                </strong>{' '}
                                <span className="whitespace-pre-wrap">
                                  {
                                    example.input
                                  }
                                </span>
                              </div>

                              <div>
                                <strong>
                                  Output:
                                </strong>{' '}
                                <span className="whitespace-pre-wrap">
                                  {
                                    example.output
                                  }
                                </span>
                              </div>

                              <div>
                                <strong>
                                  Explanation:
                                </strong>{' '}
                                <span className="whitespace-pre-wrap">
                                  {example.explanation ||
                                    'No explanation provided.'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      )}

                    {!problem.visibleTestCases
                      ?.length && (
                      <p className="text-base-content/60">
                        No visible examples
                        available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* EDITORIAL */}
            {activeLeftTab ===
              'editorial' && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold mb-4">
                  Editorial
                </h2>

                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  Editorial is here for
                  the problem
                </div>
              </div>
            )}

            {/* SOLUTIONS */}
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
                  problem.referenceSolution
                    .length > 0 ? (
                    problem.referenceSolution.map(
                      (
                        solution,
                        index
                      ) => (
                        <div
                          key={`${solution.language}-${index}`}
                          className="border border-base-300 rounded-lg"
                        >
                          <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                            <h3 className="font-semibold">
                              {
                                problem.title
                              }{' '}
                              -{' '}
                              {LANGUAGE_LABELS[
                                normalizeLanguage(
                                  solution.language
                                )
                              ] ||
                                solution.language}
                            </h3>
                          </div>

                          <div className="p-4">
                            <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
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
                    <p className="text-gray-500">
                      Solutions will be
                      available after you
                      solve the problem.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SUBMISSIONS */}
            {activeLeftTab ===
              'submissions' && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  My Submissions
                </h2>

                <SubmissionHistory
                  problemId={problemId}
                />
              </div>
            )}

            {/* CHAT AI */}
            {activeLeftTab ===
              'chatAI' && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold mb-4">
                  CHAT with AI
                </h2>

                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  <ChatAi />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            RIGHT PANEL
        ====================================================== */}

        <div className="w-1/2 flex flex-col">
          {/* Right Tabs */}
          <div className="tabs tabs-bordered bg-base-200 px-4">
            <button
              type="button"
              className={`tab ${
                activeRightTab === 'code'
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

          {/* Right Content */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/* CODE */}
            {activeRightTab ===
              'code' && (
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Language Selector */}
                <div className="flex justify-between items-center p-4 border-b border-base-300">
                  <div className="flex gap-2">
                    {[
                      'javascript',
                      'java',
                      'cpp',
                    ].map(
                      (language) => (
                        <button
                          key={
                            language
                          }
                          type="button"
                          disabled={isBusy}
                          className={`btn btn-sm ${
                            selectedLanguage ===
                            language
                              ? 'btn-primary'
                              : 'btn-ghost'
                          }`}
                          onClick={() =>
                            handleLanguageChange(
                              language
                            )
                          }
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
                </div>

                {/* Monaco Editor */}
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
                      fontSize: 14,
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
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-base-300 flex justify-between">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        setActiveRightTab(
                          'testcase'
                        )
                      }
                    >
                      Console
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`btn btn-outline btn-sm ${
                        isRunning
                          ? 'loading'
                          : ''
                      }`}
                      onClick={
                        handleRun
                      }
                      disabled={isBusy}
                    >
                      {isRunning
                        ? 'Running'
                        : 'Run'}
                    </button>

                    <button
                      type="button"
                      className={`btn btn-primary btn-sm ${
                        isSubmitting
                          ? 'loading'
                          : ''
                      }`}
                      onClick={
                        handleSubmitCode
                      }
                      disabled={isBusy}
                    >
                      {isSubmitting
                        ? 'Submitting'
                        : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TESTCASE */}
            {activeRightTab ===
              'testcase' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">
                  Test Results
                </h3>

                {runResult ? (
                  <div
                    className={`alert ${
                      runResult.success
                        ? 'alert-success'
                        : 'alert-error'
                    } mb-4`}
                  >
                    <div className="w-full">
                      {runResult.success ? (
                        <div>
                          <h4 className="font-bold">
                            ✅ All test cases
                            passed!
                          </h4>

                          <p className="text-sm mt-2">
                            Runtime:{' '}
                            {
                              runResult.runtime
                            }{' '}
                            sec
                          </p>

                          <p className="text-sm">
                            Memory:{' '}
                            {
                              runResult.memory
                            }{' '}
                            KB
                          </p>

                          <div className="mt-4 space-y-2">
                            {Array.isArray(
                              runResult.testCases
                            ) &&
                              runResult.testCases.map(
                                (
                                  testCase,
                                  index
                                ) => (
                                  <div
                                    key={
                                      index
                                    }
                                    className="bg-base-100 p-3 rounded text-xs"
                                  >
                                    <div className="font-mono space-y-1">
                                      <div>
                                        <strong>
                                          Input:
                                        </strong>{' '}
                                        <span className="whitespace-pre-wrap">
                                          {
                                            testCase.stdin
                                          }
                                        </span>
                                      </div>

                                      <div>
                                        <strong>
                                          Expected:
                                        </strong>{' '}
                                        <span className="whitespace-pre-wrap">
                                          {
                                            testCase.expected_output
                                          }
                                        </span>
                                      </div>

                                      <div>
                                        <strong>
                                          Output:
                                        </strong>{' '}
                                        <span className="whitespace-pre-wrap">
                                          {
                                            testCase.stdout
                                          }
                                        </span>
                                      </div>

                                      <div className="text-success flex items-center gap-1">
                                        <CheckCircle2 size={14} />
                                        Passed
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold">
                            ❌ Error
                          </h4>

                          <p className="mt-2">
                            {runResult.error ||
                              'One or more test cases failed.'}
                          </p>

                          {Array.isArray(
                            runResult.testCases
                          ) &&
                            runResult.testCases
                              .length >
                              0 && (
                              <div className="mt-4 space-y-2">
                                {runResult.testCases.map(
                                  (
                                    testCase,
                                    index
                                  ) => (
                                    <div
                                      key={
                                        index
                                      }
                                      className="bg-base-100 p-3 rounded text-xs"
                                    >
                                      <div className="font-mono space-y-1">
                                        <div>
                                          <strong>
                                            Input:
                                          </strong>{' '}
                                          <span className="whitespace-pre-wrap">
                                            {
                                              testCase.stdin
                                            }
                                          </span>
                                        </div>

                                        <div>
                                          <strong>
                                            Expected:
                                          </strong>{' '}
                                          <span className="whitespace-pre-wrap">
                                            {
                                              testCase.expected_output
                                            }
                                          </span>
                                        </div>

                                        <div>
                                          <strong>
                                            Output:
                                          </strong>{' '}
                                          <span className="whitespace-pre-wrap">
                                            {
                                              testCase.stdout
                                            }
                                          </span>
                                        </div>

                                        <div
                                          className={
                                            testCase.status_id ===
                                            3
                                              ? 'text-success'
                                              : 'text-error'
                                          }
                                        >
                                          {testCase.status_id ===
                                          3
                                            ? '✓ Passed'
                                            : '✗ Failed'}
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
                  </div>
                ) : (
                  <div className="text-base-content/60">
                    Click "Run" to test your
                    code with the example test
                    cases.
                  </div>
                )}
              </div>
            )}

            {/* SUBMISSION RESULT */}
            {activeRightTab ===
              'result' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">
                  Submission Result
                </h3>

                {submitResult ? (
                  <div
                    className={`alert ${
                      submitResult.accepted
                        ? 'alert-success'
                        : 'alert-error'
                    }`}
                  >
                    <div className="w-full">
                      {submitResult.accepted ? (
                        <div>
                          <h4 className="font-bold text-lg">
                            🎉 Accepted
                          </h4>

                          <div className="mt-4 space-y-2">
                            <p>
                              Test Cases
                              Passed:{' '}
                              {
                                submitResult.passedTestCases
                              }
                              /
                              {
                                submitResult.totalTestCases
                              }
                            </p>

                            <p>
                              Runtime:{' '}
                              {
                                submitResult.runtime
                              }{' '}
                              sec
                            </p>

                            <p>
                              Memory:{' '}
                              {
                                submitResult.memory
                              }{' '}
                              KB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold text-lg">
                            ❌{' '}
                            {submitResult.error ||
                              'Submission failed.'}
                          </h4>

                          <div className="mt-4 space-y-2">
                            <p>
                              Test Cases
                              Passed:{' '}
                              {
                                submitResult.passedTestCases
                              }
                              /
                              {
                                submitResult.totalTestCases
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-base-content/60">
                    Click "Submit" to submit your
                    solution for evaluation.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;