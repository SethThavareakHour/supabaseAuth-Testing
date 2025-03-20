// "use client"

// import { useState, useEffect } from "react"
// import { useForm } from "react-hook-form"
// import { updateForm, getStudentProfile, BasicForm, DetailForm } from "@/actions/student-form"

// type CombinedFormData = BasicForm & DetailForm

// export default function StudentFormEdit() {
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [formStatus, setFormStatus] = useState<{
//     status: "idle" | "success" | "error"
//     message?: string
//   }>({ status: "idle" })

//   const {
//     register,
//     handleSubmit,
//     reset,
//   } = useForm<CombinedFormData>()

//   // Load existing student data
//   useEffect(() => {
//     const loadProfileData = async () => {
//       try {
//         const result = await getStudentProfile()
        
//         if (result.status === "success") {
//           // Combine both data objects for the form
//           const formData = {
//             // Basic data
//             date_of_birth: result.basicData?.date_of_birth || "",
//             country: result.basicData?.country || "",
//             phone_number: result.basicData?.phone_number || "",
//             address: result.basicData?.address || "",
//             postal_code: result.basicData?.postal_code || "",
            
//             // Detail data
//             school_name: result.detailData?.school_name || "",
//             major: result.detailData?.major || "",
//             skills: result.detailData?.skills || "",
//             enrollment_date: result.detailData?.enrollment_date || "",
//             graduation_date: result.detailData?.graduation_date || "",
//             graduation_type: result.detailData?.graduation_type || "",
//             native_language: result.detailData?.native_language || "",
//             self_promotion: result.detailData?.self_promotion || "",
//             technical_promotion: result.detailData?.technical_promotion || "",
//             additional_info: result.detailData?.additional_info || ""
//           }
          
//           reset(formData)
//         } else {
//           setFormStatus({ 
//             status: "error", 
//             message: result.message || "Failed to load profile data" 
//           })
//         }
//       } catch (error) {
//         setFormStatus({ 
//           status: "error", 
//           message: error instanceof Error ? error.message : "An unknown error occurred" 
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     loadProfileData()
//   }, [reset])

//   const onSubmit = async (data: CombinedFormData) => {
//     setIsSubmitting(true)
//     setFormStatus({ status: "idle" })

//     try {
//       // Split data into basic and detail forms
//       const basicData: BasicForm = {
//         date_of_birth: data.date_of_birth,
//         country: data.country,
//         phone_number: data.phone_number,
//         address: data.address,
//         postal_code: data.postal_code
//       }

//       const detailData: DetailForm = {
//         school_name: data.school_name,
//         major: data.major,
//         skills: data.skills,
//         enrollment_date: data.enrollment_date,
//         graduation_date: data.graduation_date,
//         graduation_type: data.graduation_type,
//         native_language: data.native_language,
//         self_promotion: data.self_promotion,
//         technical_promotion: data.technical_promotion,
//         additional_info: data.additional_info
//       }

//       const result = await updateForm(basicData, detailData)
      
//       if (result.status === "success") {
//         setFormStatus({ 
//           status: "success", 
//           message: result.message || "Profile updated successfully!" 
//         })
//       } else {
//         setFormStatus({ 
//           status: "error", 
//           message: result.message || "Failed to update profile" 
//         })
//       }
//     } catch (error) {
//       setFormStatus({ 
//         status: "error", 
//         message: error instanceof Error ? error.message : "An unknown error occurred" 
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isLoading) {
//     return <div className="text-center py-10">Loading your profile data...</div>
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
//       <h2 className="text-2xl font-bold mb-6">Edit Student Profile</h2>
      
//       {formStatus.status === "success" && (
//         <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
//           {formStatus.message}
//         </div>
//       )}
      
//       {formStatus.status === "error" && (
//         <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
//           {formStatus.message}
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Basic Information Section */}
//         <div className="border-b pb-6">
//           <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="date_of_birth" className="block mb-1 font-medium">
//                 Date of Birth
//               </label>
//               <input
//                 id="date_of_birth"
//                 type="date"
//                 className="w-full p-2 border rounded"
//                 {...register("date_of_birth")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="country" className="block mb-1 font-medium">
//                 Country
//               </label>
//               <input
//                 id="country"
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 {...register("country")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="phone_number" className="block mb-1 font-medium">
//                 Phone Number
//               </label>
//               <input
//                 id="phone_number"
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 {...register("phone_number")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="postal_code" className="block mb-1 font-medium">
//                 Postal Code
//               </label>
//               <input
//                 id="postal_code"
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 {...register("postal_code")}
//               />
//             </div>
            
//             <div className="md:col-span-2">
//               <label htmlFor="address" className="block mb-1 font-medium">
//                 Address
//               </label>
//               <textarea
//                 id="address"
//                 rows={2}
//                 className="w-full p-2 border rounded"
//                 {...register("address")}
//               ></textarea>
//             </div>
//           </div>
//         </div>
        
//         {/* Detailed Information Section */}
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Detail Information</h3>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="school_name" className="block mb-1 font-medium">
//                 School Name
//               </label>
//               <input
//                 id="school_name"
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 {...register("school_name")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="major" className="block mb-1 font-medium">
//                 Major
//               </label>
//               <input
//                 id="major"
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 {...register("major")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="skills" className="block mb-1 font-medium">
//                 Skills
//               </label>
//               <input
//                 id="skills"
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 placeholder="Separate multiple skills with commas"
//                 {...register("skills")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="native_language" className="block mb-1 font-medium">
//                 Native Language
//               </label>
//               <input
//                 id="native_language"
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 {...register("native_language")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="enrollment_date" className="block mb-1 font-medium">
//                 Enrollment Date
//               </label>
//               <input
//                 id="enrollment_date"
//                 type="date"
//                 className="w-full p-2 border rounded"
//                 {...register("enrollment_date")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="graduation_date" className="block mb-1 font-medium">
//                 Graduation Date
//               </label>
//               <input
//                 id="graduation_date"
//                 type="date"
//                 className="w-full p-2 border rounded"
//                 {...register("graduation_date")}
//               />
//             </div>
            
//             <div>
//               <label htmlFor="graduation_type" className="block mb-1 font-medium">
//                 Graduation Type
//               </label>
//               <select
//                 id="graduation_type"
//                 className="w-full p-2 border rounded"
//                 {...register("graduation_type")}
//               >
//                 <option value="">Select graduation type</option>
//                 <option value="Bachelor">Bachelor</option>
//                 <option value="Master">Master</option>
//                 <option value="PhD">PhD</option>
//                 <option value="Diploma">Diploma</option>
//                 <option value="Certificate">Certificate</option>
//               </select>
//             </div>
//           </div>
          
//           <div className="mt-4 grid grid-cols-1 gap-4">
//             <div>
//               <label htmlFor="self_promotion" className="block mb-1 font-medium">
//                 Self Promotion
//               </label>
//               <textarea
//                 id="self_promotion"
//                 rows={3}
//                 className="w-full p-2 border rounded"
//                 placeholder="Tell us about yourself..."
//                 {...register("self_promotion")}
//               ></textarea>
//             </div>
            
//             <div>
//               <label htmlFor="technical_promotion" className="block mb-1 font-medium">
//                 Technical Skills
//               </label>
//               <textarea
//                 id="technical_promotion"
//                 rows={3}
//                 className="w-full p-2 border rounded"
//                 placeholder="Describe your technical skills..."
//                 {...register("technical_promotion")}
//               ></textarea>
//             </div>
            
//             <div>
//               <label htmlFor="additional_info" className="block mb-1 font-medium">
//                 Additional Information
//               </label>
//               <textarea
//                 id="additional_info"
//                 rows={3}
//                 className="w-full p-2 border rounded"
//                 placeholder="Any additional information..."
//                 {...register("additional_info")}
//               ></textarea>
//             </div>
//           </div>
//         </div>
        
//         <div>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
//               isSubmitting ? "opacity-70 cursor-not-allowed" : ""
//             }`}
//           >
//             {isSubmitting ? "Updating..." : "Update Profile"}
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { updateForm, getStudentProfile, BasicForm, DetailForm } from "@/actions/student-form"

type CombinedFormData = BasicForm & DetailForm

export default function StudentFormEdit() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    status: "idle" | "success" | "error"
    message?: string
  }>({ status: "idle" })

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<CombinedFormData>()

  // Load existing student data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const result = await getStudentProfile()
        
        if (result.status === "success") {
          // Combine both data objects for the form
          const formData = {
            // Basic data
            date_of_birth: result.basicData?.date_of_birth || "",
            country: result.basicData?.country || "",
            phone_number: result.basicData?.phone_number || "",
            address: result.basicData?.address || "",
            postal_code: result.basicData?.postal_code || "",
            
            // Detail data
            school_name: result.detailData?.school_name || "",
            major: result.detailData?.major || "",
            skills: result.detailData?.skills || "",
            enrollment_date: result.detailData?.enrollment_date || "",
            graduation_date: result.detailData?.graduation_date || "",
            graduation_type: result.detailData?.graduation_type || "",
            native_language: result.detailData?.native_language || "",
            self_promotion: result.detailData?.self_promotion || "",
            technical_promotion: result.detailData?.technical_promotion || "",
            additional_info: result.detailData?.additional_info || ""
          }
          
          reset(formData)
        } else {
          setFormStatus({ 
            status: "error", 
            message: result.message || "Failed to load profile data" 
          })
        }
      } catch (error) {
        setFormStatus({ 
          status: "error", 
          message: error instanceof Error ? error.message : "An unknown error occurred" 
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [reset])

  const onSubmit = async (data: CombinedFormData) => {
    setIsSubmitting(true)
    setFormStatus({ status: "idle" })

    try {
      // Split data into basic and detail forms
      const basicData: BasicForm = {
        date_of_birth: data.date_of_birth,
        country: data.country,
        phone_number: data.phone_number,
        address: data.address,
        postal_code: data.postal_code
      }

      const detailData: DetailForm = {
        school_name: data.school_name,
        major: data.major,
        skills: data.skills,
        enrollment_date: data.enrollment_date,
        graduation_date: data.graduation_date,
        graduation_type: data.graduation_type,
        native_language: data.native_language,
        self_promotion: data.self_promotion,
        technical_promotion: data.technical_promotion,
        additional_info: data.additional_info
      }

      const result = await updateForm(basicData, detailData)
      
      if (result.status === "success") {
        setFormStatus({ 
          status: "success", 
          message: result.message || "Profile updated successfully!" 
        })
      } else {
        setFormStatus({ 
          status: "error", 
          message: result.message || "Failed to update profile" 
        })
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

  if (isLoading) {
    return <div className="text-center py-10">Loading your profile data...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Edit Student Profile</h2>
      
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date_of_birth" className="block mb-1 font-medium">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                type="date"
                className="w-full p-2 border rounded text-black"
                {...register("date_of_birth")}
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block mb-1 font-medium">
                Country
              </label>
              <input
                id="country"
                type="text"
                className="w-full p-2 border rounded text-black"
                {...register("country")}
              />
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block mb-1 font-medium">
                Phone Number
              </label>
              <input
                id="phone_number"
                type="text"
                className="w-full p-2 border rounded text-black"
                {...register("phone_number")}
              />
            </div>
            
            <div>
              <label htmlFor="postal_code" className="block mb-1 font-medium">
                Postal Code
              </label>
              <input
                id="postal_code"
                type="text"
                className="w-full p-2 border rounded text-black"
                {...register("postal_code")}
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block mb-1 font-medium">
                Address
              </label>
              <textarea
                id="address"
                rows={2}
                className="w-full p-2 border rounded text-black"
                {...register("address")}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Detailed Information Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Detail Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="school_name" className="block mb-1 font-medium">
                School Name
              </label>
              <input
                id="school_name"
                type="text"
                className="w-full p-2 border rounded text-black"
                {...register("school_name")}
              />
            </div>
            
            <div>
              <label htmlFor="major" className="block mb-1 font-medium">
                Major
              </label>
              <input
                id="major"
                type="text"
                className="w-full p-2 border rounded text-black"
                {...register("major")}
              />
            </div>
            
            <div>
              <label htmlFor="skills" className="block mb-1 font-medium">
                Skills
              </label>
              <input
                id="skills"
                type="text"
                className="w-full p-2 border rounded text-black"
                placeholder="Separate multiple skills with commas"
                {...register("skills")}
              />
            </div>
            
            <div>
              <label htmlFor="native_language" className="block mb-1 font-medium">
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
              <label htmlFor="enrollment_date" className="block mb-1 font-medium">
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
              <label htmlFor="graduation_date" className="block mb-1 font-medium">
                Graduation Date
              </label>
              <input
                id="graduation_date"
                type="date"
                className="w-full p-2 border rounded text-black"
                {...register("graduation_date")}
              />
            </div>
            
            <div>
              <label htmlFor="graduation_type" className="block mb-1 font-medium">
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
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="self_promotion" className="block mb-1 font-medium">
                Self Promotion
              </label>
              <textarea
                id="self_promotion"
                rows={3}
                className="w-full p-2 border rounded text-black"
                placeholder="Tell us about yourself..."
                {...register("self_promotion")}
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="technical_promotion" className="block mb-1 font-medium">
                Technical Skills
              </label>
              <textarea
                id="technical_promotion"
                rows={3}
                className="w-full p-2 border rounded text-black"
                placeholder="Describe your technical skills..."
                {...register("technical_promotion")}
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="additional_info" className="block mb-1 font-medium">
                Additional Information
              </label>
              <textarea
                id="additional_info"
                rows={3}
                className="w-full p-2 border rounded text-black"
                placeholder="Any additional information..."
                {...register("additional_info")}
              ></textarea>
            </div>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  )
}