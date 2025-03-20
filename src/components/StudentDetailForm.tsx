"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { studentDetailForm, DetailForm } from "@/actions/student-form"

export default function StudentDetailForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    status: "idle" | "success" | "error"
    message?: string
  }>({ status: "idle" })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<DetailForm>()

  const onSubmit = async (data: DetailForm) => {
    setIsSubmitting(true)
    setFormStatus({ status: "idle" })

    try {
      const result = await studentDetailForm(data)
      
      if (result.status === "success") {
        setFormStatus({ status: "success", message: "Student details submitted successfully!" })
        reset()
      } else {
        setFormStatus({ status: "error", message: result.message })
      }
    } catch (error) {
      setFormStatus({ 
        status: "error", 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Student Details</h2>
        
        {formStatus.status === "success" && (
            <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
            {formStatus.message}
            </div>
        )}
        
        {formStatus.status === "error" && (
            <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
            {formStatus.message}
            </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-black">
            <div>
            <label htmlFor="school_name" className="block mb-1 font-medium text-black">
                School Name
            </label>
            <input
                id="school_name"
                type="text"
                className="w-full p-2 border rounded text-black"
                {...register("school_name", { required: "School name is required" })}
            />
            {errors.school_name && (
                <p className="mt-1 text-sm text-red-600">{errors.school_name.message}</p>
            )}
            </div>

            <div>
            <label htmlFor="major" className="block mb-1 font-medium text-black">
                Major
            </label>
            <input
                id="major"
                type="text"
                className="w-full p-2 border rounded text-black"
                {...register("major", { required: "Major is required" })}
            />
            {errors.major && (
                <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>
            )}
            </div>

            <div>
            <label htmlFor="skill" className="block mb-1 font-medium text-black">
                Skills
            </label>
            <input
                id="skill"
                type="text"
                className="w-full p-2 border rounded text-black"
                placeholder="Separate multiple skills with commas"
                {...register("skills")}
            />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="enrollment_date" className="block mb-1 font-medium text-black">
                Enrollment Date
                </label>
                <input
                id="enrollment_date"
                type="date"
                className="w-full p-2 border rounded text-black"
                {...register("enrollment_date")}
                />
            </div>

            <div>
                <label htmlFor="graduation_date" className="block mb-1 font-medium text-black">
                Graduation Date
                </label>
                <input
                id="graduation_date"
                type="date"
                className="w-full p-2 border rounded text-black"
                {...register("graduation_date")}
                />
            </div>
            </div>

            <div>
            <label htmlFor="graduation_type" className="block mb-1 font-medium text-black">
                Graduation Type
            </label>
            <select
                id="graduation_type"
                className="w-full p-2 border rounded text-black"
                {...register("graduation_type")}
            >
                <option value="">Select graduation type</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
            </select>
            </div>

            <div>
            <label htmlFor="native_language" className="block mb-1 font-medium text-black">
                Native Language
            </label>
            <input
                id="native_language"
                type="text"
                className="w-full p-2 border rounded text-black"
                {...register("native_language")}
            />
            </div>

            <div>
            <label htmlFor="self_promotion" className="block mb-1 font-medium text-black">
                Self Promotion
            </label>
            <textarea
                id="self_promotion"
                rows={3}
                className="w-full p-2 border rounded text-black"
                placeholder="Tell us about yourself..."
                {...register("self_promotion")}
            />
            </div>

            <div>
            <label htmlFor="technical_promotion" className="block mb-1 font-medium text-black">
                Technical Skills
            </label>
            <textarea
                id="technical_promotion"
                rows={3}
                className="w-full p-2 border rounded text-black"
                placeholder="Describe your technical skills..."
                {...register("technical_promotion")}
            />
            </div>

            <div>
            <label htmlFor="additional_info" className="block mb-1 font-medium text-black">
                Additional Information
            </label>
            <textarea
                id="additional_info"
                rows={3}
                className="w-full p-2 border rounded text-black"
                placeholder="Any additional information you'd like to share..."
                {...register("additional_info")}
            />
            </div>

            <div>
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
                {isSubmitting ? "Submitting..." : "Submit Details"}
            </button>
            </div>
        </form>
        </div>
    )
}