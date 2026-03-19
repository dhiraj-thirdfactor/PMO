import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import pmoLogo from "@/assets/pmo-logo.png";

const API_URL = "/api/kyc";
const JWT_SECRET = "TWU58J51XSAVFUERHAVFUER3IRY66384NMEMMEM";

const generateJWT = async () => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "1234567890",
    name: "Dhiraj Chapagain",
    iss: "IZ8371QZ40",
    token: "7dYMlo8JEbihSSUQBYDOm7ycFWBTU6Vk0sogWmV_6oM",
    iat: Math.floor(Date.now() / 1000), // Keeping this dynamic to prevent expiration bugs, but let me know if it must strictly be 1516239022
    identifier: "1715",
    label: "Dhiraj Chapagain",
    secondary_label: "dhiraj",
    callback: "https://webhook.site/833d0176-1d47-465c-ab9c-618dc966b558"
  };

  const base64UrlEncode = (str: string) => {
    const bytes = new TextEncoder().encode(str);
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );

  const signatureBytes = new Uint8Array(signatureBuffer);
  const signatureB64 = btoa(String.fromCharCode(...signatureBytes))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const finalJwt = `${headerB64}.${payloadB64}.${signatureB64}`;
  console.log("Generated JWT Payload:", payload);
  console.log("Generated JWT Token String:", finalJwt);
  
  return finalJwt;
};

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startVerification = async () => {
    setModalOpen(true);
    setLoading(true);
    setError("");

    try {
      console.log("Starting verification process...");
      const jwt_token = await generateJWT();
      
      console.log("Sending POST request to:", API_URL);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token }),
      });

      console.log("Response Status:", response.status);
      
      const responseText = await response.text();
      console.log("Raw Response Text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed Response JSON:", data);
      } catch (e) {
        console.error("Failed to parse response as JSON", e);
      }

      if (data && data.url) {
        // Since the provider isn't desktop responsive and blocks iframes,
        // we can open it in a strictly mobile-sized popup window!
        const width = 400;
        const height = 800;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.url,
          "KYC_Verification",
          `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=no,resizable=no,status=no`
        );

        if (!popup) {
          // If popup blocker prevents it, fallback to redirect
          window.location.href = data.url;
        } else {
          // Keep showing looking or success state
          setLoading(false);
          setModalOpen(false);
        }
      } else {
        setError(`Failed to get verification URL. ${data?.error || ''}`);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to initialize KYC:", err);
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Logo */}
      <div className="mb-12 flex flex-col items-center">
        <img
          src={pmoLogo}
          alt="Government of Nepal Emblem"
          className="w-28 h-28 object-contain mb-6"
        />
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Identity Verification
        </h1>
        <p className="text-muted-foreground mt-2 text-center max-w-xs">
          Secure liveness detection powered by{" "}
          <span className="text-foreground font-medium">Thirdfactor AI</span>
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={startVerification}
        className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium transition-all hover:opacity-90 active:scale-95 shadow-xl"
      >
        <span className="flex items-center gap-3">
          <Shield className="w-5 h-5" />
          Prove Liveness
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Simple centered card */}
            <motion.div
              className="z-10 bg-card rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 max-w-sm w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {(loading || error) && (
                <div className="flex flex-col items-center text-center">
                  {loading && (
                    <>
                      <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin mb-4" />
                      <p className="text-sm font-medium text-foreground">
                        Initializing Secure Session...
                      </p>
                    </>
                  )}
                  {error && (
                    <>
                      <p className="text-sm font-medium text-destructive mb-4">
                        {error}
                      </p>
                      <button
                        onClick={closeModal}
                        className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
