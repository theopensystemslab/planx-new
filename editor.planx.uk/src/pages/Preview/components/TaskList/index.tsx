import Button from "@material-ui/core/Button";
import React from "react";
import Card from "../shared/Card";

interface Props {
  node: any;
  handleSubmit?;
}

const TaskList: React.FC<Props> = ({ node, handleSubmit }) => {
  return (
    <Card>
      <pre>{JSON.stringify(node, null, 2)}</pre>

      <Button
        variant="contained"
        color="primary"
        size="large"
        type="submit"
        onClick={handleSubmit}
      >
        Continue
      </Button>
    </Card>
  );
};

export default TaskList;
