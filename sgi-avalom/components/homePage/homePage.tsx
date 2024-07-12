import AuthRoute from "../AuthRoute";
import BodyHomePage from "./bodyHomePage";
import SideNavBar from "../SideNavbar";

const HomePage: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex w-full">
        <SideNavBar />
        <BodyHomePage />
      </div>
    </AuthRoute>
  );
};

export default HomePage;
