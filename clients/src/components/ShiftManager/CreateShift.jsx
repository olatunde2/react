import { useState } from "react";
import { Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import ShiftForm from "./ShiftForm";

const CreateShift = () => {
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

      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        data.location
      )}&format=json&addressdetails=1&limit=1`;

      const geocodeResponse = await fetch(geocodeUrl);

      if (!geocodeResponse.ok) {
        setApiError("Failed to fetch geocode data.");
        return;
      }

      const geocodeData = await geocodeResponse.json();

      if (geocodeData && geocodeData.length > 0) {
        const { lat, lon, address } = geocodeData[0];

        const formattedAddress = `${
          address.house_number ? "No. " + address.house_number : ""
        } ${address.road || ""}, ${address.suburb || ""} ${
          address.city || ""
        }, ${address.state || ""}, ${address.country || ""}`;

        data.location = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          address: formattedAddress,
        };
      } else {
        setApiError("Invalid address. Please enter a valid location.");
        return;
      }

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: JSON.stringify(data),
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${API_BASE_URL}/shifts/`, requestOptions);

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to create shift");
      }

      await response.json();
      setSuccessMessage("Shift created successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      reset();
    } catch (err) {
      setApiError(err.message || "An error occurred while creating the shift");
      setTimeout(() => {
        setApiError(null);
      }, 3000);
    }
  };

  return (
    <div className="container">
      <h2>Create Shift</h2>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {apiError && <Alert variant="danger">{apiError}</Alert>}
      <ShiftForm onClick={onCreate} defaultValues={{ reset }} />
    </div>
  );
};

export default CreateShift;
