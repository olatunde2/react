import { useState } from "react";
import { Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import ClientsForm from "./ClientsForm";

const CreateRecipePage = () => {
  const { reset } = useForm();

  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const onCreate = async (data) => {
    setApiError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");

      if (!token) {
        setApiError("No authentication token found.");
        return;
      }

      const requestOptions = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: JSON.stringify(data),
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${API_BASE_URL}/clients/`, requestOptions);

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to create client");
      }

      await response.json();
      setSuccessMessage("Client created successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      reset();
    } catch (err) {
      setApiError(err.message || "An error occurred while creating the client");
      setTimeout(() => {
        setApiError(null);
      }, 3000);
    }
  };

  return (
    <div className="container">
      <h2>Create A Patient</h2>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {apiError && <Alert variant="danger">{apiError}</Alert>}
      <ClientsForm onClick={onCreate} defaultValues={{ reset }} />
    </div>
  );
};

export default CreateRecipePage;
