import { AddButton } from "ui/editor/AddButton";
import NewSettingsSection from "ui/editor/NewSettingsSection";

function PatternCatalog() {
  return (
    <>
      <h1>Patterns (coming soon)</h1>
      <NewSettingsSection>
        <AddButton onClick={() => console.log("todo")}>Add pattern</AddButton>
      </NewSettingsSection>
    </>
  );
}

export default PatternCatalog;
