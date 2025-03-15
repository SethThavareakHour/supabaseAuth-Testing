import { getStudentProfile } from "@/actions/studentProfileActions";
import { redirect } from "next/navigation";
import { getUserSession } from "@/actions/auth";
import StudentProfileForm from "@/components/StudentProfileForm";
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  Key,
} from "react";

export default async function ProfilePage({
  params,
}: {
  params?: { userId?: string };
}) {
  // Get current user session
  const session = await getUserSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  // If userId is provided in params, we're viewing someone else's profile
  const userId = params?.userId;
  const isOwnProfile = !userId || userId === session.user.id;

  // Check if current user is allowed to view the profile
  if (
    !isOwnProfile &&
    session.user.user_metadata?.role !== "recruiter" &&
    session.user.user_metadata?.role !== "admin"
  ) {
    // If not own profile and not a recruiter/admin, redirect to own profile
    redirect("/profile");
  }

  // Get profile data
  const response = await getStudentProfile(userId);
  const profile = response.status === "success" ? response.data : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        {isOwnProfile
          ? "Your Profile"
          : `${profile?.firstname} ${profile?.lastname}'s Profile`}
      </h1>

      {isOwnProfile ? (
        // If own profile, show editable form
        <StudentProfileForm userId={session.user.id} />
      ) : // If viewing someone else's profile, show read-only view
      profile ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold">
                {profile.firstname} {profile.lastname}
              </h2>
              <p className="text-gray-600">{profile.email}</p>

              {profile.bio && (
                <div className="mt-4">
                  <h3 className="text-xl font-medium mb-2">About</h3>
                  <p>{profile.bio}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              {profile.resume_url && (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Resume
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.education && profile.education.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-2">Education</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {profile.education.map(
                    (
                      edu:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      index: Key | null | undefined
                    ) => (
                      <li key={index}>{edu}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {profile.experience && profile.experience.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-2">Experience</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {profile.experience.map(
                    (
                      exp:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      index: Key | null | undefined
                    ) => (
                      <li key={index}>{exp}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="text-xl font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(
                  (
                    skill:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined,
                    index: Key | null | undefined
                  ) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 rounded-full text-blue-800"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>Profile not found</div>
      )}
    </div>
  );
}
