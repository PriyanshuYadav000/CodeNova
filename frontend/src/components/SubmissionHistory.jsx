import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';

function SubmissionHistory({ problemId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!problemId) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await axiosClient.get(
          `/problem/submittedProblem/${problemId}`
        );

        /*
         * Backend can return:
         * 1. An array of submissions
         * 2. A string when there are no submissions
         *
         * Example:
         * "No Submission is persent"
         */
        if (Array.isArray(response.data)) {
          setSubmissions(response.data);
        } else {
          setSubmissions([]);
        }
      } catch (error) {
        console.error(
          'Error fetching submission history:',
          error.response?.data || error
        );

        setSubmissions([]);

        setError(
          error.response?.data?.message ||
            'Unable to load submission history.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="border border-base-300 rounded-lg bg-base-200 p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">
          No submissions yet
        </h3>

        <p className="text-base-content/60">
          You haven't submitted any solution for this problem yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const status = submission.status || 'unknown';

        const statusClass =
          status === 'accepted'
            ? 'badge-success'
            : status === 'wrong_answer'
              ? 'badge-error'
              : status === 'compilation_error'
                ? 'badge-warning'
                : 'badge-ghost';

        return (
          <div
            key={submission.id}
            className="border border-base-300 rounded-lg p-4 bg-base-100"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {submission.language || 'Unknown'}
                </span>

                <span
                  className={`badge ${statusClass}`}
                >
                  {status.replaceAll('_', ' ')}
                </span>
              </div>

              <span className="text-sm text-base-content/60">
                {submission.createdAt
                  ? new Date(
                      submission.createdAt
                    ).toLocaleString()
                  : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-base-content/50">
                  Test Cases
                </p>

                <p className="font-medium">
                  {submission.testCasesPassed ?? 0}/
                  {submission.testCasesTotal ?? 0}
                </p>
              </div>

              <div>
                <p className="text-base-content/50">
                  Runtime
                </p>

                <p className="font-medium">
                  {submission.runtime ?? 0} sec
                </p>
              </div>

              <div>
                <p className="text-base-content/50">
                  Memory
                </p>

                <p className="font-medium">
                  {submission.memory ?? 0} KB
                </p>
              </div>

              <div>
                <p className="text-base-content/50">
                  ID
                </p>

                <p className="font-medium truncate">
                  {submission.id}
                </p>
              </div>
            </div>

            {submission.errorMessage && (
              <div className="mt-4 p-3 rounded bg-error/10 text-error text-sm">
                {submission.errorMessage}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SubmissionHistory;