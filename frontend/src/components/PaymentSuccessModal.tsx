"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosinstance";
import confetti from "canvas-confetti";
import { useRouter } from "next/router";

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  sessionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (isOpen && sessionId && status === "verifying") {
      verifyPayment();
    }
  }, [isOpen, sessionId]);

  const verifyPayment = async () => {
    try {
      const res = await axiosInstance.post("/payment/verify-session", {
        session_id: sessionId,
      });

      if (res.data.success) {
        setStatus("success");
        
    
        const updatedUser = res.data.result;

        
        const currentStorage = JSON.parse(localStorage.getItem("Profile") || "{}");
        
       
        localStorage.setItem("Profile", JSON.stringify({
           ...currentStorage,
           result: updatedUser 
        }));
       
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleClose = () => {

    window.location.href = window.location.pathname;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md text-center p-8">
        
        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-700">Finalizing upgrade...</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You are now Premium!</h1>
              <p className="text-gray-600">Refreshed and ready to download.</p>
            </div>
            
            <Button 
              onClick={handleClose} 
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            >
              Start Watching <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {status === "error" && (
           <div className="flex flex-col items-center justify-center gap-4 py-4">
             <XCircle className="w-16 h-16 text-red-500" />
             <h1 className="text-red-500 text-xl font-bold">Verification Failed</h1>
             <Button onClick={onClose} variant="outline" className="mt-2">Close</Button>
           </div>
        )}

      </DialogContent>
    </Dialog>
  );
}