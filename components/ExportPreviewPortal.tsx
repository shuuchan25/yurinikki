import React, { useEffect, useRef, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";

interface ExportPreviewPortalProps {
  children: ReactNode;
  elRef?: RefObject<HTMLDivElement | null>; // <-- Perhatikan disini!
  visible?: boolean;
}

export default function ExportPreviewPortal({
  children,
  elRef,
  visible = false,
}: ExportPreviewPortalProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      ref.current = document.createElement("div");
      document.body.appendChild(ref.current);
    }
    return () => {
      if (ref.current) document.body.removeChild(ref.current);
    };
  }, []);

  useEffect(() => {
    if (elRef) elRef.current = ref.current;
  }, [elRef]);

  return ref.current
    ? createPortal(
        <div
          style={{
            opacity: visible ? 1 : 0,
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            left: 0,
            width: "1920px",
            background: "#1d293d",
            zIndex: -9999,
          }}
        >
          {children}
        </div>,
        ref.current
      )
    : null;
}
