// components/PresentationWrapper.js
"use client";

import { PresentationProvider } from "@/context/PresentationContext";

export default function PresentationWrapper({ children }) {
  return (
    <PresentationProvider>
      {children}
    </PresentationProvider>
  );
}
