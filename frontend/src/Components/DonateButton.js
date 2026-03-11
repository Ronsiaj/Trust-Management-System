import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthenticateProvider";

const DonateButton = ({ label, className, redirectAfterLogin }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: redirectAfterLogin },
        replace: true,
      });
    } else {
      navigate(redirectAfterLogin);
    }
  };

  return (
    <button className={className} onClick={handleClick}>
      {label}
    </button>
  );
};

export default DonateButton;
