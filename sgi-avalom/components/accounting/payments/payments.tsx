"use Client";
import AuthRoute from "../../AuthRoute";
import SideNavbar from "../../SideNavbar";
import BodyPayments from "./bodyPayments";

const Payments: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyPayments />
        </main>
      </div>
    </AuthRoute>
  );
};

export default Payments;
