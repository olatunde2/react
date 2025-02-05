import { useAuth } from "../../styles/auth";
import { Link } from "react-router-dom";
import ShiftManager from "./ShiftManager";

const LoggedOutHome = () => {
  return (
    <div className="home container">
      <h1 className="heading">Welcome to Client App</h1>
      <Link to="/login" className="btn btn-primary btn-lg">
        Get Started
      </Link>
    </div>
  );
};

const HomePage = () => {
  const [logged] = useAuth();

  return <div>{logged ? <ShiftManager /> : <LoggedOutHome />}</div>;
};

export default HomePage;
