import React, { useEffect, useMemo, useRef } from "react";

const INVITE_CODE_SEGMENT_LENGTHS = [2, 4, 4] as const;
const INVITE_CODE_TOTAL_LENGTH = INVITE_CODE_SEGMENT_LENGTHS.reduce((sum, length) => sum + length, 0);

function normalizeInviteCode(value: string): string {
  return value.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, INVITE_CODE_TOTAL_LENGTH);
}

function formatInviteCode(value: string): string {
  const normalized = normalizeInviteCode(value);
  const first = normalized.slice(0, 2);
  const second = normalized.slice(2, 6);
  const third = normalized.slice(6, 10);

  if (!normalized) return "";
  if (normalized.length <= 2) return first;
  if (normalized.length <= 6) return `${first}-${second}`;
  return `${first}-${second}-${third}`;
}

function splitInviteCode(value: string): string[] {
  return normalizeInviteCode(value)
    .padEnd(INVITE_CODE_TOTAL_LENGTH, " ")
    .split("");
}

export function isInviteCodeComplete(value: string): boolean {
  return normalizeInviteCode(value).length === INVITE_CODE_TOTAL_LENGTH;
}

interface InviteCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function InviteCodeInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
}: InviteCodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = useMemo(() => splitInviteCode(value), [value]);

  useEffect(() => {
    if (autoFocus && !disabled) {
      refs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const commitChars = (nextChars: string[]) => {
    onChange(formatInviteCode(nextChars.join("")));
  };

  const focusIndex = (index: number) => {
    refs.current[index]?.focus();
    refs.current[index]?.select();
  };

  const handleCharChange = (index: number, rawValue: string) => {
    const normalized = normalizeInviteCode(rawValue);
    if (!normalized) {
      const nextChars = [...chars];
      nextChars[index] = " ";
      commitChars(nextChars);
      return;
    }

    const nextChars = [...chars];
    const incomingChars = normalized.split("");

    incomingChars.forEach((char, offset) => {
      const targetIndex = index + offset;
      if (targetIndex < INVITE_CODE_TOTAL_LENGTH) {
        nextChars[targetIndex] = char;
      }
    });

    commitChars(nextChars);

    const nextFocusIndex = Math.min(index + incomingChars.length, INVITE_CODE_TOTAL_LENGTH - 1);
    requestAnimationFrame(() => {
      if (nextFocusIndex >= 0 && nextFocusIndex < INVITE_CODE_TOTAL_LENGTH) {
        focusIndex(nextFocusIndex);
      }
    });
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = normalizeInviteCode(event.clipboardData.getData("text"));
    if (!pasted) return;

    const nextChars = splitInviteCode(pasted);
    commitChars(nextChars);

    requestAnimationFrame(() => {
      const nextIndex = Math.min(pasted.length, INVITE_CODE_TOTAL_LENGTH - 1);
      focusIndex(nextIndex);
    });
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (chars[index]?.trim()) {
        const nextChars = [...chars];
        nextChars[index] = " ";
        commitChars(nextChars);
        event.preventDefault();
        return;
      }

      if (index > 0) {
        event.preventDefault();
        const nextChars = [...chars];
        nextChars[index - 1] = " ";
        commitChars(nextChars);
        requestAnimationFrame(() => focusIndex(index - 1));
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < INVITE_CODE_TOTAL_LENGTH - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  let charIndex = 0;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {INVITE_CODE_SEGMENT_LENGTHS.map((segmentLength, segmentIndex) => {
          const segmentInputs = Array.from({ length: segmentLength }, () => {
            const currentIndex = charIndex++;
            return (
              <input
                key={currentIndex}
                ref={(element) => {
                  refs.current[currentIndex] = element;
                }}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete={segmentIndex === 0 && currentIndex === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={chars[currentIndex].trim()}
                onChange={(event) => handleCharChange(currentIndex, event.target.value)}
                onKeyDown={(event) => handleKeyDown(currentIndex, event)}
                onPaste={handlePaste}
                disabled={disabled}
                className="h-12 w-10 rounded-xl border-2 border-gray-300 bg-white text-center font-mono text-sm uppercase text-gray-900 shadow-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:h-14 sm:w-12 sm:text-base"
                aria-label={`Invitation code character ${currentIndex + 1}`}
              />
            );
          });

          return (
            <React.Fragment key={segmentIndex}>
              <div className="flex items-center gap-2">
                {segmentInputs}
              </div>
              {segmentIndex < INVITE_CODE_SEGMENT_LENGTHS.length - 1 && (
                <span className="font-mono text-base font-bold text-gray-400 dark:text-gray-500 sm:text-lg">
                  -
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
