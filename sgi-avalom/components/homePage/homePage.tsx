import AuthRoute from "../AuthRoute";
import BodyHomePage from "./bodyHomePage";
import SideNavbar from "../SideNavbar";

const HomePage: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyHomePage />
        </main>
      </div>
    </AuthRoute>
  );
};

export default HomePage;
