import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowRight, ShieldCheck, Mail, Phone, Loader2 } from 'lucide-react';
import OtpInput from './OtpInput';
import { useRequestOtpMutation, useVerifyOtpMutation } from '../hooks/useLoginMutation';
import { OtpRequestSchema, OtpRequestType } from '../types';

export default function LoginPage() {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [identifier, setIdentifier] = useState('');
  const [maskedDestination, setMaskedDestination] = useState('');

  const requestOtpMutation = useRequestOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpRequestType>({
    resolver: zodResolver(OtpRequestSchema),
  });

  const onSubmitRequest = (data: OtpRequestType) => {
    requestOtpMutation.mutate(data, {
      onSuccess: (response) => {
        setIdentifier(data.identifier);
        setMaskedDestination(response.maskedDestination);
        setStep('verify');
      },
    });
  };

  const handleOtpComplete = (otp: string) => {
    verifyOtpMutation.mutate({ identifier, otp });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Enhanced Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-govos-blue/20 blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-govos-green/20 blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      
      {/* Grid overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md p-10 bg-card/40 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-16 h-16 bg-gradient-to-br from-govos-blue to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-govos-blue/30 border border-white/20"
          >
            <Building2 className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">GovOS Engine</h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium tracking-wide uppercase text-govos-blue/80">Multi-Tenant Civic Governance</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'request' ? (
            <motion.div
              key="request"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Phone or Email</label>
                  <div className="relative group">
                    <input
                      {...register('identifier')}
                      type="text"
                      className="w-full h-12 pl-12 pr-4 bg-black/20 border border-white/10 rounded-xl focus:border-govos-blue focus:ring-2 focus:ring-govos-blue/50 outline-none transition-all hover:bg-black/30 placeholder:text-gray-500 text-white shadow-inner"
                      placeholder="e.g. +919876543210"
                      disabled={requestOtpMutation.isPending}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-govos-blue transition-colors">
                      <Mail size={18} />
                    </div>
                  </div>
                  {errors.identifier && (
                    <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
                  )}
                  {requestOtpMutation.isError && (
                    <p className="text-red-500 text-xs mt-2 p-2 bg-red-500/10 rounded-md border border-red-500/20">
                      {(requestOtpMutation.error as any).response?.data?.message || 'Login failed'}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-govos-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl font-semibold flex items-center justify-center transition-all disabled:opacity-50 group shadow-lg shadow-govos-blue/25 mt-6 border border-white/10"
                >
                  {requestOtpMutation.isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Send Secure OTP
                      <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="text-green-500" size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">Verification Required</h2>
              <p className="text-center text-muted-foreground text-sm mb-6">
                Enter the 6-digit code sent to <br />
                <span className="font-semibold text-foreground">{maskedDestination}</span>
              </p>

              <OtpInput 
                length={6} 
                onComplete={handleOtpComplete} 
                isLoading={verifyOtpMutation.isPending} 
              />

              {verifyOtpMutation.isError && (
                <p className="text-red-500 text-xs mt-4 p-2 bg-red-500/10 rounded-md border border-red-500/20 w-full text-center">
                  {(verifyOtpMutation.error as any).response?.data?.message || 'Invalid OTP'}
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-border w-full flex justify-between items-center text-sm">
                <button
                  onClick={() => setStep('request')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change account
                </button>
                <button
                  onClick={() => onSubmitRequest({ identifier })}
                  disabled={requestOtpMutation.isPending}
                  className="text-govos-blue hover:underline font-medium"
                >
                  Resend code
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Prajna Labs × Cascade Technologies Solutions.</p>
        <p>GovOS is restricted to authorized government personnel only.</p>
      </div>
    </div>
  );
}
