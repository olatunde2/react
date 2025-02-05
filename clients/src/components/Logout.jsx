import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const [serverResponse, setServerResponse] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const accessToken = localStorage.getItem("REACT_TOKEN_AUTH_KEY");

    if (!accessToken) {
      alert("No access token found in local storage.");
      navigate("/");
      return;
    }

    const body = {
      access_token: accessToken,
    };
    let token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${JSON.parse(token)}`,
      },
      body: JSON.stringify(body),
    };

    fetch(`${API_BASE_URL}/auth/logout`, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        setServerResponse(data.message);
        setShow(true);
        localStorage.removeItem("REACT_TOKEN_AUTH_KEY");
        navigate("/");
        const reload = window.location.reload();
        reload();
      })
      .catch((err) => {
        console.error("Error during logout:", err);
        navigate("/");
      });
  }, [API_BASE_URL, navigate]);

  return null;
};

export default Logout;
