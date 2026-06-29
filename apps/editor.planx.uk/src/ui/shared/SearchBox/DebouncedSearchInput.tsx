import { debounce } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";

import { SEARCH_DEBOUNCE_MS } from "../constants";
import { SearchInput } from "./SearchInput";

interface DebouncedSearchInputProps {
  /** Current value, owned by the parent (typically a URL search param) */
  value: string;
  /** Called (debounced) as the user types, and immediately when cleared */
  onChange: (value: string) => void;
  hideLabel?: boolean;
  compact?: boolean;
}

/**
 * A controlled search input that calls onChange via a debounce
 *
 * The parent owns the value (e.g. URL search param) and decides what to do
 * with it (navigate, filter, etc). This component only echoes keystrokes
 * locally for a responsive input and writes back on the debounce it does no
 * searching itself.
 */
export const DebouncedSearchInput = ({
  value,
  onChange,
  hideLabel = false,
  compact = false,
}: DebouncedSearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  // Pull external changes (clear elsewhere, back/forward nav) into the input.
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const debouncedOnChange = debounce((next: string) => {
    onChangeRef.current(next);
    setIsSearching(false);
  }, SEARCH_DEBOUNCE_MS);

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
