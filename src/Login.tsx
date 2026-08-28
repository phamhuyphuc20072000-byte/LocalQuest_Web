import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface LoginProps {
  onSuccess?: (role: string, email?: string) => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const handleGoogleSignIn = async () => {
    console.log("[DEBUG] Login.jsx handleGoogleSignIn clicked");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("[DEBUG] Login.jsx Đăng nhập thành công:", result.user);
      if (onSuccess) {
        onSuccess("tourist", result.user.email || undefined);
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("[DEBUG] Login.jsx Lỗi đăng nhập:", error);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <button 
        onClick={handleGoogleSignIn}
        style={{ padding: "10px 20px", cursor: "pointer", borderRadius: "8px", background: "#1C4A32", color: "#FFF", fontWeight: 600 }}
      >
        Đăng nhập với Google
      </button>
    </div>
  );
}
