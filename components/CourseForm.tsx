"use client";
import React, { useState } from "react";
import WeekCard from "./WeekCard"; // Modular, renders each weekly card

/**
 * Main form for collecting course schedule preferences and displaying weekly plan.
 */
// Store quiz questions per week_topic key
type Question = {
  id: number;
  question: string;
  choices: string[];
  answer: number;
};
type QuizCache = { [key: string]: Question[] };

const CourseForm: React.FC = () => {
  // State for form inputs
  const [topic, setTopic] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [duration, setDuration] = useState("");
  // Controls when to display summary or results
  const [submitted, setSubmitted] = useState(false);
  const [schedule, setSchedule] = useState<{
    week: number;
    title: string;
    goal: string;
    articles: { title: string; url: string }[];
    videos: { title: string; url: string }[];
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizCache, setQuizCache] = useState<QuizCache>({});

  // Handle form submit: fetch learning plan from backend
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizCache({}); // Clear all cached quizzes when generating a new schedule
    setSubmitted(true);
    setLoading(true);

    fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, proficiency, duration: Number(duration) }),
    })
      .then((res) => res.json())
      .then((data) => {
        // --- Normalization logic matches backend's plan format. Adjust if you change your backend keys! ---
        const normalized = data.plan.map((item: any) => ({
          week: item.w, // Ensure your backend returns .w, .t, .g, etc. (else change to item.week, etc.)
          title: item.t,
          goal: item.g,
          articles: item.a.map((x: any) => ({ title: x.ti, url: x.u })),
          videos: item.v.map((x: any) => ({ title: x.ti, url: x.u })),
        }));
        setQuizCache({}); // <-- Clear quizzes
        console.log("Received weekly schedule plan from backend:", data);
        setSchedule(normalized);
        setLoading(false);
      })
      .catch(() => {
        setSchedule([]);
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col items-center py-12 min-h-[80vh] w-full">
      {/* ---------- User Input Card ---------- */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl border border-blue-100 bg-white p-8"
      >
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8 tracking-tight">
          📚 Personalize Your Learning
        </h2>

        {/* Topic input */}
        <label htmlFor="topic" className="block text-gray-900 font-semibold mb-1">
          What do you want to learn?
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full border border-blue-200 rounded-md p-3 mb-4 text-gray-900 bg-gray-50 placeholder-gray-500"
          placeholder="e.g. Data Structures"
          required
          autoFocus
        />

        {/* Proficiency select */}
        <label htmlFor="proficiency" className="block text-gray-900 font-semibold mb-1">
          Your proficiency level:
        </label>
        <select
          id="proficiency"
          value={proficiency}
          onChange={(e) => setProficiency(e.target.value)}
          className="w-full border border-blue-200 rounded-md p-3 mb-4 text-gray-900 bg-gray-50"
          required
        >
          <option value="" disabled>Select your proficiency</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {/* Duration input */}
        <label htmlFor="duration" className="block text-gray-900 font-semibold mb-1">
          In how many weeks do you want to finish?
        </label>
        <input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border border-blue-200 rounded-md p-3 mb-4 text-gray-900 bg-gray-50 placeholder-gray-500"
          min={1}
          max={52}
          placeholder="e.g. 6"
          required
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white text-lg font-bold py-3 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Schedule 🚀"}
        </button>
      </form>

      {/* ---------- User Input Summary (Commented out, can enable for UX) ---------- */}
      {/* 
      {submitted && (
        <div className="w-full max-w-lg mt-8 mb-4 bg-gray-100 border-l-4 border-blue-500 rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Input</h3>
          <div className="space-y-1 text-gray-800 text-base">
            <div>
              <span className="font-semibold">Topic:</span> {topic}
            </div>
            <div>
              <span className="font-semibold">Proficiency:</span> {proficiency}
            </div>
            <div>
              <span className="font-semibold">Duration:</span> {duration} weeks
            </div>
          </div>
        </div>
      )}
      */}

      {/* ---------- Loading Spinner ---------- */}
      {loading && (
        <div className="mt-8 flex justify-center items-center">
          <div
            style={{
              width: 36,
              height: 36,
              borderTop: "4px solid #3b82f6",
              borderRight: "4px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
            aria-label="Loading spinner"
            role="status"
          />
          {/* 
            Be sure to add this CSS globally (or in your main CSS):
            @keyframes spin { to { transform: rotate(360deg); } }
          */}
        </div>
      )}

      {/* ---------- Display Generated Schedule as Responsive Cards ---------- */}
      {!loading && schedule.length > 0 && (
        <section className="max-w-7xl mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schedule.map((week) => (
            <WeekCard
              key={week.week}
              {...week}
              topic={topic}
              quizCache={quizCache}
              setQuizCache={setQuizCache}
            />

          ))}
        </section>
      )}
    </div>
  );
};

export default CourseForm;
