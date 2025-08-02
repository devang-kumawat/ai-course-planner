import React, { useState } from "react";

type Question = {
  id: number;
  question: string;
  choices: string[];
  answer: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  questions: Question[];
};

/**
 * Modal dialog that displays a set of multiple choice (True/False) questions.
 */
export default function QuizModal({ open, onClose, questions }: Props) {
  // Local user interaction state
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Reset state when new quiz is loaded or modal opens
  React.useEffect(() => {
    if (open) {
      setAnswers(Array((questions || []).length).fill(-1));
      setCurrent(0);
      setSubmitted(false);
      setScore(null);
    }
  }, [open, questions]);

  if (!open) return null;

  // Score calculation
  const handleSubmit = () => {
    let cnt = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) cnt += 1;
    });
    setScore(cnt);
    setSubmitted(true);
  };

  // Handle answer selection for one question
  const handleSelect = (idx: number) => {
    setAnswers((a) => {
      const copy = [...a];
      copy[current] = idx;
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 bg-gray-800/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Modal box */}
      <div className="relative z-50 w-full max-w-md mx-auto rounded-2xl bg-white shadow-xl p-6 border-2 border-blue-500">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-blue-800">
            Question {questions.length > 0 ? current + 1 : 0} of {questions.length}
          </span>
          <button onClick={onClose} className="text-red-600 font-bold text-xl hover:text-red-800">×</button>
        </div>

        {/* If there are no valid questions */}
        {(questions.length === 0) && (
          <div className="text-center text-gray-600 py-8">
            No quiz available for this week.
          </div>
        )}

        {/* Main quiz UI */}
        {questions[current] && (
          <>
            <div className="font-semibold text-gray-900 mb-2 text-lg">{questions[current].question}</div>
            <div className="flex flex-col gap-2 mb-4">
              {questions[current].choices.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={submitted}
                  className={`px-3 py-2 rounded font-semibold border transition
                    ${answers[current] === i
                      ? "bg-blue-600 border-blue-700 text-white hover:bg-blue-700"
                      : "bg-gray-100 border-gray-300 text-gray-900 hover:bg-blue-100"}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
            {/* Navigation */}
            <div className="flex justify-between">
              <button
                disabled={current === 0 || submitted}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-60"
                onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
              >Prev</button>
              {current < questions.length - 1 ? (
                <button
                  disabled={answers[current] === -1 || submitted}
                  className="px-4 py-2 rounded bg-blue-600 text-white font-bold disabled:opacity-60"
                  onClick={() => setCurrent((c) => Math.min(c + 1, questions.length - 1))}
                >Next</button>
              ) : (
                <button
                  disabled={answers[current] === -1 || submitted}
                  className="px-4 py-2 rounded bg-green-600 text-white font-bold disabled:opacity-60"
                  onClick={handleSubmit}
                >Submit</button>
              )}
            </div>
          </>
        )}

        {/* Show score after submit */}
        {submitted && (
          <div className="mt-4 text-center text-lg font-bold text-green-700">
            You scored {score} out of {questions.length}!
          </div>
        )}
      </div>
    </div>
  );
}
