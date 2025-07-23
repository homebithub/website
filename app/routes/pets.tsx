import React from "react";
import Pets from "../components/Pets";

const PetsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Pets />
    </div>
  );
};

export default PetsPage;
