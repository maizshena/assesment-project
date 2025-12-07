import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
      {children}
    </div>
  );
}


