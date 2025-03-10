"use client";

import { useState, useEffect } from "react";
import {
  getAllStudentProfiles,
  searchStudentProfiles,
} from "@/actions/studentProfileActions";
import Link from "next/link";

export default function BrowseStudentProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchSkills, setSearchSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [keywords, setKeywords] = useState<string>(""); 
  const [education, setEducation] = useState("");
  const limit = 10;

  async function loadProfiles(pageNum = 1) {
    setIsLoading(true);
    setError("");

    try {
      const offset = (pageNum - 1) * limit;

      let response;
      if (searchSkills.length > 0 || keywords || education) {
        // Search with filters
        response = await searchStudentProfiles({
          // skills: searchSkills,
          keywords,
          education,
          limit,
          offset,
        });
      } else {
        // Get all profiles
        response = await getAllStudentProfiles({ limit, offset });
      }

      if (response.status === "success") {
        setProfiles(response.data || []);
        setTotalCount(response.count || 0);
      } else {
        setError(response.message || "Failed to load profiles");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles(page);
  }, [page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    loadProfiles(1);
  }

  function addSkill() {
    if (newSkill.trim() && !searchSkills.includes(newSkill.trim())) {
      setSearchSkills([...searchSkills, newSkill.trim()]);
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    setSearchSkills(searchSkills.filter((s) => s !== skill));
  }

  function clearFilters() {
    setSearchSkills([]);
    setKeywords("");
    setEducation("");
    setPage(1);
    loadProfiles(1);
  }

  const totalPages = Math.ceil(totalCount / limit);

  // Function to generate pagination numbers
  function getPaginationNumbers() {
    if (totalPages <= 5) {
      // If we have 5 or fewer pages, show all of them
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Otherwise, create a window around the current page
    let pages = [];
    const windowSize = 2;
    
    // Always show first page
    pages.push(1);
    
    // Add ellipsis if needed
    if (page > windowSize + 1) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add pages around current page
    const startPage = Math.max(2, page - windowSize);
    const endPage = Math.min(totalPages - 1, page + windowSize);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (page < totalPages - windowSize) {
      pages.push(-2); // -2 represents ellipsis (using different value to maintain unique keys)
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Browse Student Profiles</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium">
              Keywords
            </label>
            <input
              type="text"
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Search by name or bio"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label htmlFor="education" className="block text-sm font-medium">
              Education
            </label>
            <input
              type="text"
              id="education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Search by education (e.g., university name)"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Skills</label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill to search for"
                className="block w-full rounded-md border border-gray-300 p-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSkill}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Add
              </button>
            </div>

            {searchSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {searchSkills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center px-3 py-1 bg-blue-100 rounded-full"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-red-500"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">Loading profiles...</div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4 text-gray-600">
            {totalCount > 0
              ? `Showing ${Math.min(
                  (page - 1) * limit + 1,
                  totalCount
                )}-${Math.min(
                  page * limit,
                  totalCount
                )} of ${totalCount} results`
              : "No profiles found"}
          </div>

          {/* Profiles List */}
          <div className="space-y-4">
            {profiles.length === 0 && !isLoading ? (
              <div className="text-center py-8 bg-white p-4 rounded-lg shadow">
                No student profiles found matching your criteria.
              </div>
            ) : (
              profiles.map((profile: any) => (
                <div key={profile.id || profile.user_id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {profile.firstname} {profile.lastname}
                      </h2>
                      {profile.email && <p className="text-gray-600">{profile.email}</p>}
                      
                      {profile.education && (
                        <p className="text-gray-600 mt-1">{profile.education}</p>
                      )}

                      {profile.bio && (
                        <p className="mt-2 line-clamp-2">{profile.bio}</p>
                      )}
                    </div>

                    <Link
                      href={`/profile/${profile.user_id}`}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Profile
                    </Link>
                  </div>

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {profile.skills
                          .slice(0, 5)
                          .map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        {profile.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                            +{profile.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2" aria-label="Pagination">
                <button
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  aria-label="Previous page"
                >
                  Previous
                </button>

                {getPaginationNumbers().map((pageNum, index) => {
                  // If pageNum is negative, it represents an ellipsis
                  if (pageNum < 0) {
                    return (
                      <span key={`ellipsis-${pageNum}`} className="px-3 py-1">
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        page === pageNum
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={page === pageNum ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setPage(page < totalPages ? page + 1 : totalPages)
                  }
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    page === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}