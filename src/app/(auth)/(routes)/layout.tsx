import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#245db0] flex p-2.5 items-center justify-center">
      {children}
    </div>
  );
}