import AuthRoute from '../AuthRoute';
import BodyHomePage from './bodyHomePage';

const HomePage: React.FC = () => {
  return (
    <AuthRoute>
      <BodyHomePage />
    </AuthRoute>
  );
};

export default HomePage;
