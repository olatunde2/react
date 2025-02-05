import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

const PromoteToAdmin = () => {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken"); // Ensure the admin is authenticated
      const response = await fetch(
        `${API_BASE_URL}/auth/promote_to_admin/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setVariant("success");
      } else {
        setVariant("danger");
      }
      setMessage(data.message);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      setVariant("danger");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Promote User to Admin</h2>
      {message && <Alert variant={variant}>{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="userId">
          <Form.Label>User ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Promote to Admin
        </Button>
      </Form>
    </div>
  );
};

export default PromoteToAdmin;
