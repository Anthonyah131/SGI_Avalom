"use Client";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyMantUser from "./bodyMantUser";

const MantUser: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex w-full">
        <SideNavbar />
        <BodyMantUser />
      </div>
    </AuthRoute>
  );
};

export default MantUser;
