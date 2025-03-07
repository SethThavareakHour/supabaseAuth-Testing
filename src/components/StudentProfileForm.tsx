"use client";

import { useState, useEffect } from "react";
import {
  createStudentProfile,
  updateStudentProfile,
  getStudentProfile,
  uploadResume,
  StudentProfile,
} from "@/actions/studentProfileActions";

export default function StudentProfileForm({ userId }: { userId?: string }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [education, setEducation] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experience, setExperience] = useState<string[]>([]);
  const [newExperience, setNewExperience] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const response = await getStudentProfile(userId);
      if (response.status === "success" && response.data) {
        setProfile(response.data);
        setEducation(response.data.education || []);
        setSkills(response.data.skills || []);
        setExperience(response.data.experience || []);
      }
      setIsLoading(false);
    }

    loadProfile();
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    formData.set("userId", userId || ""); // Ensure userId is included
    formData.set("education", JSON.stringify(education));
    formData.set("skills", JSON.stringify(skills));
    formData.set("experience", JSON.stringify(experience));

    // Attach resume if selected
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      console.log(
        "Submitting form data:",
        Object.fromEntries(formData.entries())
      );
      console.log(formData);
      let response;
      if (profile?.id) {
        formData.set("id", profile.id);
        response = await updateStudentProfile(formData);
      } else {
        response = await createStudentProfile(
          Object.fromEntries(formData.entries())
        );
        console.log(response);
      }

      console.log("API Response:", response);

      if (response.status === "success") {
        setMessage({ type: "success", text: "Profile saved successfully!" });
        setProfile(response.data);

        // Upload resume only if a new file is selected
        if (resumeFile) {
          console.log("Uploading resume file:", resumeFile);
          const uploadResponse = await uploadResume(resumeFile);
          console.log("Resume Upload Response:", uploadResponse);
          console.log(uploadResponse);
          if (uploadResponse.status === "success") {
            setMessage({
              type: "success",
              text: "Profile and resume saved successfully!",
            });
          } else {
            setMessage({
              type: "error",
              text: `Profile saved but resume upload failed: ${uploadResponse.message}`,
            });
          }
        }
      } else {
        console.error(
          "API returned an error:",
          response.status || "Unknown error"
        );
        setMessage({
          type: "error",
          text: response.message || "Failed to save profile",
        });
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setMessage({
        type: "error",
        text: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function removeEducation(index: number) {
    setEducation(education.filter((_, i) => i !== index));
  }

  function addEducation() {
    if (newEducation.trim()) {
      setEducation([...education, newEducation.trim()]);
      setNewEducation("");
    }
  }

  function addSkill() {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index));
  }

  function addExperience() {
    if (newExperience.trim()) {
      setExperience([...experience, newExperience.trim()]);
      setNewExperience("");
    }
  }

  function removeExperience(index: number) {
    setExperience(experience.filter((_, i) => i !== index));
  }

   function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      // await uploadResume(e.target.files[0]);
    }
  }

  if (isLoading) return <div>Loading profile...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message.text && (
        <div
          className={`p-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstname" className="block text-sm font-medium">
            First Name
          </label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            defaultValue={profile?.firstname || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label htmlFor="lastname" className="block text-sm font-medium">
            Last Name
          </label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            defaultValue={profile?.lastname || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile?.bio || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      {/* Education */}
      <div>
        <label className="block text-sm font-medium">Education</label>
        <div className="mt-1 flex">
          <input
            type="text"
            value={newEducation}
            onChange={(e) => setNewEducation(e.target.value)}
            placeholder="Add education (e.g., BS Computer Science, Stanford University)"
            className="block w-full rounded-md border border-gray-300 p-2"
          />
          <button
            type="button"
            onClick={addEducation}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {education.map((edu, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
            >
              <span>{edu}</span>
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium">Skills</label>
        <div className="mt-1 flex">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add skill (e.g., JavaScript, React, Node.js)"
            className="block w-full rounded-md border border-gray-300 p-2"
          />
          <button
            type="button"
            onClick={addSkill}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1 bg-blue-100 rounded-full"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="ml-2 text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium">Experience</label>
        <div className="mt-1 flex">
          <input
            type="text"
            value={newExperience}
            onChange={(e) => setNewExperience(e.target.value)}
            placeholder="Add experience (e.g., Software Engineer at Google, 2020-2022)"
            className="block w-full rounded-md border border-gray-300 p-2"
          />
          <button
            type="button"
            onClick={addExperience}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {experience.map((exp, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
            >
              <span>{exp}</span>
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="portfolio_url" className="block text-sm font-medium">
            Portfolio URL
          </label>
          <input
            type="url"
            id="portfolio_url"
            name="portfolio_url"
            defaultValue={profile?.portfolio_url || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium">
            LinkedIn URL
          </label>
          <input
            type="url"
            id="linkedin_url"
            name="linkedin_url"
            defaultValue={profile?.linkedin_url || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label htmlFor="github_url" className="block text-sm font-medium">
            GitHub URL
          </label>
          <input
            type="url"
            id="github_url"
            name="github_url"
            defaultValue={profile?.github_url || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Resume Upload */}
      <div>
        <label htmlFor="resume" className="block text-sm font-medium">
          Resume
        </label>
        <div className="mt-1">
          <input
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white"
          />
        </div>
        {profile?.resume_url && (
          <div className="mt-2">
            <a
              href={profile.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View current resume
            </a>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md text-white ${
            isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting
            ? "Saving..."
            : profile
            ? "Update Profile"
            : "Create Profile"}
        </button>
      </div>
    </form>
  );
}
