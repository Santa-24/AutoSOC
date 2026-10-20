"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  impactWarning: string;
  targetResource: string;
  proposedAction: string;
  isExecuting?: boolean;
  confirmLabel?: string;
  requiresCheckbox?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  impactWarning,
  targetResource,
  proposedAction,
  isExecuting = false,
  confirmLabel = "AUTHORIZE & EXECUTE REMEDIATION",
  requiresCheckbox = true,
}: ConfirmationModalProps) {
  const [hasAcknowledged, setHasAcknowledged] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isExecuting) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      setHasAcknowledged(false);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isExecuting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-charcoal-900 border-2 border-charcoal-700 p-6 md:p-8 relative shadow-2xl space-y-6"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-charcoal-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3D1414] border border-[#6E2222] text-[#FF6666]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#FF823C] uppercase">
                High-Impact Safeguard Gate
              </span>
              <h2 id="modal-title" className="text-lg md:text-xl font-bold text-ivory-100 font-mono">
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="text-ivory-400 hover:text-ivory-100 p-1 hover:bg-charcoal-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Impact Warning Banner */}
        <div className="p-4 bg-[#291313] border-l-4 border-[#FF4747] text-[#FFB3B3] text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[#FF6666]">
            <AlertTriangle className="w-4 h-4 text-[#FF4747]" />
            CRITICAL SERVICE IMPACT WARNING
          </div>
          <p className="leading-relaxed">{impactWarning}</p>
        </div>

        {/* Action Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-charcoal-850 border border-charcoal-700">
            <span className="text-ivory-400 block text-[10px] tracking-wider mb-1">
              TARGET RESOURCE
            </span>
            <span className="text-lime-400 font-bold break-all">{targetResource}</span>
          </div>
          <div className="p-3 bg-charcoal-850 border border-charcoal-700">
            <span className="text-ivory-400 block text-[10px] tracking-wider mb-1">
              PROPOSED AWS API MUTATION
            </span>
            <span className="text-ivory-200 font-medium break-all">{proposedAction}</span>
          </div>
        </div>

        {/* Checkbox Acknowledgment */}
        {requiresCheckbox && (
          <label className="flex items-start gap-3 p-3 bg-charcoal-850 border border-charcoal-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              disabled={isExecuting}
              className="mt-1 h-4 w-4 rounded-none accent-lime-500 bg-charcoal-900 border-charcoal-600 focus:ring-0"
            />
            <span className="text-xs font-mono text-ivory-200 leading-relaxed">
              I certify that I am an authorized Cloud Security Analyst. I have reviewed the dry-run blast radius and authorize this response action. An immutable audit record will be logged with my credentials.
            </span>
          </label>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-charcoal-700">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isExecuting}
            className="w-full sm:w-auto"
          >
            CANCEL / ABORT
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isExecuting}
            disabled={requiresCheckbox && !hasAcknowledged}
            className="w-full sm:w-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
