"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentProfile, deleteStudentProfile, StudentProfile } from "@/actions/studentProfileActions";
import Link from "next/link";

// Define interfaces for structured data
interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface WorkExperienceEntry {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface SkillEntry {
  id: string;
  name: string;
  proficiency: string;
}

interface LanguageEntry {
  id: string;
  name: string;
  proficiency: string;
}

export default function UserAccountPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const userId = params.userId;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const response = await getStudentProfile(userId);
      if (response.status === "success" && response.data) {
        setProfile(response.data);
      }
      setIsLoading(false);
    }

    loadProfile();
  }, [userId]);

  async function handleDeleteProfile() {
    const response = await deleteStudentProfile(userId);
    if (response.status === "success") {
      // Redirect to homepage or login page after successful deletion
      router.push("/");
    } else {
      alert("Failed to delete profile: " + response.message);
    }
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p>No profile information found for this user.</p>
        <Link href="/profile/create" className="text-blue-500 hover:underline">
          Create a new profile
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {profile.firstname} {profile.lastname}
          </h2>
          <div>
            <Link 
              href={`/profile/edit/${userId}`} 
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
            >
              Edit Profile
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete Profile
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">School:</p>
              <p>{profile.school_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Major:</p>
              <p>{profile.major}</p>
            </div>
            <div>
              <p className="text-gray-600">Enrollment Date:</p>
              <p>{profile.enrollment_date || "Not specified"}</p>
            </div>
            <div>
              <p className="text-gray-600">Graduation Date:</p>
              <p>{profile.graduation_date || "Not specified"}</p>
            </div>
            <div>
              <p className="text-gray-600">Status:</p>
              <p>{profile.graduation_type === "true" ? "Graduated" : "Student"}</p>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Education</h3>
          {profile.education && JSON.parse(profile.education).map((edu: EducationEntry) => (
            <div key={edu.id} className="mb-4 p-3 border rounded">
              <p className="font-semibold">{edu.institution}</p>
              <p>{edu.degree}, {edu.fieldOfStudy}</p>
              <p className="text-sm text-gray-600">
                {edu.startDate} - {edu.endDate}
              </p>
              {edu.description && <p className="mt-2">{edu.description}</p>}
            </div>
          ))}
        </div>

        {/* Work Experience */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Work Experience</h3>
          {profile.work_experience && JSON.parse(profile.work_experience).map((work: WorkExperienceEntry) => (
            <div key={work.id} className="mb-4 p-3 border rounded">
              <p className="font-semibold">{work.company}</p>
              <p>{work.position}</p>
              <p className="text-sm text-gray-600">
                {work.location} | {work.startDate} - {work.current ? "Present" : work.endDate}
              </p>
              {work.description && <p className="mt-2">{work.description}</p>}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills && JSON.parse(profile.skills).map((skill: SkillEntry) => (
              <span key={skill.id} className="bg-gray-100 px-3 py-1 rounded">
                {skill.name} ({skill.proficiency})
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {profile.native_language && JSON.parse(profile.native_language).map((lang: LanguageEntry) => (
              <span key={lang.id} className="bg-gray-100 px-3 py-1 rounded">
                {lang.name} ({lang.proficiency})
              </span>
            ))}
          </div>
        </div>

        {/* Resume */}
        {profile.resume_url && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Resume</h3>
            <a 
              href={profile.resume_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Resume
            </a>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete your profile? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}