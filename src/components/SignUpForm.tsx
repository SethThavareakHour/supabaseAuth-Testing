"use client";
import React, { useState } from "react";
import AuthButton from "./AuthButton";
import { signUp } from "../actions/auth";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    
    const result = await signUp(formData);

    if(result.status === "success") {
      // Store the email in localStorage before redirecting
      if (email) {
        localStorage.setItem('verificationEmail', email);
        
        // You can also redirect with the email as a query parameter for extra reliability
        router.push(`/verification?email=${encodeURIComponent(email)}`);
      } else {
        router.push("/verification");
      }
    }
    else {
      setError(result.status);
    }

    setLoading(false);
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200">
            First Name
          </label>
          <input
            type="text"
            placeholder="First Name"
            id="firstname"
            name="firstname"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Last Name"
            id="lastname"
            name="lastname"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            id="email"
            name="email"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Role
          </label>
          <select
            name="role"
            id="role"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            required
          >
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>
        <div className="mt-4">
          <AuthButton type="Sign up" loading={loading} />
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;