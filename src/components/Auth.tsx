import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, KeyRound } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!showOtpInput && email) {
        await signIn(email);
        setShowOtpInput(true);
      } else if (showOtpInput && otpCode) {
        await signIn(email, otpCode);
      }
    } catch (error) {
      // Error handling is done in the AuthContext
    }
  };

  const handleBack = () => {
    setShowOtpInput(false);
    setOtpCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2b2e4a]/10 to-[#e84545]/10 dark:from-[#2b2e4a]/5 dark:to-[#e84545]/5 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://artwebin.com/media/2024/12/TaskNook_logo_icon__192.png" 
            alt="TaskNook Logo" 
            className="h-14 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to TaskNook
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {showOtpInput ? 'Enter the code sent to your email' : 'Sign in with your email to continue'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor={showOtpInput ? "otp" : "email"}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {showOtpInput ? 'Verification Code' : 'Email address'}
              </label>
              <div className="relative">
                {showOtpInput ? (
                  <>
                    <input
                      id="otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter verification code"
                      className="w-full pl-10 pr-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 gradient-border"
                      required
                    />
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </>
                ) : (
                  <>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 gradient-border"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </>
                )}
              </div>
            </div>

            {showOtpInput && (
              <button
                type="button"
                onClick={handleBack}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Back to email input
              </button>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 bg-brand-gradient text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={showOtpInput ? !otpCode.trim() : !email.trim()}
            >
              {showOtpInput ? 'Verify Code' : 'Send Code'}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            {showOtpInput 
              ? "Didn't receive the code? Check your spam folder" 
              : "We'll send you a verification code to sign in"}
          </p>
        </div>
      </div>
    </div>
  );
}