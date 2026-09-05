import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Search,
  FileEdit,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Code2,
  FlaskConical,
  Tag,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';

const SECTIONS = [
  {
    id: 'details',
    number: '01',
    label: 'Details',
    icon: FileEdit,
  },
  {
    id: 'tests',
    number: '02',
    label: 'Test Cases',
    icon: FlaskConical,
  },
  {
    id: 'languages',
    number: '03',
    label: 'Languages',
    icon: Code2,
  },
];

const LANGUAGES = ['C++', 'Java', 'JavaScript'];

const normalizeLanguage = (language) => {
  if (!language) return '';

  const normalized = String(language)
    .trim()
    .toLowerCase();

  if (normalized === 'cpp' || normalized === 'c++') {
    return 'C++';
  }

  if (normalized === 'java') {
    return 'Java';
  }

  if (
    normalized === 'javascript' ||
    normalized === 'js'
  ) {
    return 'JavaScript';
  }

  return language;
};

const getDifficultyBadge = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
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

const getLanguageExtension = (language) => {
  switch (language) {
    case 'C++':
      return 'cpp';

    case 'Java':
      return 'java';

    case 'JavaScript':
      return 'js';

    default:
      return 'txt';
  }
};

const createLanguageArray = (items, valueField) => {
  return LANGUAGES.map((language) => {
    const existing = items?.find(
      (item) =>
        normalizeLanguage(item.language) === language
    );

    return {
      language,
      [valueField]: existing?.[valueField] || '',
    };
  });
};

function UpdateProblem() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] =
    useState('');

  const [problem, setProblem] = useState(null);

  const [search, setSearch] = useState('');

  const [activeSection, setActiveSection] =
    useState('details');

  const [activeLanguage, setActiveLanguage] =
    useState('C++');

  const [loadingProblems, setLoadingProblems] =
    useState(true);

  const [loadingProblem, setLoadingProblem] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(false);

  // ============================================================
  // TOAST / POPUP NOTIFICATION (new)
  // ============================================================
  // A small floating popup shown at the top-right of the screen.
  // It does NOT touch the existing layout/UI — it's an overlay,
  // so nothing else on the page shifts or changes.

  const [toast, setToast] = useState({
    show: false,
    type: 'success', // 'success' | 'error'
    message: '',
  });

  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    // clear any pending auto-hide so rapid calls don't fight each other
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ show: true, type, message });

    toastTimerRef.current = setTimeout(() => {
      setToast((previous) => ({
        ...previous,
        show: false,
      }));
    }, 3500);
  };

  const closeToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast((previous) => ({
      ...previous,
      show: false,
    }));
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    tags: [],
    visibleTestCases: [],
    hiddenTestCases: [],
    startCode: [],
    referenceSolution: [],
  });

  // ============================================================
  // FETCH PROBLEM LIST
  // ============================================================

  const fetchProblems = async () => {
    try {
      setLoadingProblems(true);
      setError(null);

      const response = await axiosClient.get(
        '/problem/getAllProblem'
      );

      setProblems(response.data);
    } catch (err) {
      console.error(
        'Failed to fetch problems:',
        err
      );

      if (err.response?.status === 401) {
        setError(
          'Your admin session has expired. Please log in again.'
        );
      } else if (err.response?.status === 403) {
        setError(
          'Administrator access is required.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Unable to load problems.'
        );
      }
    } finally {
      setLoadingProblems(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredProblems = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return problems;
    }

    return problems.filter((item) =>
      item.title
        .toLowerCase()
        .includes(query)
    );
  }, [problems, search]);

  // ============================================================
  // LOAD COMPLETE ADMIN PROBLEM
  // ============================================================

  const handleSelectProblem = async (problemId) => {
    setSelectedProblemId(problemId);
    setProblem(null);
    setSuccess(false);
    setError(null);
    setActiveSection('details');
    setActiveLanguage('C++');

    if (!problemId) {
      return;
    }

    try {
      setLoadingProblem(true);

      const response = await axiosClient.get(
        `/problem/admin/${problemId}`
      );

      const data = response.data;

      setProblem(data);

      setFormData({
        title: data.title || '',

        description:
          data.description || '',

        difficulty:
          data.difficulty || 'easy',

        tags: Array.isArray(data.tags)
          ? [...data.tags]
          : [],

        visibleTestCases:
          Array.isArray(
            data.visibleTestCases
          )
            ? data.visibleTestCases.map(
                (testCase) => ({
                  input:
                    testCase.input || '',
                  output:
                    testCase.output || '',
                  explanation:
                    testCase.explanation ||
                    '',
                })
              )
            : [],

        hiddenTestCases:
          Array.isArray(
            data.hiddenTestCases
          )
            ? data.hiddenTestCases.map(
                (testCase) => ({
                  input:
                    testCase.input || '',
                  output:
                    testCase.output || '',
                  explanation:
                    testCase.explanation ||
                    '',
                })
              )
            : [],

        startCode: createLanguageArray(
          data.startCode,
          'initialCode'
        ),

        referenceSolution:
          createLanguageArray(
            data.referenceSolution,
            'completeCode'
          ),
      });
    } catch (err) {
      console.error(
        'Failed to load problem:',
        err
      );

      if (err.response?.status === 401) {
        setError(
          'Your admin session has expired. Please log in again.'
        );
      } else if (err.response?.status === 403) {
        setError(
          'Administrator access is required.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Unable to load the selected problem.'
        );
      }

      setProblem(null);
    } finally {
      setLoadingProblem(false);
    }
  };

  // ============================================================
  // GENERAL HELPERS
  // ============================================================

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ============================================================
  // TAGS
  // ============================================================

  const addTag = () => {
    setFormData((previous) => ({
      ...previous,
      tags: [...previous.tags, ''],
    }));
  };

  const updateTag = (index, value) => {
    setFormData((previous) => {
      const tags = [...previous.tags];

      tags[index] = value;

      return {
        ...previous,
        tags,
      };
    });
  };

  const removeTag = (index) => {
    setFormData((previous) => ({
      ...previous,
      tags: previous.tags.filter(
        (_, tagIndex) =>
          tagIndex !== index
      ),
    }));
  };

  // ============================================================
  // VISIBLE TEST CASES
  // ============================================================

  const addVisibleTestCase = () => {
    setFormData((previous) => ({
      ...previous,
      visibleTestCases: [
        ...previous.visibleTestCases,
        {
          input: '',
          output: '',
          explanation: '',
        },
      ],
    }));
  };

  const updateVisibleTestCase = (
    index,
    field,
    value
  ) => {
    setFormData((previous) => {
      const testCases = [
        ...previous.visibleTestCases,
      ];

      testCases[index] = {
        ...testCases[index],
        [field]: value,
      };

      return {
        ...previous,
        visibleTestCases: testCases,
      };
    });
  };

  const removeVisibleTestCase = (index) => {
    setFormData((previous) => ({
      ...previous,
      visibleTestCases:
        previous.visibleTestCases.filter(
          (_, testIndex) =>
            testIndex !== index
        ),
    }));
  };

  // ============================================================
  // HIDDEN TEST CASES
  // ============================================================

  const addHiddenTestCase = () => {
    setFormData((previous) => ({
      ...previous,
      hiddenTestCases: [
        ...previous.hiddenTestCases,
        {
          input: '',
          output: '',
          explanation: '',
        },
      ],
    }));
  };

  const updateHiddenTestCase = (
    index,
    field,
    value
  ) => {
    setFormData((previous) => {
      const testCases = [
        ...previous.hiddenTestCases,
      ];

      testCases[index] = {
        ...testCases[index],
        [field]: value,
      };

      return {
        ...previous,
        hiddenTestCases: testCases,
      };
    });
  };

  const removeHiddenTestCase = (index) => {
    setFormData((previous) => ({
      ...previous,
      hiddenTestCases:
        previous.hiddenTestCases.filter(
          (_, testIndex) =>
            testIndex !== index
        ),
    }));
  };

  // ============================================================
  // STARTER CODE
  // ============================================================

  const updateStarterCode = (
    language,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,

      startCode:
        previous.startCode.map(
          (item) =>
            item.language === language
              ? {
                  ...item,
                  initialCode: value,
                }
              : item
        ),
    }));
  };

  // ============================================================
  // REFERENCE SOLUTION
  // ============================================================

  const updateReferenceSolution = (
    language,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,

      referenceSolution:
        previous.referenceSolution.map(
          (item) =>
            item.language === language
              ? {
                  ...item,
                  completeCode: value,
                }
              : item
        ),
    }));
  };

  // ============================================================
  // LANGUAGE DATA
  // ============================================================

  const activeStarterCode =
    formData.startCode.find(
      (item) =>
        item.language === activeLanguage
    );

  const activeReferenceSolution =
    formData.referenceSolution.find(
      (item) =>
        item.language === activeLanguage
    );

  // ============================================================
  // SECTION NAVIGATION
  // ============================================================

  const currentSectionIndex =
    SECTIONS.findIndex(
      (section) =>
        section.id === activeSection
    );

  const goToSection = (sectionId) => {
    setActiveSection(sectionId);
    setError(null);
  };

  const goNext = () => {
    if (
      currentSectionIndex <
      SECTIONS.length - 1
    ) {
      goToSection(
        SECTIONS[
          currentSectionIndex + 1
        ].id
      );
    }
  };

  const goPrevious = () => {
    if (currentSectionIndex > 0) {
      goToSection(
        SECTIONS[
          currentSectionIndex - 1
        ].id
      );
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!formData.title.trim()) {
      return {
        section: 'details',
        message:
          'Problem title is required.',
      };
    }

    if (!formData.description.trim()) {
      return {
        section: 'details',
        message:
          'Problem description is required.',
      };
    }

    const cleanedTags = [
      ...new Set(
        formData.tags
          .map((tag) =>
            tag.trim().toLowerCase()
          )
          .filter(Boolean)
      ),
    ];

    if (cleanedTags.length === 0) {
      return {
        section: 'details',
        message:
          'At least one tag is required.',
      };
    }

    if (
      formData.visibleTestCases
        .length === 0
    ) {
      return {
        section: 'tests',
        message:
          'At least one visible test case is required.',
      };
    }

    const invalidVisibleTest =
      formData.visibleTestCases.some(
        (testCase) =>
          !testCase.input.trim() ||
          !testCase.output.trim() ||
          !testCase.explanation.trim()
      );

    if (invalidVisibleTest) {
      return {
        section: 'tests',
        message:
          'Every visible test case must have input, output, and explanation.',
      };
    }

    if (
      formData.hiddenTestCases
        .length === 0
    ) {
      return {
        section: 'tests',
        message:
          'At least one hidden test case is required.',
      };
    }

    const invalidHiddenTest =
      formData.hiddenTestCases.some(
        (testCase) =>
          !testCase.input.trim() ||
          !testCase.output.trim()
      );

    if (invalidHiddenTest) {
      return {
        section: 'tests',
        message:
          'Every hidden test case must have input and output.',
      };
    }

   for (const language of LANGUAGES) {
    const starter = formData.startCode.find(
        (item) =>
            normalizeLanguage(item.language) ===
            normalizeLanguage(language)
    );

    if (!starter?.initialCode?.trim()) {
        return {
        section: 'languages',
        language,
        message: `Starter code is required for ${language}.`,
    };
  }
}

    for (const language of LANGUAGES) {
        const solution = formData.referenceSolution.find(
            (item) =>
                normalizeLanguage(item.language) ===
                normalizeLanguage(language)
        );

         if (!solution?.completeCode?.trim()) {
            return {
                section: 'languages',
                language,
                message: `Reference solution is required for ${language}.`,
            };
        }
    }
    return null;
};

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async () => {
    if (!selectedProblemId || !problem) {
      setError(
        'Please select a problem first.'
      );

      showToast(
        'Please select a problem first.',
        'error'
      );

      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError.message
      );

      // NEW: popup for the missing/invalid field
      showToast(
        validationError.message,
        'error'
      );

      goToSection(
        validationError.section
      );

      if (validationError.language) {
        setActiveLanguage(
          validationError.language
        );
      }

      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const cleanedTags = [
        ...new Set(
          formData.tags
            .map((tag) =>
              tag.trim().toLowerCase()
            )
            .filter(Boolean)
        ),
      ];

      const payload = {
        title:
          formData.title.trim(),

        description:
          formData.description.trim(),

        difficulty:
          formData.difficulty,

        tags: cleanedTags,

        visibleTestCases:
          formData.visibleTestCases,

        hiddenTestCases:
          formData.hiddenTestCases,

        startCode:
          formData.startCode,

        referenceSolution:
          formData.referenceSolution,
      };

      await axiosClient.put(
        `/problem/update/${selectedProblemId}`,
        payload
      );

      setSuccess(true);

      // NEW: popup confirming the update
      showToast(
        'Problem updated successfully.',
        'success'
      );

      // NEW: instantly sync the problems list (dropdown +
      // Quick Select cards) with the values we just saved,
      // so things like the difficulty badge (Easy -> Medium)
      // update right away without a page reload.
      setProblems((previous) =>
        previous.map((item) =>
          item._id === selectedProblemId
            ? {
                ...item,
                title: payload.title,
                difficulty: payload.difficulty,
                tags: payload.tags,
              }
            : item
        )
      );

      // Reload the saved problem so the editor
      // reflects the actual backend state.
      await handleSelectProblem(
        selectedProblemId
      );
    } catch (err) {
      console.error(
        'Failed to update problem:',
        err
      );

      let message;

      if (err.response?.status === 401) {
        message =
          'Your admin session has expired. Please log in again.';
      } else if (err.response?.status === 403) {
        message =
          'Administrator access is required.';
      } else {
        message =
          err.response?.data?.message ||
          'Unable to update problem.';
      }

      setError(message);

      // NEW: popup for save failure
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-base-200">

      {/* ======================================================
          TOAST / POPUP (new — floating, doesn't affect layout)
      ====================================================== */}

      {toast.show && (
        <div className="toast toast-top toast-end z-[100]">
          <div
            className={`alert shadow-lg ${
              toast.type === 'success'
                ? 'alert-success'
                : 'alert-error'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}

            <span>{toast.message}</span>

            <button
              type="button"
              onClick={closeToast}
              className="btn btn-ghost btn-xs btn-square"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="bg-base-100 border-b border-base-300">
        <div className="container mx-auto max-w-7xl px-6 py-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <FileEdit className="w-6 h-6 text-warning" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">
                    Update Problem
                  </h1>

                  <span className="badge badge-warning">
                    Admin
                  </span>
                </div>

                <p className="text-base-content/60 mt-1">
                  Select a problem, edit its content,
                  and save your changes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/admin')
              }
              className="btn btn-ghost"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-8 pb-28">

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <AlertCircle className="w-5 h-5" />

            <div className="flex-1">
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="btn btn-sm btn-ghost"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div className="alert alert-success mb-6">
            <CheckCircle2 className="w-5 h-5" />

            <div>
              <div className="font-semibold">
                Problem updated successfully.
              </div>

              <div className="text-sm">
                Your changes were saved.
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            PROBLEM SELECTOR
        ==================================================== */}

        <section className="card bg-base-100 border border-base-300 shadow-sm mb-8">
          <div className="card-body">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
              <div>
                <h2 className="text-xl font-bold">
                  Select Problem
                </h2>

                <p className="text-sm text-base-content/50 mt-1">
                  Choose an existing problem to edit.
                </p>
              </div>

              <div className="badge badge-primary badge-lg">
                {loadingProblems
                  ? 'Loading...'
                  : `${problems.length} problems`}
              </div>
            </div>

            <div className="divider" />

            <div className="grid lg:grid-cols-[320px_1fr] gap-5">

              {/* SEARCH */}

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Search
                  </span>
                </label>

                <label className="input input-bordered flex items-center gap-2">
                  <Search className="w-4 h-4 opacity-50" />

                  <input
                    type="text"
                    placeholder="Search problem..."
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    className="grow"
                  />
                </label>
              </div>

              {/* SELECT */}

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Problem
                  </span>
                </label>

                <select
                  value={selectedProblemId}
                  onChange={(event) =>
                    handleSelectProblem(
                      event.target.value
                    )
                  }
                  disabled={
                    loadingProblems
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">
                    {loadingProblems
                      ? 'Loading problems...'
                      : 'Choose a problem'}
                  </option>

                  {filteredProblems.map(
                    (item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.title}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* QUICK SELECT */}

            {!loadingProblems &&
              filteredProblems.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-semibold mb-3">
                    Quick Select
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredProblems
                      .slice(0, 6)
                      .map((item) => {
                        const selected =
                          selectedProblemId ===
                          item._id;

                        return (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() =>
                              handleSelectProblem(
                                item._id
                              )
                            }
                            className={`text-left border rounded-xl p-4 transition ${
                              selected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-base-300 hover:border-primary/50 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold truncate">
                                  {item.title}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  <span
                                    className={`badge ${getDifficultyBadge(
                                      item.difficulty
                                    )}`}
                                  >
                                    {item.difficulty}
                                  </span>

                                  {Array.isArray(
                                    item.tags
                                  ) &&
                                    item.tags
                                      .slice(0, 3)
                                      .map(
                                        (
                                          tag
                                        ) => (
                                          <span
                                            key={
                                              tag
                                            }
                                            className="badge badge-outline"
                                          >
                                            {tag}
                                          </span>
                                        )
                                      )}
                                </div>
                              </div>

                              {selected && (
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loadingProblem && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />

              <p className="text-base-content/60">
                Loading complete problem...
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            EDIT WORKSPACE
        ==================================================== */}

        {problem &&
          !loadingProblem && (
            <div className="grid xl:grid-cols-[1fr_240px] gap-6">

              {/* ==================================================
                  MAIN EDITOR
              ================================================== */}

              <div>
                {/* SECTION TABS */}

                <div className="card bg-base-100 border border-base-300 shadow-sm mb-6">
                  <div className="card-body p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {SECTIONS.map(
                        (section) => {
                          const Icon =
                            section.icon;

                          return (
                            <button
                              key={
                                section.id
                              }
                              type="button"
                              onClick={() =>
                                goToSection(
                                  section.id
                                )
                              }
                              className={`btn ${
                                activeSection ===
                                section.id
                                  ? 'btn-primary'
                                  : 'btn-ghost'
                              }`}
                            >
                              <span className="font-bold">
                                {section.number}
                              </span>

                              <Icon className="w-4 h-4" />

                              {section.label}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    DETAILS
                ================================================= */}

                {activeSection ===
                  'details' && (
                  <section className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          01
                        </div>

                        <div>
                          <h2 className="text-xl font-bold">
                            Problem Details
                          </h2>

                          <p className="text-sm text-base-content/50 mt-1">
                            Update the information users see.
                          </p>
                        </div>
                      </div>

                      <div className="divider" />

                      <div className="space-y-6">

                        {/* TITLE */}

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Problem Title
                            </span>
                          </label>

                          <input
                            value={
                              formData.title
                            }
                            onChange={(event) =>
                              updateField(
                                'title',
                                event
                                  .target
                                  .value
                              )
                            }
                            className="input input-bordered input-lg w-full"
                          />
                        </div>

                        {/* DIFFICULTY */}

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Difficulty
                            </span>
                          </label>

                          <select
                            value={
                              formData.difficulty
                            }
                            onChange={(
                              event
                            ) =>
                              updateField(
                                'difficulty',
                                event
                                  .target
                                  .value
                              )
                            }
                            className="select select-bordered w-full max-w-sm"
                          >
                            <option value="easy">
                              Easy
                            </option>

                            <option value="medium">
                              Medium
                            </option>

                            <option value="hard">
                              Hard
                            </option>
                          </select>
                        </div>

                        {/* TAGS */}

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Tags
                              </h3>

                              <p className="text-sm text-base-content/50">
                                Topics associated with this problem.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={
                                addTag
                              }
                              className="btn btn-sm btn-outline btn-primary"
                            >
                              <Plus className="w-4 h-4" />
                              Add Tag
                            </button>
                          </div>

                          <div className="space-y-3">
                            {formData.tags.map(
                              (
                                tag,
                                index
                              ) => (
                                <div
                                  key={`${index}-${tag}`}
                                  className="flex gap-3"
                                >
                                  <input
                                    value={
                                      tag
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateTag(
                                        index,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    className="input input-bordered flex-1"
                                    placeholder="e.g. array"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeTag(
                                        index
                                      )
                                    }
                                    className="btn btn-square btn-outline btn-error"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">
                              Description
                            </span>
                          </label>

                          <textarea
                            value={
                              formData.description
                            }
                            onChange={(
                              event
                            ) =>
                              updateField(
                                'description',
                                event
                                  .target
                                  .value
                              )
                            }
                            rows={14}
                            className="textarea textarea-bordered w-full leading-7"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* =================================================
                    TEST CASES
                ================================================= */}

                {activeSection ===
                  'tests' && (
                  <section className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          02
                        </div>

                        <div>
                          <h2 className="text-xl font-bold">
                            Test Cases
                          </h2>

                          <p className="text-sm text-base-content/50 mt-1">
                            Manage public examples and private Judge0 cases.
                          </p>
                        </div>
                      </div>

                      <div className="divider" />

                      {/* VISIBLE */}

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Eye className="w-5 h-5 text-success" />
                              Visible Test Cases
                            </h3>

                            <p className="text-sm text-base-content/50 mt-1">
                              Users can see these examples.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={
                              addVisibleTestCase
                            }
                            className="btn btn-sm btn-outline btn-primary"
                          >
                            <Plus className="w-4 h-4" />
                            Add Visible
                          </button>
                        </div>

                        <div className="space-y-5">
                          {formData.visibleTestCases.map(
                            (
                              testCase,
                              index
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className="border border-base-300 rounded-xl overflow-hidden"
                              >
                                <div className="bg-base-200 px-5 py-3 flex justify-between items-center">
                                  <span className="font-semibold">
                                    Example #
                                    {index +
                                      1}
                                  </span>

                                  {formData
                                    .visibleTestCases
                                    .length >
                                    1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeVisibleTestCase(
                                          index
                                        )
                                      }
                                      className="btn btn-xs btn-ghost text-error"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Remove
                                    </button>
                                  )}
                                </div>

                                <div className="p-5 grid md:grid-cols-2 gap-5">
                                  <div>
                                    <label className="label">
                                      <span className="label-text font-medium">
                                        Input
                                      </span>
                                    </label>

                                    <textarea
                                      value={
                                        testCase.input
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateVisibleTestCase(
                                          index,
                                          'input',
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      rows={
                                        6
                                      }
                                      className="textarea textarea-bordered w-full font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="label">
                                      <span className="label-text font-medium">
                                        Expected Output
                                      </span>
                                    </label>

                                    <textarea
                                      value={
                                        testCase.output
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateVisibleTestCase(
                                          index,
                                          'output',
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      rows={
                                        6
                                      }
                                      className="textarea textarea-bordered w-full font-mono"
                                    />
                                  </div>

                                  <div className="md:col-span-2">
                                    <label className="label">
                                      <span className="label-text font-medium">
                                        Explanation
                                      </span>
                                    </label>

                                    <textarea
                                      value={
                                        testCase.explanation
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateVisibleTestCase(
                                          index,
                                          'explanation',
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      rows={
                                        4
                                      }
                                      className="textarea textarea-bordered w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="divider my-8" />

                      {/* HIDDEN */}

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <EyeOff className="w-5 h-5 text-warning" />
                              Hidden Test Cases
                            </h3>

                            <p className="text-sm text-base-content/50 mt-1">
                              Private cases used by Judge0.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={
                              addHiddenTestCase
                            }
                            className="btn btn-sm btn-outline btn-primary"
                          >
                            <Plus className="w-4 h-4" />
                            Add Hidden
                          </button>
                        </div>

                        <div className="alert alert-warning mb-5">
                          <EyeOff className="w-5 h-5" />

                          <div>
                            <div className="font-semibold">
                              Admin-only test data
                            </div>

                            <div className="text-sm">
                              These cases are never exposed to normal users.
                            </div>
                          </div>
                        </div>

                        <div className="space-y-5">
                          {formData.hiddenTestCases.map(
                            (
                              testCase,
                              index
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className="border border-base-300 rounded-xl overflow-hidden"
                              >
                                <div className="bg-base-200 px-5 py-3 flex justify-between items-center">
                                  <span className="font-semibold">
                                    Hidden Case #
                                    {index +
                                      1}
                                  </span>

                                  {formData
                                    .hiddenTestCases
                                    .length >
                                    1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeHiddenTestCase(
                                          index
                                        )
                                      }
                                      className="btn btn-xs btn-ghost text-error"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Remove
                                    </button>
                                  )}
                                </div>

                                <div className="p-5 grid md:grid-cols-2 gap-5">
                                  <div>
                                    <label className="label">
                                      <span className="label-text font-medium">
                                        Input
                                      </span>
                                    </label>

                                    <textarea
                                      value={
                                        testCase.input
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateHiddenTestCase(
                                          index,
                                          'input',
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      rows={
                                        6
                                      }
                                      className="textarea textarea-bordered w-full font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="label">
                                      <span className="label-text font-medium">
                                        Expected Output
                                      </span>
                                    </label>

                                    <textarea
                                      value={
                                        testCase.output
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateHiddenTestCase(
                                          index,
                                          'output',
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      rows={
                                        6
                                      }
                                      className="textarea textarea-bordered w-full font-mono"
                                    />
                                  </div>

                                  <div className="md:col-span-2">
                                    <label className="label">
                                      <span className="label-text font-medium">
                                        Internal Explanation
                                      </span>
                                    </label>

                                    <textarea
                                      value={
                                        testCase.explanation ||
                                        ''
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateHiddenTestCase(
                                          index,
                                          'explanation',
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      rows={
                                        4
                                      }
                                      className="textarea textarea-bordered w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* =================================================
                    LANGUAGES
                ================================================= */}

                {activeSection ===
                  'languages' && (
                  <section className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          03
                        </div>

                        <div>
                          <h2 className="text-xl font-bold">
                            Language Templates
                          </h2>

                          <p className="text-sm text-base-content/50 mt-1">
                            Select a language and edit only that language's code.
                          </p>
                        </div>
                      </div>

                      <div className="divider" />

                      {/* LANGUAGE TABS */}

                      <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
                        {LANGUAGES.map(
                          (language) => {
                            const starter =
                              formData.startCode.find(
                                (item) =>
                                  item.language ===
                                  language
                              );

                            const solution =
                              formData.referenceSolution.find(
                                (item) =>
                                  item.language ===
                                  language
                              );

                            const hasStarter =
                              Boolean(
                                starter?.initialCode?.trim()
                              );

                            const hasSolution =
                              Boolean(
                                solution?.completeCode?.trim()
                              );

                            return (
                              <button
                                key={
                                  language
                                }
                                type="button"
                                onClick={() =>
                                  setActiveLanguage(
                                    language
                                  )
                                }
                                className={`tab gap-2 ${
                                  activeLanguage ===
                                  language
                                    ? 'tab-active'
                                    : ''
                                }`}
                              >
                                {language}

                                {hasStarter &&
                                  hasSolution && (
                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                  )}

                                {(!hasStarter ||
                                  !hasSolution) && (
                                  <AlertCircle className="w-4 h-4 text-warning" />
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {/* ACTIVE LANGUAGE */}

                      <div className="border border-base-300 rounded-xl overflow-hidden">

                        <div className="bg-base-200 px-5 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Code2 className="w-5 h-5 text-primary" />
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg">
                                {activeLanguage}
                              </h3>

                              <p className="text-xs text-base-content/50">
                                {getLanguageExtension(
                                  activeLanguage
                                )}{' '}
                                source
                              </p>
                            </div>
                          </div>

                          <span className="badge badge-outline">
                            {activeLanguage}
                          </span>
                        </div>

                        <div className="p-5 space-y-7">

                          {/* STARTER CODE */}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <label className="label p-0">
                                  <span className="label-text font-semibold">
                                    Initial / Starter Code
                                  </span>
                                </label>

                                <p className="text-sm text-base-content/50">
                                  Code provided to the user when the problem opens.
                                </p>
                              </div>

                              <span className="badge badge-success badge-outline">
                                User-facing
                              </span>
                            </div>

                            <div className="border border-base-300 rounded-xl overflow-hidden">
                              <div className="bg-neutral text-neutral-content px-4 py-2 flex justify-between">
                                <span className="font-mono text-xs">
                                  starter.
                                  {getLanguageExtension(
                                    activeLanguage
                                  )}
                                </span>

                                <span className="text-xs opacity-60">
                                  Editable
                                </span>
                              </div>

                              <textarea
                                value={
                                  activeStarterCode?.initialCode ||
                                  ''
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateStarterCode(
                                    activeLanguage,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                spellCheck="false"
                                rows={18}
                                className="textarea textarea-ghost rounded-none w-full bg-base-300 font-mono text-sm leading-6 resize-y"
                              />
                            </div>
                          </div>

                          {/* REFERENCE SOLUTION */}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <label className="label p-0">
                                  <span className="label-text font-semibold">
                                    Reference Solution
                                  </span>
                                </label>

                                <p className="text-sm text-base-content/50">
                                  Verified solution used by the platform.
                                </p>
                              </div>

                              <span className="badge badge-warning badge-outline">
                                Internal
                              </span>
                            </div>

                            <div className="border border-base-300 rounded-xl overflow-hidden">
                              <div className="bg-neutral text-neutral-content px-4 py-2 flex justify-between">
                                <span className="font-mono text-xs">
                                  solution.
                                  {getLanguageExtension(
                                    activeLanguage
                                  )}
                                </span>

                                <span className="text-xs opacity-60">
                                  Editable
                                </span>
                              </div>

                              <textarea
                                value={
                                  activeReferenceSolution?.completeCode ||
                                  ''
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateReferenceSolution(
                                    activeLanguage,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                spellCheck="false"
                                rows={22}
                                className="textarea textarea-ghost rounded-none w-full bg-base-300 font-mono text-sm leading-6 resize-y"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LANGUAGE STATUS */}

                      <div className="mt-5 grid md:grid-cols-3 gap-3">
                        {LANGUAGES.map(
                          (language) => {
                            const starter =
                              formData.startCode.find(
                                (item) =>
                                  item.language ===
                                  language
                              );

                            const solution =
                              formData.referenceSolution.find(
                                (item) =>
                                  item.language ===
                                  language
                              );

                            const complete =
                              Boolean(
                                starter?.initialCode?.trim()
                              ) &&
                              Boolean(
                                solution?.completeCode?.trim()
                              );

                            return (
                              <button
                                key={
                                  language
                                }
                                type="button"
                                onClick={() =>
                                  setActiveLanguage(
                                    language
                                  )
                                }
                                className={`border rounded-xl p-4 text-left transition ${
                                  activeLanguage ===
                                  language
                                    ? 'border-primary bg-primary/5'
                                    : 'border-base-300 hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">
                                    {language}
                                  </span>

                                  {complete ? (
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-warning" />
                                  )}
                                </div>

                                <p className="text-xs text-base-content/50 mt-2">
                                  {complete
                                    ? 'Starter + solution ready'
                                    : 'Missing code'}
                                </p>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* =================================================
                    WORKFLOW BUTTONS
                ================================================= */}

                <div className="card bg-base-100 border border-base-300 shadow-sm mt-6">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          Step{' '}
                          {currentSectionIndex +
                            1}{' '}
                          of{' '}
                          {SECTIONS.length}
                        </p>

                        <p className="text-sm text-base-content/50">
                          {
                            SECTIONS[
                              currentSectionIndex
                            ].label
                          }
                        </p>
                      </div>

                      <div className="flex gap-3">
                        {currentSectionIndex >
                          0 && (
                          <button
                            type="button"
                            onClick={
                              goPrevious
                            }
                            className="btn btn-ghost"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </button>
                        )}

                        {currentSectionIndex <
                        SECTIONS.length -
                          1 ? (
                          <button
                            type="button"
                            onClick={
                              goNext
                            }
                            className="btn btn-primary"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={
                              handleSubmit
                            }
                            disabled={
                              saving
                            }
                            className="btn btn-primary"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                Save Changes
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  RIGHT SIDEBAR
              ================================================== */}

              <aside className="hidden xl:block">
                <div className="sticky top-6 space-y-4">

                  {/* SAVE */}

                  <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body">
                      <h3 className="font-bold">
                        Save Changes
                      </h3>

                      <p className="text-sm text-base-content/50">
                        Changes are only sent to the backend when you save.
                      </p>

                      <button
                        type="button"
                        onClick={
                          handleSubmit
                        }
                        disabled={
                          saving
                        }
                        className="btn btn-primary w-full mt-3"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate('/admin')
                        }
                        disabled={
                          saving
                        }
                        className="btn btn-ghost w-full"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* SECTION NAV */}

                  <div className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body">
                      <h3 className="font-bold mb-2">
                        Sections
                      </h3>

                      <div className="space-y-2">
                        {SECTIONS.map(
                          (
                            section
                          ) => {
                            const Icon =
                              section.icon;

                            return (
                              <button
                                key={
                                  section.id
                                }
                                type="button"
                                onClick={() =>
                                  goToSection(
                                    section.id
                                  )
                                }
                                className={`btn btn-sm justify-start w-full ${
                                  activeSection ===
                                  section.id
                                    ? 'btn-primary'
                                    : 'btn-ghost'
                                }`}
                              >
                                <span>
                                  {
                                    section.number
                                  }
                                </span>

                                <Icon className="w-4 h-4" />

                                {
                                  section.label
                                }
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  {/* LANGUAGE QUICK NAV */}

                  {activeSection ===
                    'languages' && (
                    <div className="card bg-base-100 border border-base-300 shadow-sm">
                      <div className="card-body">
                        <h3 className="font-bold mb-2">
                          Languages
                        </h3>

                        <div className="space-y-2">
                          {LANGUAGES.map(
                            (
                              language
                            ) => (
                              <button
                                key={
                                  language
                                }
                                type="button"
                                onClick={() =>
                                  setActiveLanguage(
                                    language
                                  )
                                }
                                className={`btn btn-sm justify-between w-full ${
                                  activeLanguage ===
                                  language
                                    ? 'btn-primary'
                                    : 'btn-ghost'
                                }`}
                              >
                                <span>
                                  {
                                    language
                                  }
                                </span>

                                {activeLanguage ===
                                  language && (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
      </main>
    </div>
  );
}

export default UpdateProblem;