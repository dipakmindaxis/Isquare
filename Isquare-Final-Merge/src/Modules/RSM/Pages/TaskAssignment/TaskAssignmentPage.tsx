import React from "react";
import { TasksMaster } from "../SalesActivities/Components/TasksMaster";

export const TaskAssignmentPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      <TasksMaster />
    </div>
  );
};

export default TaskAssignmentPage;
