import React from "react";

export const Description: React.FC = () => {
  const isProduction = import.meta.env.VITE_APP_ENV === "production";

  if (isProduction) {
    return (
      <>
        <p>Manage the status of your service.</p>
        <p>
          A service must be online to be accessed by the public, and to enable
          analytics gathering.
        </p>
        <p>Offline services can still be edited and published as normal.</p>
      </>
    );
  }

  return (
    <>
      <p>Manage the status of your service.</p>
      <p>A service must be online to test integrations on your public link.</p>
    </>
  );
};
