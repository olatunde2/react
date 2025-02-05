import { Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const ResetPassword = () => {
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

  const onSubmit = (data) => {
    if (data.password === data.confirmPassword) {
      const body = {
        password: data.password,
      };

      const requestOptions = {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      };

      fetch(`${API_BASE_URL}/auth/reset-password`, requestOptions)
        .then((res) => res.json())
        .then((data) => {
          setServerResponse(data.message);
          setShow(true);

          if (data.success) {
            navigate("/login");
          }
        })
        .catch((err) => console.log(err));

      reset();
    } else {
      alert("Passwords do not match");
    }
  };

  return (
    <div className="container mt-4">
      <div className="form">
        {show && (
          <Alert variant="success" onClose={() => setShow(false)} dismissible>
            <p>{serverResponse}</p>
          </Alert>
        )}
        <h1>Reset Password</h1>
        <Form>
          <Form.Group controlId="formBasicPassword" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              {...register("password", {
                required: true,
                minLength: 8,
                pattern: PWD_REGEX,
              })}
            />
            {errors.password && (
              <span style={{ color: "red" }}>
                Password must be 8-24 characters long, include uppercase,
                lowercase, a number, and a special character (!@#$%).
              </span>
            )}
          </Form.Group>

          <Form.Group controlId="formBasicConfirmPassword" className="mt-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword", { required: true, minLength: 8 })}
            />
            {errors.confirmPassword && (
              <span style={{ color: "red" }}>Password is required</span>
            )}
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="mt-3"
            onClick={handleSubmit(onSubmit)}
          >
            Reset Password
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
