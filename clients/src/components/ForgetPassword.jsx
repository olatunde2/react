import { Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [serverResponse, setServerResponse] = useState("");
  const [show, setShow] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const onSubmit = (data) => {
    const body = {
      email: data.email,
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };

    fetch(`${API_BASE_URL}/auth/forget-password`, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        setServerResponse(data.message);
        setShow(true);

        if (data.success) {
          navigate("/reset-password");
        }
      })
      .catch((err) => console.error(err));

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
        <h1>Forget Password</h1>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <span style={{ color: "red" }}>Email is required</span>
            )}
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="mt-3"
            onClick={handleSubmit(onSubmit)}
          >
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ForgetPassword;
