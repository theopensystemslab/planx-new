import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { TaskList } from "@planx/components/TaskList/model";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import NumberedList from "ui/NumberedList";

export type Props = PublicProps<TaskList>;

const TaskListComponent: React.FC<Props> = (props) => {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <NumberedList items={props.tasks} heading={"h2"} />
    </Card>
  );
};

export default TaskListComponent;
