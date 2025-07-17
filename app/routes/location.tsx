import React from "react";
import Location from "../components/Location";

const LocationRoute = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f7f9fa" }}>
      <h1 style={{ marginBottom: 32, color: "#1a73e8", fontWeight: 700 }}>Location Search Demo</h1>
      <Location onSelect={(location) => {}} />
    </div>
  );
};

export default LocationRoute;
