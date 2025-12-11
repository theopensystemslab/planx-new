import Link from "@mui/material/Link";
import { useLPS } from "hooks/useLPS";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLabel from "ui/editor/InputLabel";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_ABOUT_FLOW, UPDATE_ABOUT_FLOW } from "../queries";
import type { GetAboutFlow, UpdateAboutFlow } from "../types";
import {
  characterCountLimit,
  defaultValues,
  validationSchema,
} from "../validationSchema";

const Summary: React.FC = () => {
  const [flowId, teamSlug, canUserEditTeam] = useStore((state) => [
    state.id,
    state.teamSlug,
    state.canUserEditTeam,
  ]);
  const isDisabled = !canUserEditTeam(teamSlug);
  const { url: lpsURL } = useLPS();

  return (
    <SettingsFormContainer<GetAboutFlow, UpdateAboutFlow, { summary: string }>
      query={GET_ABOUT_FLOW}
      mutation={UPDATE_ABOUT_FLOW}
      validationSchema={validationSchema.pick(["summary"])}
      legend={"Service summary"}
      description={
        <>
          Summarise what the service does.
          <br />
          <br />
          This is used on the entry page of online, published services and the{" "}
          <Link href={lpsURL} target="_blank" rel="noopener noreferrer">
            Find Local Planning Services (opens in a new tab)
          </Link>{" "}
          website. It's publicly visible, and should be short, clear and easy to
          understand.
        </>
      }
      defaultValues={defaultValues}
      getInitialValues={({ flow: { summary } }) => ({ summary: summary ?? "" })}
      queryVariables={{ flowId }}
      getMutationVariables={(flow) => ({ flowId, flow })}
    >
      {({ formik }) => (
        <>
          <InputLabel label="Summary" htmlFor="summary">
            <Input
              multiline
              rows={2}
              {...formik.getFieldProps("summary")}
              id="summary"
              placeholder="Summary"
              errorMessage={formik.errors.summary}
              disabled={isDisabled}
              inputProps={{
                "aria-describedby": "summary-description-text",
                "aria-labelledby": "summary-label",
              }}
            />
          </InputLabel>
          <CharacterCounter
            count={formik.values.summary.length}
            limit={characterCountLimit}
            error={Boolean(formik.errors.summary)}
          />
        </>
      )}
    </SettingsFormContainer>
  );
};

export default Summary;
