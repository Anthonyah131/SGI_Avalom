"use client";

import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyMantClient from "./bodyMantClient";

const MantClient: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex w-full">
        <SideNavbar />
        <BodyMantClient />
      </div>
    </AuthRoute>
  );
};

export default MantClient;
