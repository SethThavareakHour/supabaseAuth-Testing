"use client"

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import AuthButton from './AuthButton';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// const OtpVerification = () => {
//   const [otp, setOtp] = useState('');
//   const router = useRouter();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [email, setEmail] = useState(''); // Store the user's email
  
//   // Initialize Supabase client
//   const supabase = createClientComponentClient();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
    
//     if (!email) {
//       setError('Email is required for verification');
//       setLoading(false);
//       return;
//     }
    
//     try {
//       // Verify the user with the 6-digit OTP they entered
//       const { error } = await supabase.auth.verifyOtp({
//         email,
//         token: otp,
//         type: "signup" // Using 'signup' instead of 'email' for registration verification
//       });
      
//       if (error) {
//         throw error;
//       }
      
//       // Successfully verified, redirect to desired page
//       router.push('/'); // or whatever page you want users to go after verification
      
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message || 'Failed to verify OTP');
//       } else {
//         setError('Failed to verify OTP');
//       }
//       console.error('Verification error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-200">
//             Email Address
//           </label>
//           <input
//             type="email"
//             placeholder="Your email address"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-200">
//             Verification Code
//           </label>
//           <input
//             type="text"
//             placeholder="Enter 6-digit code"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             maxLength={6}
//             pattern="[0-9]{6}"
//             className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
//             required
//           />
//         </div>

//         <div className="mt-4">
//           <AuthButton type="Verify User Registration" loading={loading} />
//         </div>
//         {error && <p className="text-red-500">{error}</p>}
//       </form>
//     </div>
//   );
// };

// export default OtpVerification;


"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthButton from './AuthButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  
  // Initialize Supabase client
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get email from query parameters or localStorage
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = typeof window !== 'undefined' ? localStorage.getItem('verificationEmail') : null;
    
    if (emailFromParams) {
      setEmail(emailFromParams);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!email) {
      setError('Email not found. Please return to signup page.');
      setLoading(false);
      return;
    }
    
    try {
      // Verify the user with the 6-digit OTP they entered
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup" // Using 'signup' instead of 'email' for registration verification
      });
      
      if (error) {
        throw error;
      }
      
      // Successfully verified, clean up and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('verificationEmail');
      }
      
      router.push('/'); // or whatever page you want users to go after verification
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to verify OTP');
      } else {
        setError('Failed to verify OTP');
      }
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {email && (
          <p className="text-sm text-gray-200">
            Verifying for: <strong>{email}</strong>
          </p>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Verification Code
          </label>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            pattern="[0-9]{6}"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            required
            autoFocus
          />
        </div>

        <div className="mt-4">
          <AuthButton type="Verify User Registration" loading={loading} />
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default OtpVerification;