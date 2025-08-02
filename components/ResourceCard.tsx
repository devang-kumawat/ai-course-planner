import React, { useState } from "react";

// --- TYPES ---
type Resource = {
  title: string;
  url: string;
  type: "article" | "video";
};

// --- Utility function for safe title truncation ---
function truncateTitle(title: string, len = 30) {
  return title.length > len ? title.slice(0, len) + "..." : title;
}

/**
 * Modular tabbed resources card for articles/videos
 * - Always fills width of parent card
 * - Responsive: titles truncated on small, wrap on large
 */
export default function ResourceCard({ resources }: { resources: Resource[] }) {
  const [activeTab, setActiveTab] = useState<"article" | "video">("article");

  // Divide resources by type
  const articles = resources.filter(res => res.type === "article");
  const videos = resources.filter(res => res.type === "video");

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-blue-700 mb-2">Resources</h4>

      {/* Tab Buttons */}
      <div className="flex mb-3 gap-2">
        <button
          className={`px-4 py-1 rounded-t-lg font-semibold border-b-2 focus:outline-none ${
            activeTab === "article"
              ? "border-blue-600 text-blue-800 bg-blue-50"
              : "border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("article")}
        >
          Articles
        </button>
        <button
          className={`px-4 py-1 rounded-t-lg font-semibold border-b-2 focus:outline-none ${
            activeTab === "video"
              ? "border-blue-600 text-blue-800 bg-blue-50"
              : "border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("video")}
        >
          Videos
        </button>
      </div>

      {/* Resource List Panel */}
      <div className="bg-white border border-blue-100 rounded-xl p-4 shadow min-h-[128px] flex flex-col justify-center w-full">
        {activeTab === "article" ? (
          articles.length > 0 ? (
            <ul className="space-y-2 w-full">
              {articles.map((res, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 w-full min-w-0"
                  style={{ minHeight: "2.25rem" }}
                >
                  <span className="mr-1 text-sm font-semibold text-gray-400 w-6 text-right">
                    {idx + 1}.
                  </span>
                  <a
                    href={res.url}
                    className="text-blue-700 hover:underline font-medium w-full block truncate sm:whitespace-normal sm:break-words"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={res.title}
                    style={{ minWidth: 0 }}
                  >
                    {truncateTitle(res.title, 30)}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 min-h-[2.25rem] flex items-center">
              No articles available.
            </div>
          )
        ) : videos.length > 0 ? (
          <ul className="space-y-2 w-full">
            {videos.map((res, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 w-full min-w-0"
                style={{ minHeight: "2.25rem" }}
              >
                <span className="mr-1 text-sm font-semibold text-gray-400 w-6 text-right">
                  {idx + 1}.
                </span>
                <a
                  href={res.url}
                  className="text-blue-700 hover:underline font-medium w-full block truncate sm:whitespace-normal sm:break-words"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={res.title}
                  style={{ minWidth: 0 }}
                >
                  {truncateTitle(res.title, 30)}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 min-h-[2.25rem] flex items-center">
            No videos available.
          </div>
        )}
      </div>
    </div>
  );
}
