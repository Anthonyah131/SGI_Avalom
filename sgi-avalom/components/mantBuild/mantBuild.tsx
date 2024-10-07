"use Client";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyMantBuild from "./bodyMantBuild";

const MantBuild: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyMantBuild />
        </main>
      </div>
    </AuthRoute>
  );
};

export default MantBuild;
