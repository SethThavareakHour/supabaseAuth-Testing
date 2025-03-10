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

  // Form state variables - updated to match database schema
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [graduationType, setGraduationType] = useState<boolean | null>(null);
  const [enrollmentDate, setEnrollmentDate] = useState<string>("");
  const [graduationDate, setGraduationDate] = useState<string>("");
  const [schoolName, setSchoolName] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [nativeLanguage, setNativeLanguage] = useState<string>("");
  const [technicalPromotion, setTechnicalPromotion] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const response = await getStudentProfile(userId);
      if (response.status === "success" && response.data) {
        setProfile(response.data);
        // Set form state with values from database
        setEducation(response.data.education || "");
        setSkills(response.data.skills || "");
        setWorkExperience(response.data.work_experience || "");
        setGraduationType(response.data.graduation_type === "true");
        setEnrollmentDate(response.data.enrollment_date || "");
        setGraduationDate(response.data.graduation_date || "");
        setSchoolName(response.data.school_name || "");
        setMajor(response.data.major || "");
        setNativeLanguage(response.data.native_language || "");
        setTechnicalPromotion(response.data.technical_promotion || "");
        setAdditionalInfo(response.data.additional_info || "");
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

    // Update formData with state values
    formData.set("education", education);
    formData.set("skills", skills);
    formData.set("work_experience", workExperience);
    formData.set("graduation_type", graduationType ? "true" : "false");

    // Attach resume if selected
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      console.log(
        "Submitting form data:",
        Object.fromEntries(formData.entries())
      );

      let response;
      if (profile?.id) {
        // Update existing profile
        response = await updateStudentProfile(formData);
      } else {
        // Create new profile
        const profileData: StudentProfile = {
          student_id: userId,
          firstname: formData.get("firstname") as string,
          lastname: formData.get("lastname") as string,
          self_promotion: formData.get("self_promotion") as string,
          education: education,
          skills: skills,
          work_experience: workExperience,
          graduation_type: graduationType ? "true" : "false",
          enrollment_date: enrollmentDate,
          graduation_date: graduationDate,
          school_name: schoolName,
          major: major,
          native_language: nativeLanguage,
          technical_promotion: technicalPromotion,
          additional_info: additionalInfo,
          portfolio_url: formData.get("portfolio_url") as string,
          linkedin_url: formData.get("linkedin_url") as string,
          github_url: formData.get("github_url") as string,
        };

        response = await createStudentProfile(profileData);
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

  function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
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

      {/* Self Promotion / Bio */}
      <div>
        <label htmlFor="self_promotion" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="self_promotion"
          name="self_promotion"
          rows={4}
          defaultValue={profile?.self_promotion || ""}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      {/* Technical Promotion */}
      <div>
        <label
          htmlFor="technical_promotion"
          className="block text-sm font-medium"
        >
          Technical Skills Summary
        </label>
        <textarea
          id="technical_promotion"
          name="technical_promotion"
          rows={3}
          value={technicalPromotion}
          onChange={(e) => setTechnicalPromotion(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Summarize your technical expertise and achievements"
        />
      </div>

      {/* School Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="school_name" className="block text-sm font-medium">
            School Name
          </label>
          <input
            type="text"
            id="school_name"
            name="school_name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>

        <div>
          <label htmlFor="major" className="block text-sm font-medium">
            Major / Field of Study
          </label>
          <input
            type="text"
            id="major"
            name="major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Education */}
      <div>
        <label htmlFor="education" className="block text-sm font-medium">
          Education History
        </label>
        <textarea
          id="education"
          name="education"
          rows={3}
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="List your educational background (degrees, certifications, etc.)"
        />
      </div>

      {/* Skills */}
      <div>
        <label htmlFor="skills" className="block text-sm font-medium">
          Skills
        </label>
        <textarea
          id="skills"
          name="skills"
          rows={3}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="List your skills (e.g., JavaScript, React, Node.js, etc.)"
        />
      </div>

      {/* Work Experience */}
      <div>
        <label htmlFor="work_experience" className="block text-sm font-medium">
          Work Experience
        </label>
        <textarea
          id="work_experience"
          name="work_experience"
          rows={4}
          value={workExperience}
          onChange={(e) => setWorkExperience(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="List your work experience (positions, companies, dates, etc.)"
        />
      </div>

      {/* Additional Info */}
      <div>
        <label htmlFor="additional_info" className="block text-sm font-medium">
          Additional Information
        </label>
        <textarea
          id="additional_info"
          name="additional_info"
          rows={3}
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Any other information you'd like to share"
        />
      </div>

      {/* Native Language */}
      <div>
        <label htmlFor="native_language" className="block text-sm font-medium">
          Native Language
        </label>
        <input
          type="text"
          id="native_language"
          name="native_language"
          value={nativeLanguage}
          onChange={(e) => setNativeLanguage(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      {/* Enrollment Date */}
      <div>
        <label htmlFor="enrollment_date" className="block text-sm font-medium">
          Enrollment Date
        </label>
        <input
          type="date"
          id="enrollment_date"
          name="enrollment_date"
          value={enrollmentDate}
          onChange={(e) => setEnrollmentDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      {/* Graduation Date */}
      <div>
        <label htmlFor="graduation_date" className="block text-sm font-medium">
          Graduation Date
        </label>
        <input
          type="date"
          id="graduation_date"
          name="graduation_date"
          value={graduationDate}
          onChange={(e) => setGraduationDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      {/* Graduation Type */}
      <div>
        <span className="block text-sm font-medium">Graduation Status</span>
        <div className="mt-1 space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="graduation_type_true"
              name="graduation_type"
              checked={graduationType === true}
              onChange={() => setGraduationType(true)}
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="graduation_type_true" className="ml-2">
              Graduated
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="graduation_type_false"
              name="graduation_type"
              checked={graduationType === false}
              onChange={() => setGraduationType(false)}
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="graduation_type_false" className="ml-2">
              Not Graduated
            </label>
          </div>
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
