import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/shared/types";
import { makeData } from "@planx/components/shared/utils";
import { useQuery } from "@tanstack/react-query";
import { enhanceProjectDescription } from "lib/api/ai/requests";
import type { EnhanceError, EnhanceResponse } from "lib/api/ai/types";
import type { APIError } from "lib/api/client";
import React from "react";

import type { EnhancedTextInputForTask } from "../../types";

type Props = PublicProps<EnhancedTextInputForTask<"projectDescription"> & { userInput: string }>;

const ProjectDescription: React.FC<Props> = (props) => {
  const handleSubmit = () => props.handleSubmit?.(makeData(props, {}));
  const { isPending, data, error } = useQuery<EnhanceResponse, APIError<EnhanceError>>({
    queryFn: () => enhanceProjectDescription(props.userInput),
    queryKey: ["projectDescription", props.userInput],
    retry: 0,
  });

  if (isPending) return (
    <Card>
      <CardHeader
        title={"Loading..."}
        description={"Enhancing project description"}
      />
    </Card>
  )

  if (error) {
    switch (error.data.error) {
      case "INVALID_DESCRIPTION":
        return (
          <Card handleSubmit={handleSubmit}>
            <CardHeader
              title={"Invalid project description"}
              description={error.data.message}
            />
          </Card>
        )

      case "SERVICE_UNAVAILABLE":
        return (
          <Card handleSubmit={handleSubmit}>
            <CardHeader
              title={"Service unavailable"}
              description={error.data.message}
            />
          </Card>
        )
    }
  }

  return (
    <Card handleSubmit={handleSubmit}>
      <CardHeader
        title={props.revisionTitle}
        description={props.revisionDescription}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      Original: { data.original }
      Enhanced: { data.enhanced }

    </Card>
  )
};

export default ProjectDescription;