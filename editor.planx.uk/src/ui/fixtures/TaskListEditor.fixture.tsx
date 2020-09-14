import React, { useState } from "react";
import FixtureContainer from "./FixtureContainer";

import TaskListEditor, { TaskList } from "../TaskListEditor";

const Fixture = () => {
  const [taskList, setTaskList] = useState<TaskList>({
    notes: "",
    tasks: [],
  });
  return (
    <FixtureContainer>
      <TaskListEditor value={taskList} onChange={setTaskList} />
    </FixtureContainer>
  );
};

export default <Fixture />;
