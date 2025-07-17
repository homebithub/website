import React from "react";
import Location from "../components/Location";

const LocationRoute = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f7f9fa" }}>

      <Location onSelect={(location) => {}} />
    </div>
  );
};

export default LocationRoute;
