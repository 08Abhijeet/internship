"use client";

import { useState } from "react";
import { Check, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function PremiumModal({ isOpen, onClose, videoId }: any) {
  const { user } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const plans = [
    {
      name: "Bronze",
      price: 50, 
      limit: "7 Mins Watch Time",
      features: ["Unlimited Downloads", "7 Mins Watch Limit", "Ad-supported"],
      color: "bg-orange-50 border-orange-200",
    },
    {
      name: "Silver",
      price: 150, 
      limit: "10 Mins Watch Time",
      features: ["Unlimited Downloads", "10 Mins Watch Limit", "HD Quality"],
      color: "bg-gray-50 border-gray-300",
    },
    {
      name: "Gold",
      price: 500,
      limit: "Unlimited Watch Time",
      features: ["Unlimited Downloads", "Unlimited Watching", "4K Quality"],
      color: "bg-yellow-50 border-yellow-300",
    },
  ];

  const handleCheckout = async (plan: any) => {
    if (!user) return alert("Please login first");
    setLoadingPlan(plan.name);

    try {
      const { data } = await axiosInstance.post("/payment/create-checkout-session", {
        planName: plan.name,
        price: plan.price,
        userId: user._id,
        videoId: videoId,
      });

      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
            <Crown className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl text-center font-bold">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-center mb-6">
            Choose a plan to extend your watch time and unlock downloads.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border-2 rounded-xl p-6 flex flex-col hover:scale-105 transition-transform ${plan.color}`}
            >
              <h3 className="text-lg font-bold uppercase tracking-wide">{plan.name}</h3>
              <div className="text-3xl font-bold mt-2 mb-4">₹{plan.price}</div>
              
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm font-medium">
                    <Check className="w-4 h-4 text-green-600" /> {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(plan)}
                disabled={loadingPlan !== null}
                className="w-full font-bold"
              >
                {loadingPlan === plan.name ? <Loader2 className="animate-spin" /> : `Get ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}