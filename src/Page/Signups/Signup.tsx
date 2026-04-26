import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
// @ts-ignore
import { auth } from "../../../firebase.js";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Password strength ─── */
const getStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "", color: "" };
  if (pw.length < 6) return { score: 1, label: "Weak", color: "#ef4444" };
  if (pw.length < 10) return { score: 2, label: "Fair", color: "#f59e0b" };
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw))
    return { score: 4, label: "Strong", color: "#22c55e" };
  return { score: 3, label: "Good", color: "#3b82f6" };
};

/* ─── Floating label input ─── */
function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  right,
  delay,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
  delay: number;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <div
        className={`relative rounded-xl border transition-all duration-200 ${
          focused
            ? "border-white/40 shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
            : "border-white/10"
        } bg-white/[0.04]`}
      >
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none select-none ${
            lifted
              ? "top-2 text-[10px] font-semibold tracking-widest uppercase text-white/60"
              : "top-1/2 -translate-y-1/2 text-sm text-white/40"
          }`}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-transparent outline-none text-white text-sm px-4 pb-3 pr-${right ? "10" : "4"} ${
            lifted ? "pt-6" : "pt-4 pb-4"
          } transition-all duration-200`}
          style={{ paddingRight: right ? "2.75rem" : undefined }}
        />
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
    </motion.div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      toast.success(`Welcome, ${result.user.displayName}!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    // if (password.length < 6) {
    //   toast.error("Password must be at least 6 characters ");
    //   return;
    // }
    if (!accepted) {
      toast.error("Please accept the terms & privacy policy");
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      toast.success("Account created successfully!");
      navigate("/");  
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex">

      {/* ── One purple ambient blob ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[-15%] left-[-5%] w-[650px] h-[650px] rounded-full bg-violet-600 opacity-[0.18] blur-[140px]"
          animate={{ x: [0, 25, 0], y: [0, -18, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Dot grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Left panel: Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative z-10 p-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Togo</span>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div>
            <p className="text-white/30 text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              Your focus, amplified
            </p>
            <h2 className="text-white text-4xl font-bold leading-tight">
              Build habits.<br />
              Close loops.<br />
              <span className="text-white/50">
                Move forward.
              </span>
            </h2>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {[
              "Daily task tracking",
              "Long-term project goals",
              "Smart progress insights",
            ].map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <span className="text-white/50 text-sm">{feat}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="border border-white/8 bg-white/[0.03] rounded-2xl p-5 backdrop-blur-sm"
        >
          <p className="text-white/60 text-sm leading-relaxed italic">
            "Togo completely changed how I approach my day. It's the only app I open first thing every morning."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20" />
            <div>
              <p className="text-white/80 text-xs font-semibold">Alex Chen</p>
              <p className="text-white/30 text-xs">Product Designer</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right panel: Form ── */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Glass card */}
          <div className="rounded-2xl border border-white/[0.10] bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/80 p-8 flex flex-col gap-5">

            {/* Header */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
              <p className="text-sm text-white/40 mt-1">Start for free. No credit card needed.</p>
            </motion.div>

            {/* Google button */}
            <motion.button
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignup}
              className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/80 text-sm font-medium transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </motion.button>

            {/* Divider */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-white/25 text-xs">or sign up with email</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </motion.div>

            {/* Name */}
            <FloatingInput
              id="name" label="Full Name"
              value={name} onChange={setName} delay={3}
            />

            {/* Email */}
            <FloatingInput
              id="email" label="Email Address" type="email"
              value={email} onChange={setEmail} delay={4}
            />

            {/* Password */}
            <FloatingInput
              id="password" label="Password"
              type={showPassword ? "text" : "password"}
              value={password} onChange={setPassword} delay={5}
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Password strength */}
            <AnimatePresence>
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: -8 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 -mt-3"
                >
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="h-[3px] flex-1 rounded-full"
                        animate={{ backgroundColor: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)" }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                  <motion.span
                    key={strength.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[11px] font-medium w-12 text-right"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terms */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="flex items-start gap-2.5">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(!!v)}
                className="mt-0.5 border-white/20 data-[state=checked]:bg-white data-[state=checked]:border-white"
              />
              <label htmlFor="terms" className="text-xs text-white/40 leading-relaxed cursor-pointer select-none">
                I agree to the{" "}
                <span className="text-white/60 hover:text-white transition-colors cursor-pointer underline underline-offset-2">
                  Terms of Service
                </span>{" "}and{" "}
                <span className="text-white/60 hover:text-white transition-colors cursor-pointer underline underline-offset-2">
                  Privacy Policy
                </span>
              </label>
            </motion.div>

            {/* Submit */}
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
              <motion.button
                onClick={handleSignup}
                whileHover={{ scale: 1.01, boxShadow: "0 8px 30px rgba(255,255,255,0.10)" }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className="relative w-full py-3 rounded-xl font-semibold text-sm text-black cursor-pointer overflow-hidden
                  bg-white hover:bg-white/90
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating account…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Get started
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            {/* Login link */}
            <motion.p custom={8} variants={fadeUp} initial="hidden" animate="visible" className="text-center text-xs text-white/30">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-white/60 hover:text-white font-medium transition-colors"
              >
                Sign in
              </Link>
            </motion.p>

          </div>
        </motion.div>
      </div>

    </div>
  );
}
