import React from "react";
import { TasksMaster } from "../SalesActivities/Components/TasksMaster";

export const TaskAssignmentPage: React.FC = () => {
  return (
    <div className="min-h-screen space-y-6 bg-[#e4e8e1] p-4 md:p-6">
      <TasksMaster />
    </div>
  );
};

export default TaskAssignmentPage;
