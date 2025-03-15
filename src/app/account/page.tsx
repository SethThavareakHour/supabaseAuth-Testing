"use client";

import { useEffect, useState } from "react";
import {
  getStudentProfile,
  deleteStudentProfile,
  StudentProfile,
} from "@/actions/studentProfileActions";
import Link from "next/link";

export default function StudentAccountPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getStudentProfile();
        console.log("Profile response:", response);

        if (response.status === "success" && response.data) {
          setProfile(response.data);
        } else {
          // Handle the specific error for profile not found
          if (response.message && response.message.includes("multiple rows")) {
            setError("Multiple profiles found. Please contact support.");
          } else {
            setError(response.message || "Failed to load profile.");
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An unexpected error occurred while fetching your profile.");
      }

      setIsLoading(false);
    }

    fetchProfile();
  }, []);

  const handleDelete = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const response = await deleteStudentProfile(profile?.id || "");

      if (response.status === "success") {
        alert("Account deleted successfully.");
        setProfile(null);
      } else {
        alert(response.message || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Error deleting profile:", err);
      alert("An unexpected error occurred while deleting your account.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-10">Loading...</div>
    );

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl text-black font-semibold mb-4">My Account</h2>
        <p className="text-red-500">{error}</p>
        <p className="mt-4 text-black">
          {error.includes("multiple") || error.includes("no rows") ? (
            <Link href="/account/edit" className="text-blue-500 underline">
              Create a profile here
            </Link>
          ) : (
            "Please try again later or contact support if the problem persists."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl text-black font-semibold mb-4">My Account</h2>
      {profile ? (
        <>
          <p className="mb-2">
            <strong>Name:</strong> {profile.firstname} {profile.lastname}
          </p>
          <p className="mb-2">
            <strong>Email:</strong> {profile.email}
          </p>
          <p className="mb-2">
            <strong>Major:</strong> {profile.major || "Not specified"}
          </p>
          <p className="mb-2">
            <strong>School:</strong> {profile.school_name || "Not specified"}
          </p>

          {profile.skills && (
            <p className="mb-2">
              <strong>Skills:</strong>{" "}
              {(() => {
                try {
                  const skillsArray = JSON.parse(profile.skills || "[]");
                  return skillsArray.map((s: any) => s.name).join(", ");
                } catch (e) {
                  return profile.skills;
                }
              })()}
            </p>
          )}

          {profile.work_experience && (
            <p className="mb-2">
              <strong>Work Experience:</strong>{" "}
              {(() => {
                try {
                  const workArray = JSON.parse(profile.work_experience || "[]");
                  return workArray.map((w: any) => w.company).join(", ");
                } catch (e) {
                  return profile.work_experience;
                }
              })()}
            </p>
          )}

          <div className="flex gap-4 mt-6">
            <Link href="/account/edit">
              <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-4 py-2 rounded-md">
                Edit Profile
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 transition-colors text-white px-4 py-2 rounded-md"
            >
              Delete Account
            </button>
          </div>
        </>
      ) : (
        <p>
          No profile found.{" "}
          <Link href="/account/edit" className="text-blue-500 underline">
            Create one here
          </Link>
          .
        </p>
      )}
    </div>
  );
}
