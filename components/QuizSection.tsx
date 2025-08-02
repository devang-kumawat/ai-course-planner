import React, { useState } from "react";

type Question = {
    id: number;
    question: string;
    choices: string[];
    answer: number; // Index of the correct answer
};

export default function QuizSection({ week, topic }: { week: number; topic: string }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchQuiz = () => {
        setLoading(true);
        fetch("/api/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ week, topic }),
        })
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data.questions || []);
                setAnswers(Array((data.questions || []).length).fill(-1)); // Initialize answers with -1
                setSubmitted(false);
                setScore(0);
            })
            .finally(() => setLoading(false));
        };
        const handleSelect = (index: number, choiceIndex: number) => {setAnswers((ans) => {
            const copy = [...ans];
            copy[index] = choiceIndex;
            return copy;
        });
    };

    const handleSubmit = () => {
        let correctCount = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.answer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setSubmitted(true);
    };

    return (
        <div className="mt-5">
            <button
                onClick={fetchQuiz}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow font-semibold"
                disabled={loading}
            >
                {loading ? "Loading Quiz..." : questions.length===0 ? "Take Quiz" : "Regenerate Quiz"}
            </button>

        
      {/* Quiz questions */}
      {questions.length > 0 && (
        <div className="mt-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="mb-3 p-3 bg-gray-50 rounded">
              <div className="font-semibold">{q.question}</div>
              <div className="flex flex-col gap-1 mt-2">
                {q.choices.map((c, ci) => (
                  <label key={ci} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={ci}
                      disabled={submitted}
                      checked={answers[idx] === ci}
                      onChange={() => handleSelect(idx, ci)}
                      className="accent-blue-500"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {!submitted ? (
            <button
              className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold"
              onClick={handleSubmit}
            >
              Submit Quiz
            </button>
          ) : (
            <div className="mt-3 text-green-800 font-bold">
              Score: {score} / {questions.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



