import type React from "react";

interface Props {
  onSelect: (patternId: string) => void;
}

export const PatternsTab: React.FC<Props> = ({ onSelect }) => "patterns!";
