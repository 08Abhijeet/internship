import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, createContext, useEffect, useContext, useRef } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import AuthModal from "@/components/AuthModal";
import toast, { Toaster } from "react-hot-toast";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userState, setUserState] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState("IDLE");
  const [otpMethod, setOtpMethod] = useState("EMAIL");
  const [tempAuthData, setTempAuthData] = useState(null);

  const isLoginInProgress = useRef(false);

  const getUserRegion = async () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("Unknown");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://api.weatherapi.com/v1/current.json?key=037c82dcda5b4a53a81193032252512&q=${latitude},${longitude}`
            );
            const data = await res.json();
            resolve(data?.location?.region || "Unknown");
          } catch {
            resolve("Unknown");
          }
        },
        () => resolve("Unknown"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const isSouthIndianState = (region) => {
    const southStates = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"];
    return southStates.some((s) => region?.toLowerCase().includes(s.toLowerCase()));
  };

  const applyDynamicTheme = (region) => {
    const now = new Date();
    const currentHour = now.getHours(); 

    const isTimeMatch = currentHour >= 10 && currentHour < 12;

    const isLocationMatch = isSouthIndianState(region);

    const htmlRoot = document.documentElement;

    if (isTimeMatch && isLocationMatch) {
        htmlRoot.classList.remove("dark"); 
    } else {
        htmlRoot.classList.add("dark"); 
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (!firebaseuser) {
        setUser(null);
        localStorage.removeItem("user");
        
        document.documentElement.classList.add("dark");
        
        isLoginInProgress.current = false;
        return;
      }

      const stored = localStorage.getItem("user");
      if (stored && !isLoginInProgress.current) {
         const parsedUser = JSON.parse(stored);
         setUser(parsedUser);
         
         if (parsedUser.userState) {
             applyDynamicTheme(parsedUser.userState);
         }
      }

      if (firebaseuser.email && !isLoginInProgress.current) {
        try {
          const res = await axiosInstance.post("/user/get-user", { 
             email: firebaseuser.email 
          });
          
          if (res.data?.result) {
            setUser(res.data.result);
            localStorage.setItem("user", JSON.stringify(res.data.result));
            
            if (res.data.result.userState) {
                applyDynamicTheme(res.data.result.userState);
            }
          }
        } catch (error) {}
      }

      if (isLoginInProgress.current) {
        await handleLoginFlow(firebaseuser);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginFlow = async (firebaseuser) => {
    try {
      const toastId = toast.loading("Detecting Location...");
      const region = await getUserRegion();
      
      applyDynamicTheme(region);

      toast.dismiss(toastId);
      if (region !== "Unknown") {
          toast.success(`📍 Location Detected: ${region}`, { duration: 4000 });
      } else {
          toast.error("⚠️ Could not detect location");
      }

      setUserState(region);

      const authData = {
        email: firebaseuser.email,
        name: firebaseuser.displayName || "User",
        image: firebaseuser.photoURL,
        userState: region, 
      };
      setTempAuthData(authData);

      await new Promise(r => setTimeout(r, 1000));

      if (isSouthIndianState(region)) {
        await handleLoginRequest(authData, null);
      } else {
        setOtpMethod("PHONE");
        setModalStep("MOBILE_INPUT");
        setModalOpen(true);
      }
    } catch (err) {
      toast.error("Login failed");
      await signOut(auth);
    } finally {
      isLoginInProgress.current = false;
    }
  };

  const handleLoginRequest = async (authData, mobileNumber) => {
    try {
      const res = await axiosInstance.post("/user/login", {
        ...authData,
        mobile: mobileNumber,
      });

      if (res.data.requireOtp) {
        toast.success(`✅ OTP Sent to your ${res.data.otpMethod === "EMAIL" ? "Email" : "Phone"}`);
        setOtpMethod(res.data.otpMethod);
        setModalStep("OTP_INPUT");
        setModalOpen(true);
      } else {
        finalizeLogin(res.data.result);
      }
    } catch (error) {
      toast.error("Login/Signup failed");
      handleCancel();
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      const res = await axiosInstance.post("/user/verify-otp", {
        email: tempAuthData.email,
        otp,
      });
      finalizeLogin(res.data.result);
      toast.success("Login Successful!");
    } catch {
      toast.error("Invalid OTP");
    }
  };

  const onModalSubmit = async (value) => {
    if (modalStep === "MOBILE_INPUT") {
      await handleLoginRequest(tempAuthData, value);
    } else if (modalStep === "OTP_INPUT") {
      await handleVerifyOtp(value);
    }
  };

  const finalizeLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    if (userData.userState) {
        applyDynamicTheme(userData.userState);
    }

    setModalOpen(false);
    setTempAuthData(null);
  };

  const updateUser = (userData) => finalizeLogin(userData);
  
  const refreshUser = async () => {
      const email = user?.email || JSON.parse(localStorage.getItem("user"))?.email;
      if (!email) return;
      try {
         const res = await axiosInstance.post("/user/get-user", { email });
         if (res.data?.result) finalizeLogin(res.data.result);
      } catch(e) {}
  };

  const handleCancel = async () => {
    setModalOpen(false);
    setTempAuthData(null);
    await signOut(auth);
    document.documentElement.classList.add("dark");
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    await signOut(auth);
    setModalOpen(false);
    document.documentElement.classList.add("dark");
  };
  
  const handlegooglesignin = async () => {
    try {
      isLoginInProgress.current = true;
      await signInWithPopup(auth, provider);
    } catch {
      isLoginInProgress.current = false;
      toast.error("Google Sign In Failed");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
        const pUser = JSON.parse(saved);
        setUser(pUser);
        if(pUser.userState) applyDynamicTheme(pUser.userState);
    } else {
        document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ user, updateUser, refreshUser, logout, handlegooglesignin, userState }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <AuthModal
        isOpen={modalOpen}
        step={modalStep}
        method={otpMethod}
        onSubmit={onModalSubmit}
        onCancel={handleCancel}
      />
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);