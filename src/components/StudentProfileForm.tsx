"use client";

import { useState, useEffect } from "react";
import {
  createStudentProfile,
  updateStudentProfile,
  getStudentProfile,
  uploadResume,
  StudentProfile,
} from "@/actions/studentProfileActions";

// New interfaces for structured data
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
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface LanguageEntry {
  id: string;
  name: string;
  proficiency:
    | "Elementary"
    | "Limited Working"
    | "Professional Working"
    | "Full Professional"
    | "Native/Bilingual";
}

export default function StudentProfileForm({ userId }: { userId?: string }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form state variables for existing fields
  const [technicalPromotion, setTechnicalPromotion] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [graduationType, setGraduationType] = useState<boolean | null>(null);
  const [enrollmentDate, setEnrollmentDate] = useState<string>("");
  const [graduationDate, setGraduationDate] = useState<string>("");
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(
    []
  );
  const [workExperienceEntries, setWorkExperienceEntries] = useState<
    WorkExperienceEntry[]
  >([]);
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);
  const [languageEntries, setLanguageEntries] = useState<LanguageEntry[]>([]);

  const [showEducationForm, setShowEducationForm] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<EducationEntry>({
    id: "",
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [showWorkForm, setShowWorkForm] = useState(false);
  const [currentWork, setCurrentWork] = useState<WorkExperienceEntry>({
    id: "",
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<SkillEntry>({
    id: "",
    name: "",
    proficiency: "Intermediate",
  });

  // Handle new language form
  const [showLanguageForm, setShowLanguageForm] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageEntry>({
    id: "",
    name: "",
    proficiency: "Professional Working",
  });

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      const response = await getStudentProfile(userId);
      if (response.status === "success" && response.data) {
        setProfile(response.data);

        // Set basic form state with values from database
        setTechnicalPromotion(response.data.technical_promotion || "");
        setAdditionalInfo(response.data.additional_info || "");
        setSchoolName(response.data.school_name || "");
        setMajor(response.data.major || "");
        setGraduationType(response.data.graduation_type === "true");
        setEnrollmentDate(response.data.enrollment_date || "");
        setGraduationDate(response.data.graduation_date || "");

        // Parse structured data from JSON strings
        try {
          if (response.data.education) {
            setEducationEntries(JSON.parse(response.data.education));
          }
          if (response.data.work_experience) {
            setWorkExperienceEntries(JSON.parse(response.data.work_experience));
          }
          if (response.data.skills) {
            setSkillEntries(JSON.parse(response.data.skills));
          }
          if (response.data.native_language) {
            setLanguageEntries(JSON.parse(response.data.native_language));
          }
        } catch (error) {
          console.error("Error parsing saved profile data:", error);
          // If parsing fails, try to handle legacy data
          handleLegacyData(response.data);
        }
      }
      setIsLoading(false);
    }

    loadProfile();
  }, [userId]);

  // Convert old text format to structured data
  function handleLegacyData(data: StudentProfile) {
    // Handle legacy education format
    if (
      data.education &&
      typeof data.education === "string" &&
      !data.education.startsWith("[")
    ) {
      const legacyEducation: EducationEntry = {
        id: Date.now().toString(),
        institution: data.school_name || "",
        degree: "",
        fieldOfStudy: data.major || "",
        startDate: data.enrollment_date || "",
        endDate: data.graduation_date || "",
        description: data.education,
      };
      setEducationEntries([legacyEducation]);
    }

    // Handle legacy work experience format
    if (
      data.work_experience &&
      typeof data.work_experience === "string" &&
      !data.work_experience.startsWith("[")
    ) {
      const legacyWork: WorkExperienceEntry = {
        id: Date.now().toString(),
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: data.work_experience,
      };
      setWorkExperienceEntries([legacyWork]);
    }

    // Handle legacy skills format
    if (
      data.skills &&
      typeof data.skills === "string" &&
      !data.skills.startsWith("[")
    ) {
      const skillsList = data.skills.split(",").map((skill) => skill.trim());
      const legacySkills = skillsList.map((skill) => ({
        id: Date.now() + Math.random().toString(),
        name: skill,
        proficiency: "Intermediate" as const,
      }));
      setSkillEntries(legacySkills);
    }

    // Handle legacy language format
    if (
      data.native_language &&
      typeof data.native_language === "string" &&
      !data.native_language.startsWith("[")
    ) {
      const legacyLanguage: LanguageEntry = {
        id: Date.now().toString(),
        name: data.native_language,
        proficiency: "Native/Bilingual" as const,
      };
      setLanguageEntries([legacyLanguage]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Convert structured data to JSON strings
    formData.set("education", JSON.stringify(educationEntries));
    formData.set("work_experience", JSON.stringify(workExperienceEntries));
    formData.set("skills", JSON.stringify(skillEntries));
    formData.set("native_language", JSON.stringify(languageEntries));
    formData.set("graduation_type", graduationType ? "true" : "false");

    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      console.log(
        "Submitting form data:",
        Object.fromEntries(formData.entries())
      );

      // Add this code to handle empty date strings
      if (formData.get("enrollment_date") === "") {
        formData.set("enrollment_date", ""); // This will be converted to NULL in your backend
      }

      if (formData.get("graduation_date") === "") {
        formData.set("graduation_date", ""); // This will be converted to NULL in your backend
      }

      let response;

      if (profile?.id) {
        // Update existing profile
        response = await updateStudentProfile(formData);
      } else {
        // For new profile creation, modify this section:
        const profileData: StudentProfile = {
          student_id: userId,
          firstname: formData.get("firstname") as string,
          lastname: formData.get("lastname") as string,
          self_promotion: formData.get("self_promotion") as string,
          education: JSON.stringify(educationEntries),
          skills: JSON.stringify(skillEntries),
          work_experience: JSON.stringify(workExperienceEntries),
          graduation_type: graduationType ? "true" : "false",
          enrollment_date: enrollmentDate || undefined, // Convert empty string to undefined
          graduation_date: graduationDate || undefined, // Convert empty string to undefined
          school_name: schoolName,
          major: major,
          native_language: JSON.stringify(languageEntries),
          technical_promotion: technicalPromotion,
          additional_info: additionalInfo,
          resume_url: formData.get("resume_url") as string,
        };

        response = await createStudentProfile(profileData);
      }

      if (response.status === "success") {
        setMessage({ type: "success", text: "Profile saved successfully!" });
        setProfile(response.data);

        // Upload resume only if a new file is selected
        if (resumeFile) {
          console.log("Uploading resume file:", resumeFile);
          const uploadResponse = await uploadResume(resumeFile);

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

  function addEducation() {
    if (currentEducation.institution && currentEducation.degree) {
      if (currentEducation.id) {
        setEducationEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === currentEducation.id ? currentEducation : entry
          )
        );
      } else {
        setEducationEntries((prevEntries) => [
          ...prevEntries,
          { ...currentEducation, id: Date.now().toString() },
        ]);
      }
      setCurrentEducation({
        id: "",
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      setShowEducationForm(false);
    }
  }

  function editEducation(education: EducationEntry) {
    setCurrentEducation(education);
    setShowEducationForm(true);
  }

  function deleteEducation(id: string) {
    setEducationEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== id)
    );
  }
  function addWorkExperience() {
    if (currentWork.company && currentWork.position) {
      if (currentWork.id) {
        // Update existing entry
        setWorkExperienceEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === currentWork.id ? currentWork : entry
          )
        );
      } else {
        // Add new entry
        setWorkExperienceEntries((prevEntries) => [
          ...prevEntries,
          { ...currentWork, id: Date.now().toString() },
        ]);
      }
      setCurrentWork({
        id: "",
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
      setShowWorkForm(false);
    }
  }

  function editWorkExperience(work: WorkExperienceEntry) {
    setCurrentWork(work);
    setShowWorkForm(true);
  }

  function deleteWorkExperience(id: string) {
    setWorkExperienceEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== id)
    );
  }

  // Skill entry handlers
  function addSkill() {
    if (currentSkill.name) {
      if (currentSkill.id) {
        // Update existing entry
        setSkillEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === currentSkill.id ? currentSkill : entry
          )
        );
      } else {
        // Add new entry
        setSkillEntries((prevEntries) => [
          ...prevEntries,
          { ...currentSkill, id: Date.now().toString() },
        ]);
      }
      setCurrentSkill({
        id: "",
        name: "",
        proficiency: "Intermediate",
      });
      setShowSkillForm(false);
    }
  }

  function editSkill(skill: SkillEntry) {
    setCurrentSkill(skill);
    setShowSkillForm(true);
  }

  function deleteSkill(id: string) {
    setSkillEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== id)
    );
  }

  // Language entry handlers
  function addLanguage() {
    if (currentLanguage.name) {
      if (currentLanguage.id) {
        // Update existing entry
        setLanguageEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === currentLanguage.id ? currentLanguage : entry
          )
        );
      } else {
        // Add new entry
        setLanguageEntries((prevEntries) => [
          ...prevEntries,
          { ...currentLanguage, id: Date.now().toString() },
        ]);
      }
      setCurrentLanguage({
        id: "",
        name: "",
        proficiency: "Professional Working",
      });
      setShowLanguageForm(false);
    }
  }

  function editLanguage(language: LanguageEntry) {
    setCurrentLanguage(language);
    setShowLanguageForm(true);
  }

  function deleteLanguage(id: string) {
    setLanguageEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== id)
    );
  }

  function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  }

  if (isLoading) return <div>Loading profile...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      {/* Basic Information (First Name, Last Name, Bio) */}
      <div className="space-y-6">
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
          <label htmlFor="self_promotion" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="self_promotion"
            name="self_promotion"
            rows={4}
            defaultValue={profile?.self_promotion || ""}
            className="mt-1 block text-black w-full rounded-md border border-gray-300 p-2"
          />
        </div>

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
            className="mt-1 block w-full text-black rounded-md border border-gray-300 p-2"
            placeholder="Summarize your technical expertise and achievements"
          />
        </div>
      </div>

      {/* Education Section - LinkedIn Style */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">Education</h2>
          <button
            type="button"
            onClick={() => {
              setCurrentEducation({
                id: "",
                institution: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                description: "",
              });
              setShowEducationForm(true);
            }}
            className="px-2 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Education
          </button>
        </div>

        {/* Education entries */}
        {educationEntries.length > 0 ? (
          <div className="space-y-4">
            {educationEntries.map((edu) => (
              <div key={edu.id} className="p-4 border rounded-md relative">
                <div className="absolute right-2 top-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => editEducation(edu)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteEducation(edu.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
                <h3 className="font-semibold text-lg">{edu.institution}</h3>
                <p>
                  {edu.degree}
                  {edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}
                </p>
                <p className="text-black">
                  {edu.startDate && new Date(edu.startDate).getFullYear()} -
                  {edu.endDate
                    ? new Date(edu.endDate).getFullYear()
                    : "Present"}
                </p>
                {edu.description && <p className="mt-2">{edu.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No education entries yet</p>
        )}

        {/* Education form */}
        {showEducationForm && (
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-black font-medium">
                  Institution
                </label>
                <input
                  type="text"
                  value={currentEducation.institution}
                  onChange={(e) =>
                    setCurrentEducation({
                      ...currentEducation,
                      institution: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border text-black border-gray-300 p-2"
                  placeholder="University/School Name"
                />
              </div>
              <div>
                <label className="block text-black text-sm font-medium">
                  Degree
                </label>
                <input
                  type="text"
                  value={currentEducation.degree}
                  onChange={(e) =>
                    setCurrentEducation({
                      ...currentEducation,
                      degree: e.target.value,
                    })
                  }
                  className="mt-1 block w-full text-black rounded-md border border-gray-300 p-2"
                  placeholder="Bachelor's, Master's, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-black text-sm font-medium">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={currentEducation.fieldOfStudy}
                  onChange={(e) =>
                    setCurrentEducation({
                      ...currentEducation,
                      fieldOfStudy: e.target.value,
                    })
                  }
                  className="mt-1 block text-black w-full rounded-md border border-gray-300 p-2"
                  placeholder="Computer Science, Business, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black text-sm font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={currentEducation.startDate}
                    onChange={(e) =>
                      setCurrentEducation({
                        ...currentEducation,
                        startDate: e.target.value,
                      })
                    }
                    className="mt-1 text-black block w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-black text-sm font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={currentEducation.endDate}
                    onChange={(e) =>
                      setCurrentEducation({
                        ...currentEducation,
                        endDate: e.target.value,
                      })
                    }
                    className="mt-1 text-black block w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-black text-sm font-medium">
                Description
              </label>
              <textarea
                value={currentEducation.description}
                onChange={(e) =>
                  setCurrentEducation({
                    ...currentEducation,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="mt-1 block text-black w-full rounded-md border border-gray-300 p-2"
                placeholder="Activities, achievements, etc."
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowEducationForm(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addEducation}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {currentEducation.id ? "Update" : "Add"} Education
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Work Experience Section - LinkedIn Style */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">Work Experience</h2>
          <button
            type="button"
            onClick={() => {
              setCurrentWork({
                id: "",
                company: "",
                position: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                description: "",
              });
              setShowWorkForm(true);
            }}
            className="px-2 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Experience
          </button>
        </div>

        {/* Work experience entries */}
        {workExperienceEntries.length > 0 ? (
          <div className="space-y-4">
            {workExperienceEntries.map((work) => (
              <div key={work.id} className="p-4 border rounded-md relative">
                <div className="absolute right-2 top-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => editWorkExperience(work)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteWorkExperience(work.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
                <h3 className="font-semibold text-lg">{work.position}</h3>
                <p>
                  {work.company} {work.location && `· ${work.location}`}
                </p>
                <p className="text-gray-600">
                  {work.startDate &&
                    new Date(work.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}{" "}
                  -
                  {work.current
                    ? "Present"
                    : work.endDate &&
                      new Date(work.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                </p>
                {work.description && <p className="mt-2">{work.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No work experience entries yet</p>
        )}

        {/* Work experience form */}
        {showWorkForm && (
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-black font-medium">
                  Position/Title
                </label>
                <input
                  type="text"
                  value={currentWork.position}
                  onChange={(e) =>
                    setCurrentWork({
                      ...currentWork,
                      position: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  placeholder="Software Engineer, Project Manager, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Company</label>
                <input
                  type="text"
                  value={currentWork.company}
                  onChange={(e) =>
                    setCurrentWork({
                      ...currentWork,
                      company: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  placeholder="Company Name"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Location</label>
              <input
                type="text"
                value={currentWork.location}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    location: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                placeholder="City, State, Country"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={currentWork.startDate}
                  onChange={(e) =>
                    setCurrentWork({
                      ...currentWork,
                      startDate: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="currentPosition"
                    checked={currentWork.current}
                    onChange={(e) =>
                      setCurrentWork({
                        ...currentWork,
                        current: e.target.checked,
                        endDate: e.target.checked ? "" : currentWork.endDate,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="currentPosition"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    I currently work here
                  </label>
                </div>
                {!currentWork.current && (
                  <>
                    <label className="block text-sm font-medium">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={currentWork.endDate}
                      onChange={(e) =>
                        setCurrentWork({
                          ...currentWork,
                          endDate: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    />
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={currentWork.description}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                placeholder="Some placeholder text"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowWorkForm(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addWorkExperience}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {currentWork.id ? "Update" : "Add"} Experience
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Skills Section - LinkedIn Style */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">Skills</h2>
          <button
            type="button"
            onClick={() => {
              setCurrentSkill({
                id: "",
                name: "",
                proficiency: "Intermediate",
              });
              setShowSkillForm(true);
            }}
            className="px-2 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Skill
          </button>
        </div>

        {/* Skills entries */}
        {skillEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillEntries.map((skill) => (
              <div
                key={skill.id}
                className="p-3 border rounded-md flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{skill.name}</h3>
                  <p className="text-sm text-gray-600">{skill.proficiency}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => editSkill(skill)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSkill(skill.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-black-500 italic">No skills added yet</p>
        )}

        {/* Skill form */}
        {showSkillForm && (
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-black text-sm font-medium">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={currentSkill.name}
                  onChange={(e) =>
                    setCurrentSkill({
                      ...currentSkill,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full text-black rounded-md border border-gray-300 p-2"
                  placeholder="JavaScript, Project Management, etc."
                />
              </div>
              <div>
                <label className="block text-sm text-black font-medium">
                  Proficiency
                </label>
                <select
                  value={currentSkill.proficiency}
                  onChange={(e) =>
                    setCurrentSkill({
                      ...currentSkill,
                      proficiency: e.target.value as
                        | "Beginner"
                        | "Intermediate"
                        | "Advanced"
                        | "Expert",
                    })
                  }
                  className="mt-1 block w-full text-black rounded-md border border-gray-300 p-2"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSkillForm(false)}
                className="px-4 py-2 text-black rounded-md border  border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {currentSkill.id ? "Update" : "Add"} Skill
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Languages Section - LinkedIn Style */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">Languages</h2>
          <button
            type="button"
            onClick={() => {
              setCurrentLanguage({
                id: "",
                name: "",
                proficiency: "Professional Working",
              });
              setShowLanguageForm(true);
            }}
            className="px-2 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Language
          </button>
        </div>

        {/* Language entries */}
        {languageEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languageEntries.map((language) => (
              <div
                key={language.id}
                className="p-3 border rounded-md flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{language.name}</h3>
                  <p className="text-sm text-black-600">
                    {language.proficiency}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => editLanguage(language)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLanguage(language.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No languages added yet</p>
        )}

        {/* Language form */}
        {showLanguageForm && (
          <div className="p-4 border text-black rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">Language</label>
                <input
                  type="text"
                  value={currentLanguage.name}
                  onChange={(e) =>
                    setCurrentLanguage({
                      ...currentLanguage,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  placeholder="English, Spanish, French, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Proficiency</label>
                <select
                  value={currentLanguage.proficiency}
                  onChange={(e) =>
                    setCurrentLanguage({
                      ...currentLanguage,
                      proficiency: e.target.value as
                        | "Elementary"
                        | "Limited Working"
                        | "Professional Working"
                        | "Full Professional"
                        | "Native/Bilingual",
                    })
                  }
                  className="mt-1 block w-full text-black rounded-md border border-black-300 p-2"
                >
                  <option value="Elementary">Elementary</option>
                  <option value="Limited Working">Limited Working</option>
                  <option value="Professional Working">
                    Professional Working
                  </option>
                  <option value="Full Professional">Full Professional</option>
                  <option value="Native/Bilingual">Native</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowLanguageForm(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addLanguage}
                className="px-4 py-2 text-sm text-black rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {currentLanguage.id ? "Update" : "Add"} Language
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-black border-b pb-2">
          Additional Information
        </h2>
        <div>
          <label
            htmlFor="additional_info"
            className="block text-sm text-black font-medium"
          >
            Additional Details
          </label>
          <textarea
            id="additional_info"
            name="additional_info"
            rows={4}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="mt-1 block w-full text-black rounded-md border border-gray-300 p-2"
            placeholder="Any other information you'd like employers to know"
          />
        </div>
      </div>

      {/* Resume Upload */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Resume</h2>

        {profile?.resume_url && (
          <div className="flex items-center space-x-4 mb-4">
            <p>Current resume: </p>
            <a
              href={profile.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View current resume
            </a>
          </div>
        )}

        <div>
          <label htmlFor="resume" className="block text-sm font-medium">
            Upload Resume (PDF, DOC, DOCX)
          </label>
          <input
            type="file"
            id="resume"
            name="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
            className="mt-1 block w-full text-sm"
          />
          {resumeFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected file: {resumeFile.name}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}


