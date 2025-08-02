"use client";
import React, { useState } from "react";
import WeekCard from "./WeekCard"; // Modular, renders each weekly card

// -- Types --

/** Structure of a quiz question for the cache */
type Question = {
  id: number;
  question: string;
  choices: string[];
  answer: number; // index in choices array
};

/** Structure of the quiz question cache; keys are week_topic strings */
type QuizCache = { [key: string]: Question[] };

/**
 * Main form that collects user preferences and renders the weekly learning schedule.
 * All app state (inputs, results, quiz cache) is managed here.
 */
const CourseForm: React.FC = () => {
  // -- User input state --
  const [topic, setTopic] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [duration, setDuration] = useState("");

  // -- App UI state --
  const [submitted, setSubmitted] = useState(false);
  const [schedule, setSchedule] = useState<{
    week: number;
    title: string;
    goal: string;
    articles: { title: string; url: string }[];
    videos: { title: string; url: string }[];
  }[]>([]);

  const [loading, setLoading] = useState(false);

  // -- Quiz questions cache, scoped to this session's schedule --
  const [quizCache, setQuizCache] = useState<QuizCache>({});

  const[usingDummy, setUsingDummy] = useState(false);
  /**
   * On form submit, fetch the plan and reset quiz cache.
   * Normalizes backend schedule data.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizCache({}); // Invalidate all quiz caches for new schedule
    setSubmitted(true);
    setLoading(true);

    fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, proficiency, duration: Number(duration) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if(data.usingDummy){
          setUsingDummy(true);
        } else {
          setUsingDummy(false);
        }
        // Normalize backend format to the UI model
        const normalized = data.plan.map((item: any) => ({
          week: item.w,
          title: item.t,
          goal: item.g,
          articles: item.a.map((x: any) => ({ title: x.ti, url: x.u })),
          videos: item.v.map((x: any) => ({ title: x.ti, url: x.u })),
        }));
        setSchedule(normalized);
        setLoading(false);
      })
      .catch(() => {
        setSchedule([]);
        setLoading(false);
        setUsingDummy(false);
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

      {/* Loading Spinner */}
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
        </div>
      )}

      {usingDummy && (
        <div className="max-w-lg mx-auto my-4 p-3 rounded-lg bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 font-semibold shadow-md">
          ⚠️ Displaying dummy data because no valid Perplexity API key is configured on the backend.
        </div>
      )}
      {/* Weekly Schedule */}
      {!loading && schedule.length > 0 && (
        <section className="max-w-7xl mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Render one WeekCard per week, passing quiz state down */}
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
