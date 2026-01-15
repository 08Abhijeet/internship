import React, { useState, FormEvent } from "react";
import { Loader2, Lock, Phone } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  step: "IDLE" | "MOBILE_INPUT" | "OTP_INPUT";
  method: string;
  onSubmit: (val: string) => Promise<void> | void;
  onCancel: () => void;
}

export default function AuthModal({ isOpen, step, onSubmit, onCancel, method }: AuthModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError("Required");
      return;
    }
    setError("");
    setIsLoading(true);
    await onSubmit(inputValue);
    setIsLoading(false);
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md p-6 bg-black border border-white rounded-xl shadow-lg animate-in zoom-in-95">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 mb-4 border rounded-full border-white/20 bg-white/5">
            {step === "MOBILE_INPUT" ? <Phone className="w-8 h-8 text-white"/> : <Lock className="w-8 h-8 text-white"/>}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {step === "MOBILE_INPUT" ? "Security Check" : "Verify Identity"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {step === "MOBILE_INPUT" 
              ? "Logging in from a new region. Enter mobile number." 
              : `Enter code sent to your ${method === "MOBILE" ? "Phone" : "Email"}`
            }
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type={step === "MOBILE_INPUT" ? "tel" : "text"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={step === "MOBILE_INPUT" ? "+91 99999 99999" : "123456"}
            className="w-full px-4 py-3 text-white bg-black border border-white rounded-lg focus:ring-2 focus:ring-white"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-2 bg-white text-black font-bold rounded-lg flex justify-center items-center gap-2">
            {isLoading && <Loader2 className="animate-spin w-4 h-4"/>}
            {step === "MOBILE_INPUT" ? "Send OTP" : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}