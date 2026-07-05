import type { DebouncedFunc } from "lodash";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";

import { SearchInput } from "./SearchInput";

const DEFAULT_DEBOUNCE_MS = 300;

interface DebouncedSearchInputProps {
  /** Current value, owned by the parent (typically a URL search param) */
  value: string;
  /** Called (debounced) as the user types, and immediately when cleared */
  onChange: (value: string) => void;
  hideLabel?: boolean;
  compact?: boolean;
  debounceMs?: number;
}

/**
 * A controlled search input that calls onChange via a debounce
 *
 * The parent owns the value (e.g. URL search param) and decides what to do
 * with it (navigate, filter, etc). This component echoes keystrokes locally for
 * an instant input and only writes back (debounced) once typing settles - it
 * does no searching itself.
 */
export const DebouncedSearchInput = ({
  value,
  onChange,
  hideLabel = false,
  compact = false,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: DebouncedSearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const debouncedOnChangeRef = useRef<DebouncedFunc<
    (next: string) => void
  > | null>(null);
  if (!debouncedOnChangeRef.current) {
    debouncedOnChangeRef.current = debounce((next: string) => {
      onChangeRef.current(next);
      setIsSearching(false);
    }, debounceMs);
  }
  const debouncedOnChange = debouncedOnChangeRef.current!;

  useEffect(() => () => debouncedOnChange.cancel(), [debouncedOnChange]);

  const handleChange = (next: string) => {
    setLocalValue(next);
    setIsSearching(true);
    debouncedOnChange(next);
  };

  const handleClear = () => {
    debouncedOnChange.cancel();
    setIsSearching(false);
    setLocalValue("");
    onChange("");
  };

  return (
    <SearchInput
      value={localValue}
      onChange={handleChange}
      onClear={handleClear}
      showClear={Boolean(localValue)}
      isSearching={isSearching}
      hideLabel={hideLabel}
      compact={compact}
    />
  );
};
