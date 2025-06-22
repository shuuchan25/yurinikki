// components/ExportPreview.tsx
"use client";
import React, { forwardRef, useImperativeHandle, useRef } from "react";

export interface ExportPreviewProps {
  children: React.ReactNode;
  width?: number;
  bgColor?: string;
}

const ExportPreview = forwardRef<
  HTMLDivElement,
  ExportPreviewProps & { style?: React.CSSProperties }
>(({ children, width = 1920, bgColor = "#1d293d", style = {} }, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => innerRef.current!);
  return (
    <div
      ref={innerRef}
      className="text-[#f9fafb] p-8"
      style={{
        position: "absolute",
        left: 0,
        // top: "100vh", // di bawah layar
        opacity: 1,
        pointerEvents: "none",
        display: "block",
        backgroundColor: bgColor,
        width: `${width}px`,
        fontFamily: "sans-serif",
        // zIndex: -9999,
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export default ExportPreview;
