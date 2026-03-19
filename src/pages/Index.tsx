import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import pmoLogo from "@/assets/pmo-logo.png";

const API_URL = "https://exp014.thirdfactor.ai/tfauth/get-kyc-url/";
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFuamVsaWthIFNhaCIsImlzcyI6IklaODM3MVFaNDAiLCJ0b2tlbiI6IjNJUlk2NjM4NE4iLCJpYXQiOjE1MTYyMzkwMjIsImlkZW50aWZpZXIiOiI2IiwibGFiZWwiOiJBbmplbGlrYSBTYWgiLCJzZWNvbmRhcnlfbGFiZWwiOiJhbmplbGlrYSIsImNhbGxiYWNrIjoiaHR0cHM6Ly93ZWJob29rLnNpdGUvMWFiNzM3ZTUtODBiMC00YTY4LTg0MTEtYzhkNWU2ZjU1Yjk5In0.TfGE4eUda1q2Gg1_T-3CBOg5RXzqzugwFfEIZ1aLDPA";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startVerification = async () => {
    setModalOpen(true);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt_token: SAMPLE_JWT }),
      });

      const data = await response.json();

      if (data.url) {
        setIframeSrc(data.url);
      } else {
        setError("Failed to get verification URL.");
      }
    } catch (err) {
      console.error("Failed to initialize KYC:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setIframeSrc("");
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

            {/* Mobile Frame */}
            <motion.div
              className="mobile-frame z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-primary rounded-b-2xl z-20" />

              {/* Loading / Error */}
              {(loading || error) && (
                <div className="absolute inset-0 bg-card flex flex-col items-center justify-center p-12 text-center z-10">
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
                        className="text-sm text-muted-foreground underline"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Iframe */}
              {iframeSrc && (
                <iframe
                  src={iframeSrc}
                  className="w-full h-full border-none"
                  allow="camera; microphone"
                  title="KYC Verification"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
