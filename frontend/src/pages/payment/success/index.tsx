import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (router.isReady && session_id) {
      verifyPayment();
    }
  }, [router.isReady, session_id]);

  const verifyPayment = async () => {
    try {
      const res = await axiosInstance.post("/payment/verify-session", {
        session_id: session_id,
      });

      if (res.data.success) {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (status === "verifying") {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-700">
          Finalizing your Premium upgrade...
        </h2>
        <p className="text-gray-500">Please do not close this window.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 text-center bg-green-50">
        <div className="bg-green-100 p-6 rounded-full">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            You are now Premium!
          </h1>
          <p className="text-lg text-gray-600">
            Enjoy unlimited downloads and ad-free watching.
          </p>
        </div>

        <Button
          onClick={() => (window.location.href = "/")}
          className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 h-auto"
        >
          Start Watching{" "}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-center">
      <XCircle className="w-16 h-16 text-red-500" />
      <h1 className="text-red-500 text-2xl font-bold">
        Payment Verification Failed
      </h1>
      <p className="text-gray-600">Please contact support or try again.</p>
      <Button onClick={() => router.push("/")} variant="outline">
        Go Home
      </Button>
    </div>
  );
}