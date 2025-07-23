import React from "react";
import Chores from "../components/Chores";

const ChoresPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Chores />
    </div>
  );
};

export default ChoresPage;
