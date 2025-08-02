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
  // --- QUIZ MODAL & CACHING LOGIC ---
  const cacheKey = `${week}_${topic}`;
  const questions = quizCache[cacheKey];
  const [modalOpen, setModalOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const handleOpenModal = () => {
    if (questions) {
      setModalOpen(true);
      setQuizError(null);
    } else {
      setQuizLoading(true);
      setQuizError(null);
      fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, topic }),
      })
        .then(res => res.json())
        .then(data => {
          // Limit to 2 True/False questions
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

  // -- FORMAT resources array for ResourceCard ---
  const resources: Resource[] = [
    ...articles.map(a => ({ ...a, type: "article" as const })),
    ...videos.map(v => ({ ...v, type: "video" as const })),
  ];

  // --- RENDER ---
  return (
    <div
      className="
        flex flex-col h-full w-full max-w-full
        bg-white border-2 border-blue-400 rounded-2xl shadow-lg
        px-4 py-6 md:px-8 md:py-8
        min-h-[430px] overflow-hidden
      "
    >
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
      <div
        className="text-gray-900 text-base font-medium mb-6 min-h-[80px] flex items-center break-words"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}
        title={goal}
      >
        {goal}
      </div>
      {/* RESOURCE CARD */}
      <div className="flex-1 flex flex-col mb-8 min-w-0">
        <ResourceCard resources={resources} />
      </div>
      {/* QUIZ LOADING/ERROR */}
      {quizLoading && (
        <div className="text-blue-700 py-3 font-semibold text-center">Loading quiz…</div>
      )}
      {quizError && (
        <div className="text-red-700 py-3 font-semibold text-center">{quizError}</div>
      )}
      {/* QUIZ BUTTON */}
      <div className="pt-6 flex justify-end items-end">
        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-8 py-3 rounded-lg shadow-md transition"
          disabled={quizLoading}
        >
          Take Quiz
        </button>
        <QuizModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          questions={questions || []} // pass the cached or just-fetched questions!
        />
      </div>
    </div>
  );
}