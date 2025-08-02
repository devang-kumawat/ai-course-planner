import React, { useState } from "react";
import ResourceCard from "./ResourceCard";
import QuizModal from "./QuizModal";

// --- TYPES ---
type Resource = {
  title: string;
  url: string;
  type: "article" | "video";
};
type Question = {
  id: number;
  question: string;
  choices: string[];
  answer: number;
};
/**
 * Props for a single week/week-card in the schedule grid.
 * Receives cached quiz data and cache mutator from CourseForm.
 */
type Props = {
  week: number;
  goal: string;
  title: string;
  topic: string;
  articles: { title: string; url: string }[];
  videos: { title: string; url: string }[];
  quizCache: { [key: string]: Question[] };
  setQuizCache: React.Dispatch<React.SetStateAction<{ [key: string]: Question[] }>>;
};

export default function WeekCard({
  week,
  goal,
  title,
  topic,
  articles = [],
  videos = [],
  quizCache,
  setQuizCache,
}: Props) {
  // --- Define cache key for this week's quiz (unique per topic+week) ---
  const cacheKey = `${week}_${topic}`;
  const questions = quizCache[cacheKey];

  const [modalOpen, setModalOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  /**
   * Will either open cached quiz, or fetch quiz for this week+topic and cache it.
   */
  const handleOpenModal = () => {
    if (questions) {
      setModalOpen(true);
      setQuizError(null);
    } else {
      setQuizLoading(true);
      setQuizError(null);
      // Update to send topic + goal for a more meaningful quiz prompt
      fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, goal }), // NOTE: sending goal!
      })
        .then(res => res.json())
        .then(data => {
          const filtered = (data.questions || [])
            .filter((q: Question) => Array.isArray(q.choices) && q.choices.length === 2)
            .slice(0, 2);
          setQuizCache(prev => ({ ...prev, [cacheKey]: filtered }));
          setModalOpen(true);
        })
        .catch(() => setQuizError('Failed to load quiz.'))
        .finally(() => setQuizLoading(false));
    }
  };

  // -- Combine resources into single array for tab UI --
  const resources: Resource[] = [
    ...articles.map(a => ({ ...a, type: "article" as const })),
    ...videos.map(v => ({ ...v, type: "video" as const })),
  ];

  // --- COMPONENT RENDER ---
  return (
    <div className="flex flex-col h-full w-full max-w-full bg-white border-2 border-blue-400 rounded-2xl shadow-lg px-4 py-6 md:px-8 md:py-8 min-h-[430px] overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5 min-h-[72px]">
        <span
          className="text-xl font-extrabold text-blue-900 break-words overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
          title={title}
        >
          {`Week ${week}: ${title}`}
        </span>
      </div>

      {/* GOAL */}
      <div className="text-gray-900 text-base font-medium mb-6 min-h-[80px] flex items-center break-words"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}
        title={goal}>
        {goal}
      </div>

      {/* RESOURCE CARD */}
      <div className="flex-1 flex flex-col mb-8 min-w-0">
        <ResourceCard resources={resources} />
      </div>

      {/* QUIZ LOADING/ERROR STATES */}
      {quizLoading && <div className="text-blue-700 py-3 font-semibold text-center">Loading quiz…</div>}
      {quizError && <div className="text-red-700 py-3 font-semibold text-center">{quizError}</div>}

      {/* QUIZ BUTTON / MODAL */}
      <div className="pt-6 flex justify-end items-end">
        <button
          onClick={handleOpenModal}
          disabled={quizLoading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-8 py-3 rounded-lg shadow-md transition"
        >
          Take Quiz
        </button>
        <QuizModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          questions={questions || []} // Pass the cached or just-fetched questions!
        />
      </div>
    </div>
  );
}
