import React, { useState } from "react";

// --- TYPES ---
/** Represents a learning resource: either an article or video */
type Resource = {
  title: string;
  url: string;
  type: "article" | "video";
};

// --- Utility function for truncating long titles ---
/**
 * Truncates a string to a given length and appends ellipsis if needed.
 * @param title The string to truncate
 * @param len Maximum length allowed (default 30)
 */
function truncateTitle(title: string, len = 30) {
  return title.length > len ? title.slice(0, len) + "..." : title;
}

/**
 * ResourceCard component displays articles and videos in tabbed UI.
 * It allows switching tabs between articles and videos.
 * The component always fills the width of its parent and provides consistent styling.
 *
 * Props:
 *  - resources: array of Resource objects (articles/videos)
 */
export default function ResourceCard({ resources }: { resources: Resource[] }) {
  // State to track which tab is active: "article" or "video"
  const [activeTab, setActiveTab] = useState<"article" | "video">("article");

  // Separate resources by type for tabbed display
  const articles = resources.filter((res) => res.type === "article");
  const videos = resources.filter((res) => res.type === "video");

  return (
    <div className="mt-4">
      {/* Section Heading */}
      <h4 className="font-semibold text-blue-700 mb-2">Resources</h4>

      {/* Tab Buttons for switching Between Articles / Videos */}
      <div className="flex mb-3 gap-2">
        {/* Articles Tab Button */}
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

        {/* Videos Tab Button */}
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

      {/* Resources List Container */}
      <div className="bg-white border border-blue-100 rounded-xl p-4 shadow min-h-[128px] flex flex-col justify-center w-full">
        {activeTab === "article" ? (
          articles.length > 0 ? (
            <ul className="space-y-2 w-full">
              {articles.map((res, idx) => (
                // Each resource item is a flex row with index and link
                <li
                  key={idx}
                  className="flex items-center gap-2 w-full min-w-0"
                  style={{ minHeight: "2.25rem" }} // fixed height per item for consistency
                >
                  {/* Numbering */}
                  <span className="mr-1 text-sm font-semibold text-gray-400 w-6 text-right">
                    {idx + 1}.
                  </span>

                  {/* Link with truncation and accessibility attributes */}
                  <a
                    href={res.url}
                    className="text-blue-700 hover:underline font-medium w-full block truncate sm:whitespace-normal sm:break-words"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={res.title} // full title on hover (tooltip)
                    style={{ minWidth: 0 }} // allow truncation to work properly
                  >
                    {truncateTitle(res.title, 30)}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            // When no articles are available
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
          // When no videos are available
          <div className="text-gray-500 min-h-[2.25rem] flex items-center">
            No videos available.
          </div>
        )}
      </div>
    </div>
  );
}
