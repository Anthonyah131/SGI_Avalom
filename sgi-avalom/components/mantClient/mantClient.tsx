"use client";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyMantClient from "./bodyMantClient";

const MantClient: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyMantClient />
        </main>
      </div>
    </AuthRoute>
  );
};

export default MantClient;
