"use Client";

import React from "react";
import SideNavbar from "../SideNavbar";
import AuthRoute from "../AuthRoute";

const BodyAccounting: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16 pt-14">
          Accounting
        </main>
      </div>
    </AuthRoute>
  );
};

export default BodyAccounting;
