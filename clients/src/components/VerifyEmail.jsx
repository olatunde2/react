import { Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [serverResponse, setServerResponse] = useState("");
  const [show, setShow] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const body = {
      email: localStorage.getItem("userEmail"),
      verification_code: data.verificationCode,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify_email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log("API Response:", result); // Debugging output

      setServerResponse(result.message);
      setShow(true);

      if (result.message === "Email verified successfully") {
        console.log("Navigating to /login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying email:", error);
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
        <h1>Verify Email</h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group controlId="formBasicVerificationCode" className="mt-3">
            <Form.Label>Verification Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter verification code"
              {...register("verificationCode", { required: true })}
            />
            {errors.verificationCode && (
              <span className="text-danger">Required</span>
            )}
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3">
            Verify Email
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default VerifyEmail;
