import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { login } from "../styles/auth";

const SignUpPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [show, setShow] = useState(false);
  const [serverResponse, setServerResponse] = useState("");

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const loginForm = (data) => {
    const requestOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    };

    fetch(`${API_BASE_URL}/auth/login`, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        setServerResponse(data.access_token);
        setShow(true);
        login(data.access_token);
        navigate("/");
      })
      .catch((err) => console.log(err));
    reset();
  };

  return (
    <div className="container mt-4">
      <div className="form">
        {show ? (
          <>
            <Alert variant="success" onClose={() => setShow(false)} dismissible>
              <p>{serverResponse}</p>
            </Alert>
            <h1>Log In</h1>
          </>
        ) : (
          <h1> Log In</h1>
        )}
        <Form>
          <Form.Group controlId="formBasicTenant_id">
            <Form.Label>User Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter tenant_id"
              {...register("tenant_id", { required: true, maxLength: 25 })}
            />
            {errors.tenant_id && (
              <span style={{ color: "red" }}>tenant_id is required</span>
            )}
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              {...register("password", { required: true, minLength: 8 })}
            />
            {errors.password && (
              <span style={{ color: "red" }}>Password is required</span>
            )}
          </Form.Group>

          <Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              onClick={handleSubmit(loginForm)}
            >
              Log In
            </Button>
          </Form.Group>

          <br />
          <Form.Group>
            <small>
              Do not have an account?{" "}
              <Link to="/signup"> Create an account</Link>
            </small>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default SignUpPage;
