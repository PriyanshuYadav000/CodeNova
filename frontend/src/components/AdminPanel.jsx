import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Code2,
  FileText,
  FlaskConical,
  Tag,
  AlertCircle,
} from 'lucide-react';

// ============================================================
// VALIDATION
// ============================================================

const problemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Problem title is required')
    .max(255, 'Title cannot exceed 255 characters'),

  description: z
    .string()
    .trim()
    .min(1, 'Problem description is required'),

  difficulty: z.enum(['easy', 'medium', 'hard']),

  tags: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(1, 'Tag cannot be empty'),
      })
    )
    .min(1, 'Add at least one tag'),

  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, 'Input is required'),
        output: z.string().min(1, 'Output is required'),
        explanation: z
          .string()
          .min(1, 'Explanation is required'),
      })
    )
    .min(1, 'Add at least one visible test case'),

  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, 'Input is required'),
        output: z.string().min(1, 'Output is required'),
      })
    )
    .min(1, 'Add at least one hidden test case'),

  startCode: z
    .array(
      z.object({
        language: z.enum(['C++', 'Java', 'JavaScript']),
        initialCode: z
          .string()
          .min(1, 'Initial code is required'),
      })
    )
    .length(3, 'All three starter code templates are required'),

  referenceSolution: z
    .array(
      z.object({
        language: z.enum(['C++', 'Java', 'JavaScript']),
        completeCode: z
          .string()
          .min(1, 'Reference solution is required'),
      })
    )
    .length(3, 'All three reference solutions are required'),
});

// ============================================================
// CONSTANTS
// ============================================================

const LANGUAGES = ['C++', 'Java', 'JavaScript'];

const LANGUAGE_META = {
  'C++': {
    description: 'GNU C++ starter template and reference solution',
  },
  Java: {
    description: 'Java starter template and reference solution',
  },
  JavaScript: {
    description: 'JavaScript starter template and reference solution',
  },
};

// ============================================================
// COMPONENT
// ============================================================

function AdminPanel() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(problemSchema),

    defaultValues: {
      title: '',
      description: '',
      difficulty: 'easy',

      tags: [{ value: 'array' }],

      visibleTestCases: [
        {
          input: '',
          output: '',
          explanation: '',
        },
      ],

      hiddenTestCases: [
        {
          input: '',
          output: '',
        },
      ],

      startCode: LANGUAGES.map((language) => ({
        language,
        initialCode: '',
      })),

      referenceSolution: LANGUAGES.map((language) => ({
        language,
        completeCode: '',
      })),
    },
  });

  // ============================================================
  // DYNAMIC ARRAYS
  // ============================================================

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: 'tags',
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: 'visibleTestCases',
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: 'hiddenTestCases',
  });

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = async (data) => {
    try {
      const cleanedTags = [
        ...new Set(
          data.tags
            .map((tag) => tag.value.trim().toLowerCase())
            .filter(Boolean)
        ),
      ];

      const payload = {
        ...data,
        tags: cleanedTags,
      };

      await axiosClient.post('/problem/create', payload);

      alert('Problem created successfully!');

      navigate('/');
    } catch (error) {
      console.error('Failed to create problem:', error);

      alert(
        error.response?.data?.message ||
          'Unable to create problem. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-base-300 bg-base-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>

                <h1 className="text-3xl font-bold">
                  Create New Problem
                </h1>
              </div>

              <p className="text-base-content/60 max-w-2xl">
                Create a coding problem with test cases,
                language templates, and verified reference
                solutions.
              </p>
            </div>

            <div className="badge badge-outline badge-lg">
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="container mx-auto px-6 py-8 pb-32">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* ==================================================
              SECTION 1 — BASIC INFORMATION
          ================================================== */}

          <section className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <SectionHeader
                number="01"
                icon={<FileText className="w-5 h-5" />}
                title="Problem Details"
                description="Define the problem users will see on the platform."
              />

              <div className="divider" />

              <div className="space-y-6">
                {/* TITLE */}

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Problem Title
                    </span>

                    <span className="label-text-alt text-base-content/50">
                      Required
                    </span>
                  </label>

                  <input
                    {...register('title')}
                    type="text"
                    placeholder="e.g. Two Sum"
                    className={`input input-bordered input-lg ${
                      errors.title ? 'input-error' : ''
                    }`}
                  />

                  <label className="label">
                    <span className="label-text-alt text-base-content/50">
                      Use a clear and unique problem title.
                    </span>
                  </label>

                  {errors.title && (
                    <ErrorMessage
                      message={errors.title.message}
                    />
                  )}
                </div>

                {/* DIFFICULTY */}

                <div className="form-control max-w-sm">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Difficulty
                    </span>
                  </label>

                  <select
                    {...register('difficulty')}
                    className={`select select-bordered ${
                      errors.difficulty ? 'select-error' : ''
                    }`}
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

                  {errors.difficulty && (
                    <ErrorMessage
                      message={errors.difficulty.message}
                    />
                  )}
                </div>

                {/* TAGS */}

                <div className="form-control">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="label p-0">
                        <span className="label-text font-semibold flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Tags
                        </span>
                      </label>

                      <p className="text-sm text-base-content/50 mt-1">
                        Add all topics that describe this problem.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => appendTag({ value: '' })}
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      <Plus className="w-4 h-4" />
                      Add Tag
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tagFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex gap-3"
                      >
                        <input
                          {...register(
                            `tags.${index}.value`
                          )}
                          type="text"
                          placeholder={
                            index === 0
                              ? 'e.g. array'
                              : 'e.g. hashmap'
                          }
                          className={`input input-bordered flex-1 ${
                            errors.tags?.[index]?.value
                              ? 'input-error'
                              : ''
                          }`}
                        />

                        {tagFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="btn btn-square btn-outline btn-error"
                            title="Remove tag"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {errors.tags?.message && (
                    <ErrorMessage
                      message={errors.tags.message}
                    />
                  )}
                </div>

                {/* DESCRIPTION */}

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Problem Description
                    </span>

                    <span className="label-text-alt text-base-content/50">
                      Required
                    </span>
                  </label>

                  <textarea
                    {...register('description')}
                    rows={10}
                    placeholder="Write the complete problem statement here..."
                    className={`textarea textarea-bordered text-base leading-relaxed ${
                      errors.description
                        ? 'textarea-error'
                        : ''
                    }`}
                  />

                  <label className="label">
                    <span className="label-text-alt text-base-content/50">
                      Include the task, constraints, and important
                      details users need to solve the problem.
                    </span>
                  </label>

                  {errors.description && (
                    <ErrorMessage
                      message={errors.description.message}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              SECTION 2 — VISIBLE TEST CASES
          ================================================== */}

          <section className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <SectionHeader
                number="02"
                icon={<FlaskConical className="w-5 h-5" />}
                title="Visible Test Cases"
                description="Examples users can see and use while solving the problem."
              />

              <div className="divider" />

              <div className="space-y-5">
                {visibleFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-base-300 rounded-xl overflow-hidden"
                  >
                    <div className="bg-base-200 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="badge badge-neutral">
                          #{index + 1}
                        </span>

                        <span className="font-semibold">
                          Example Test Case
                        </span>
                      </div>

                      {visibleFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeVisible(index)
                          }
                          className="btn btn-xs btn-ghost text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="p-5 grid md:grid-cols-2 gap-5">
                      <FormField
                        label="Input"
                        error={
                          errors.visibleTestCases?.[index]
                            ?.input?.message
                        }
                      >
                        <textarea
                          {...register(
                            `visibleTestCases.${index}.input`
                          )}
                          rows={5}
                          placeholder="5"
                          className={`textarea textarea-bordered font-mono w-full ${
                            errors.visibleTestCases?.[index]
                              ?.input
                              ? 'textarea-error'
                              : ''
                          }`}
                        />
                      </FormField>

                      <FormField
                        label="Expected Output"
                        error={
                          errors.visibleTestCases?.[index]
                            ?.output?.message
                        }
                      >
                        <textarea
                          {...register(
                            `visibleTestCases.${index}.output`
                          )}
                          rows={5}
                          placeholder="120"
                          className={`textarea textarea-bordered font-mono w-full ${
                            errors.visibleTestCases?.[index]
                              ?.output
                              ? 'textarea-error'
                              : ''
                          }`}
                        />
                      </FormField>

                      <div className="md:col-span-2">
                        <FormField
                          label="Explanation"
                          error={
                            errors.visibleTestCases?.[index]
                              ?.explanation?.message
                          }
                        >
                          <textarea
                            {...register(
                              `visibleTestCases.${index}.explanation`
                            )}
                            rows={4}
                            placeholder="Explain why this output is correct..."
                            className={`textarea textarea-bordered w-full ${
                              errors.visibleTestCases?.[index]
                                ?.explanation
                                ? 'textarea-error'
                                : ''
                            }`}
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    appendVisible({
                      input: '',
                      output: '',
                      explanation: '',
                    })
                  }
                  className="btn btn-outline btn-primary w-full"
                >
                  <Plus className="w-4 h-4" />
                  Add Visible Test Case
                </button>

                {errors.visibleTestCases?.message && (
                  <ErrorMessage
                    message={errors.visibleTestCases.message}
                  />
                )}
              </div>
            </div>
          </section>

          {/* ==================================================
              SECTION 3 — HIDDEN TEST CASES
          ================================================== */}

          <section className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <SectionHeader
                number="03"
                icon={<FlaskConical className="w-5 h-5" />}
                title="Hidden Test Cases"
                description="Private cases used by Judge0 when evaluating submissions."
              />

              <div className="alert alert-warning mt-5">
                <AlertCircle className="w-5 h-5" />

                <div>
                  <div className="font-semibold">
                    Keep hidden tests private
                  </div>

                  <div className="text-sm">
                    These cases are never shown to users and
                    should cover edge cases and invalid assumptions.
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div className="space-y-5">
                {hiddenFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-base-300 rounded-xl overflow-hidden"
                  >
                    <div className="bg-base-200 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="badge badge-neutral">
                          #{index + 1}
                        </span>

                        <span className="font-semibold">
                          Hidden Test Case
                        </span>
                      </div>

                      {hiddenFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeHidden(index)
                          }
                          className="btn btn-xs btn-ghost text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="p-5 grid md:grid-cols-2 gap-5">
                      <FormField
                        label="Input"
                        error={
                          errors.hiddenTestCases?.[index]
                            ?.input?.message
                        }
                      >
                        <textarea
                          {...register(
                            `hiddenTestCases.${index}.input`
                          )}
                          rows={5}
                          placeholder="10"
                          className={`textarea textarea-bordered font-mono w-full ${
                            errors.hiddenTestCases?.[index]
                              ?.input
                              ? 'textarea-error'
                              : ''
                          }`}
                        />
                      </FormField>

                      <FormField
                        label="Expected Output"
                        error={
                          errors.hiddenTestCases?.[index]
                            ?.output?.message
                        }
                      >
                        <textarea
                          {...register(
                            `hiddenTestCases.${index}.output`
                          )}
                          rows={5}
                          placeholder="3628800"
                          className={`textarea textarea-bordered font-mono w-full ${
                            errors.hiddenTestCases?.[index]
                              ?.output
                              ? 'textarea-error'
                              : ''
                          }`}
                        />
                      </FormField>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    appendHidden({
                      input: '',
                      output: '',
                    })
                  }
                  className="btn btn-outline btn-primary w-full"
                >
                  <Plus className="w-4 h-4" />
                  Add Hidden Test Case
                </button>

                {errors.hiddenTestCases?.message && (
                  <ErrorMessage
                    message={errors.hiddenTestCases.message}
                  />
                )}
              </div>
            </div>
          </section>

          {/* ==================================================
              SECTION 4 — LANGUAGE TEMPLATES
          ================================================== */}

          <section className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <SectionHeader
                number="04"
                icon={<Code2 className="w-5 h-5" />}
                title="Language Templates"
                description="Configure the starter code and official reference solution for each language."
              />

              <div className="divider" />

              <div className="space-y-6">
                {LANGUAGES.map((language, index) => (
                  <div
                    key={language}
                    className="border border-base-300 rounded-xl overflow-hidden"
                  >
                    {/* LANGUAGE HEADER */}

                    <div className="bg-base-200 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="badge badge-primary badge-lg">
                          {language}
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            {language} Configuration
                          </h3>

                          <p className="text-sm text-base-content/50">
                            {LANGUAGE_META[language].description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-6">
                      {/* STARTER CODE */}

                      <FormField
                        label="Initial / Starter Code"
                        error={
                          errors.startCode?.[index]
                            ?.initialCode?.message
                        }
                      >
                        <div className="rounded-xl overflow-hidden border border-base-300">
                          <div className="bg-neutral text-neutral-content px-4 py-2 flex items-center justify-between">
                            <span className="text-xs font-mono opacity-80">
                              starter.{getFileExtension(language)}
                            </span>

                            <span className="text-xs opacity-60">
                              Shown to users
                            </span>
                          </div>

                          <textarea
                            {...register(
                              `startCode.${index}.initialCode`
                            )}
                            rows={12}
                            spellCheck="false"
                            placeholder={`// Write ${language} starter code here...`}
                            className={`textarea textarea-ghost rounded-none w-full bg-base-300 font-mono text-sm leading-6 resize-y ${
                              errors.startCode?.[index]
                                ?.initialCode
                                ? 'textarea-error'
                                : ''
                            }`}
                          />
                        </div>
                      </FormField>

                      {/* REFERENCE SOLUTION */}

                      <FormField
                        label="Reference Solution"
                        error={
                          errors.referenceSolution?.[index]
                            ?.completeCode?.message
                        }
                      >
                        <div className="rounded-xl overflow-hidden border border-base-300">
                          <div className="bg-neutral text-neutral-content px-4 py-2 flex items-center justify-between">
                            <span className="text-xs font-mono opacity-80">
                              solution.{getFileExtension(language)}
                            </span>

                            <span className="text-xs opacity-60">
                              Used for validation
                            </span>
                          </div>

                          <textarea
                            {...register(
                              `referenceSolution.${index}.completeCode`
                            )}
                            rows={15}
                            spellCheck="false"
                            placeholder={`// Write verified ${language} reference solution here...`}
                            className={`textarea textarea-ghost rounded-none w-full bg-base-300 font-mono text-sm leading-6 resize-y ${
                              errors.referenceSolution?.[
                                index
                              ]?.completeCode
                                ? 'textarea-error'
                                : ''
                            }`}
                          />
                        </div>
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==================================================
              FINAL REVIEW
          ================================================== */}

          <section className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success mt-1" />

                <div>
                  <h3 className="font-semibold">
                    Before creating the problem
                  </h3>

                  <ul className="mt-2 space-y-1 text-sm text-base-content/60">
                    <li>
                      • Problem title and description are complete
                    </li>

                    <li>
                      • At least one visible and hidden test case
                      is configured
                    </li>

                    <li>
                      • Starter code is provided for all three
                      languages
                    </li>

                    <li>
                      • Reference solutions have been verified
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </form>
      </main>

      {/* ======================================================
          STICKY ACTION BAR
      ====================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-base-300 bg-base-100/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-base-content/60">
            Review your test cases and reference solutions
            before publishing.
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn btn-ghost flex-1 sm:flex-none"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              form=""
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="btn btn-primary flex-1 sm:flex-none min-w-48"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Problem
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SMALL UI COMPONENTS
// ============================================================

function SectionHeader({
  number,
  icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">
        {number}
      </div>

      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold">
            {title}
          </h2>
        </div>

        <p className="text-sm text-base-content/50 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">
          {label}
        </span>
      </label>

      {children}

      {error && <ErrorMessage message={error} />}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="flex items-center gap-2 text-error text-sm mt-2">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function getFileExtension(language) {
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
}

export default AdminPanel;