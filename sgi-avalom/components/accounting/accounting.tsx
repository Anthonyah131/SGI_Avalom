"use Client";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyAccounting from "./bodyAccounting";

const Accounting: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex w-full">
        <SideNavbar />
        <BodyAccounting />
      </div>
    </AuthRoute>
  );
};

export default Accounting;
