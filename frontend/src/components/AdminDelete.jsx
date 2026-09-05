import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Search,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
} from 'lucide-react';

import axiosClient from '../utils/axiosClient';

const getDifficultyBadge = (difficulty) => {
  switch (String(difficulty || '').toLowerCase()) {
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

const AdminDelete = () => {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');

  const [selectedProblem, setSelectedProblem] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  const [success, setSuccess] = useState(false);

  const [toast, setToast] = useState(null);

  // ============================================================
  // TOAST
  // ============================================================

  const showToast = (
    type,
    message,
    duration = 3500
  ) => {
    const id = Date.now();

    setToast({
      id,
      type,
      message,
    });

    if (duration > 0) {
      window.setTimeout(() => {
        setToast((current) => {
          if (!current || current.id !== id) {
            return current;
          }

          return null;
        });
      }, duration);
    }
  };

  const closeToast = () => {
    setToast(null);
  };

  // ============================================================
  // FETCH PROBLEMS
  // ============================================================

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosClient.get(
        '/problem/getAllProblem'
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setProblems(data);
    } catch (err) {
      console.error(
        'Failed to fetch problems:',
        err
      );

      let message =
        'Failed to fetch problems.';

      if (err.response?.status === 401) {
        message =
          'Your admin session has expired. Please log in again.';
      } else if (err.response?.status === 403) {
        message =
          'Administrator access is required.';
      } else {
        message =
          err.response?.data?.message ||
          message;
      }

      setError(message);

      showToast(
        'error',
        message
      );
    } finally {
      setLoading(false);
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

    return problems.filter((problem) => {
      const title =
        problem?.title
          ?.toLowerCase() || '';

      const difficulty =
        String(
          problem?.difficulty || ''
        ).toLowerCase();

      const tags = Array.isArray(
        problem?.tags
      )
        ? problem.tags.join(' ').toLowerCase()
        : String(
            problem?.tags || ''
          ).toLowerCase();

      return (
        title.includes(query) ||
        difficulty.includes(query) ||
        tags.includes(query)
      );
    });
  }, [problems, search]);

  // ============================================================
  // OPEN DELETE MODAL
  // ============================================================

  const openDeleteModal = (problem) => {
    setSelectedProblem(problem);
    setError(null);
    setSuccess(false);
  };

  // ============================================================
  // CLOSE DELETE MODAL
  // ============================================================

  const closeDeleteModal = () => {
    if (deleting) return;

    setSelectedProblem(null);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!selectedProblem?._id) {
      const message =
        'No problem selected for deletion.';

      showToast(
        'warning',
        message
      );

      return;
    }

    try {
      setDeleting(true);
      setError(null);
      setSuccess(false);

      const problemId =
        selectedProblem._id;

      const problemTitle =
        selectedProblem.title ||
        'Problem';

      await axiosClient.delete(
        `/problem/delete/${problemId}`
      );

      // Remove the deleted problem from local UI immediately.
      setProblems((current) =>
        current.filter(
          (problem) =>
            problem._id !== problemId
        )
      );

      setSelectedProblem(null);

      setSuccess(true);

      showToast(
        'success',
        `${problemTitle} deleted successfully.`
      );

      /*
       * Refresh from backend so the frontend
       * reflects the actual database/cache state.
       */
      await fetchProblems();

    } catch (err) {
      console.error(
        'Failed to delete problem:',
        err.response?.data ||
          err
      );

      let message =
        'Failed to delete problem.';

      if (err.response?.status === 401) {
        message =
          'Your admin session has expired. Please log in again.';
      } else if (err.response?.status === 403) {
        message =
          'Administrator access is required.';
      } else {
        message =
          err.response?.data?.message ||
          message;
      }

      setError(message);

      showToast(
        'error',
        message
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />

          <p className="text-base-content/60">
            Loading problems...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-base-200">

      {/* ======================================================
          TOAST
      ====================================================== */}

      {toast && (
        <div className="toast toast-top toast-end z-[120] p-4">
          <div
            className={`alert shadow-xl min-w-[320px] max-w-[430px] ${
              toast.type === 'success'
                ? 'alert-success'
                : toast.type === 'warning'
                ? 'alert-warning'
                : toast.type === 'error'
                ? 'alert-error'
                : 'alert-info'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-5 h-5" />
            )}

            {toast.type === 'warning' && (
              <AlertCircle className="w-5 h-5" />
            )}

            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5" />
            )}

            {toast.type === 'info' && (
              <Info className="w-5 h-5" />
            )}

            <span className="flex-1">
              {toast.message}
            </span>

            <button
              type="button"
              onClick={closeToast}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {selectedProblem && (
        <div className="modal modal-open z-[110]">
          <div className="modal-box max-w-md">

            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deleting}
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
                <Trash2 className="h-8 w-8 text-error" />
              </div>
            </div>

            <h2 className="mt-5 text-center text-xl font-bold">
              Delete Problem?
            </h2>

            <p className="mt-2 text-center text-base-content/60">
              You are about to permanently delete:
            </p>

            <div className="mt-4 rounded-xl bg-base-200 p-4 text-center">
              <p className="font-semibold">
                {selectedProblem.title}
              </p>

              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span
                  className={`badge ${getDifficultyBadge(
                    selectedProblem.difficulty
                  )}`}
                >
                  {selectedProblem.difficulty}
                </span>

                {Array.isArray(
                  selectedProblem.tags
                ) &&
                  selectedProblem.tags.map(
                    (tag) => (
                      <span
                        key={tag}
                        className="badge badge-outline"
                      >
                        {tag}
                      </span>
                    )
                  )}
              </div>
            </div>

            <div className="alert alert-warning mt-4">
              <AlertCircle className="w-5 h-5" />

              <span className="text-sm">
                This action cannot be undone.
              </span>
            </div>

            <div className="modal-action">

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="btn btn-ghost"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-error"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>

            </div>
          </div>

          <div
            className="modal-backdrop"
            onClick={closeDeleteModal}
          />
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="bg-base-100 border-b border-base-300">
        <div className="container mx-auto max-w-7xl px-6 py-7">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-error" />
              </div>

              <div>
                <div className="flex items-center gap-3">

                  <h1 className="text-3xl font-bold">
                    Delete Problems
                  </h1>

                  <span className="badge badge-error">
                    Admin
                  </span>

                </div>

                <p className="text-base-content/60 mt-1">
                  Permanently remove coding
                  problems from the platform.
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

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="container mx-auto max-w-7xl px-6 py-8">

        {/* ERROR */}

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

        {/* SUCCESS */}

        {success && (
          <div className="alert alert-success mb-6 shadow-sm">

            <CheckCircle2 className="w-5 h-5" />

            <div>
              <p className="font-semibold">
                Problem deleted successfully.
              </p>

              <p className="text-sm">
                The problem has been removed from the platform.
              </p>
            </div>

          </div>
        )}

        {/* SEARCH */}

        <section className="card bg-base-100 border border-base-300 shadow-sm mb-6">

          <div className="card-body">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold">
                  Problems
                </h2>

                <p className="text-sm text-base-content/50 mt-1">
                  Select a problem to remove it.
                </p>
              </div>

              <div className="badge badge-primary badge-lg">
                {problems.length} problems
              </div>

            </div>

            <label className="input input-bordered flex items-center gap-2 mt-4">

              <Search className="w-4 h-4 opacity-50" />

              <input
                type="text"
                placeholder="Search by title, difficulty, or tag..."
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

        </section>

        {/* EMPTY SEARCH */}

        {filteredProblems.length === 0 ? (
          <div className="card bg-base-100 border border-base-300 shadow-sm">

            <div className="card-body items-center justify-center py-20 text-center">

              <Search className="w-10 h-10 opacity-30" />

              <h2 className="mt-4 text-xl font-bold">
                No problems found
              </h2>

              <p className="text-base-content/50">
                Try a different search term.
              </p>

            </div>

          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">

            <table className="table">

              <thead>
                <tr>

                  <th className="w-16">
                    #
                  </th>

                  <th>
                    Title
                  </th>

                  <th>
                    Difficulty
                  </th>

                  <th>
                    Tags
                  </th>

                  <th className="text-right">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredProblems.map(
                  (
                    problem,
                    index
                  ) => (

                    <tr
                      key={
                        problem._id
                      }
                      className="hover:bg-base-200/50"
                    >

                      <th>
                        {index + 1}
                      </th>

                      <td>
                        <div className="font-semibold">
                          {
                            problem.title
                          }
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${getDifficultyBadge(
                            problem.difficulty
                          )}`}
                        >
                          {
                            problem.difficulty
                          }
                        </span>
                      </td>

                      <td>

                        <div className="flex flex-wrap gap-1.5">

                          {Array.isArray(
                            problem.tags
                          ) &&
                            problem.tags.map(
                              (
                                tag
                              ) => (
                                <span
                                  key={
                                    tag
                                  }
                                  className="badge badge-outline badge-sm"
                                >
                                  {
                                    tag
                                  }
                                </span>
                              )
                            )}

                        </div>

                      </td>

                      <td className="text-right">

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(
                              problem
                            )
                          }
                          className="btn btn-sm btn-error"
                          disabled={
                            deleting
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDelete;