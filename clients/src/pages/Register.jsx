import { Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";

const User_REGEX = /^[a-zA-Z][a-zA-Z0-9\s-_]{3,50}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const SignUpPage = () => {
  const [serverResponse, setServerResponse] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const body = {
      name: data.name,
      tenant_id: data.tenantId,
      email: data.email,
      password: data.password,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      console.log("API Response:", result); // Debugging output
      setServerResponse(result.message);
      setShow(true);
      localStorage.setItem("userEmail", data.email);

      if (
        result.message ===
        "User created successfully. Please verify your email."
      ) {
        console.log("Navigating to /login...");
        setTimeout(() => {
          navigate("/verify-email");
        }, 2000);
      }
    } catch (error) {
      console.error("Error signing up:", error);
    }

    reset();
  };

  return (
    <div className="container mt-4">
      <div className="form">
        {show && (
          <Alert variant="success" onClose={() => setShow(false)} dismissible>
            <p>{serverResponse}</p>
          </Alert>
        )}
        <h1>Sign Up</h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group controlId="formBasicName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              {...register("name", {
                required: true,
                pattern: User_REGEX,
              })}
            />
            {errors.name && (
              <span className="text-danger">Invalid name format.</span>
            )}
          </Form.Group>

          <Form.Group controlId="formBasicTenantId">
            <Form.Label>Tenant ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your tenant ID"
              {...register("tenantId", { required: true, maxLength: 20 })}
            />
            {errors.tenantId && (
              <span style={{ color: "red" }}>Tenant ID is required</span>
            )}
          </Form.Group>

          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span className="text-danger">Email is required</span>
            )}
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              {...register("password", {
                required: true,
                pattern: PWD_REGEX,
              })}
            />
            {errors.password && (
              <span className="text-danger">Weak password.</span>
            )}
          </Form.Group>

          <Form.Group controlId="formBasicConfirmPassword" className="mt-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword", { required: true })}
            />
            {errors.confirmPassword && (
              <span className="text-danger">Required</span>
            )}
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3">
            Sign Up
          </Button>
          <Form.Group className="mt-3">
            <span>
              Already have an account? <Link to="/login">Log In</Link>
            </span>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default SignUpPage;
