import { useEffect, useState } from "react";
import { Modal, Alert, Spinner, Form, Row, Col, Button } from "react-bootstrap";

import { useForm } from "react-hook-form";
import ShiftCard from "./ShiftCard";
// import ShiftForm from "./ShiftForm";

const ShiftManager = () => {
  const [shifts, setShifts] = useState([]);
  const [show, setShow] = useState(false);
  const [shiftId, setShiftId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { setValue, reset, register, handleSubmit } = useForm();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = JSON.parse(localStorage.getItem("REACT_TOKEN_AUTH_KEY"));

  useEffect(() => {
    getAllShifts();
  }, []);

  const getAllShifts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/shifts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch shifts.");
      const data = await res.json();
      setShifts(data);
    } catch (err) {
      setError("Error fetching shifts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShow(false);
    reset();
  };

  const showModal = (id) => {
    setShiftId(id);
    setShow(true);

    const selectedShift = shifts.find((shift) => shift.id === id);

    if (selectedShift) {
      setValue("user", selectedShift.user_id);
      setValue("client", selectedShift.client);
      setValue("start_time", selectedShift.start_time);
      setValue("end_time", selectedShift.end_time);
      setValue("location", selectedShift.location?.address);
      setValue("period", selectedShift.period.split(".")[1]);
    }
  };

  const updateShift = async (data) => {
    console.log(data);
    try {
      if (data.location) {
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
      }

      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      };

      const response = await fetch(
        `${API_BASE_URL}/shifts/${shiftId}`,
        requestOptions
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to update shift");
      }
      getAllShifts();
      closeModal();
      setTimeout(() => {
        setSuccessMessage("Shift updated successfully.");
      }, 3000);
    } catch (err) {
      console.error("Error updating shift:", err);
      setApiError("Failed to update shift.");
    }
  };

  const deleteShift = async (id) => {
    try {
      const requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await fetch(`${API_BASE_URL}/shifts/${id}`, requestOptions);
      if (!res.ok) throw new Error("Failed to delete shift.");
      getAllShifts();
      setTimeout(() => {
        setSuccessMessage("Shift deleted successfully.");
      }, 3000);
    } catch (err) {
      console.error("Error deleting shift:", err);
    }
  };

  const handleCheckIn = async (shift) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              shift_id: shift,
              check_in_location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            }),
          };

          fetch(`${API_BASE_URL}/check_in_out/check-in`, requestOptions)
            .then((res) => res.json())
            .then((data) => {});
          setSuccessMessage(`Check-in successful`);
          getAllShifts();
        },
        (geoError) => {
          setError("Geolocation error: " + geoError.message);
        }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    console.log(id);

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const requestOptions = {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              check_out_location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            }),
          };

          fetch(`${API_BASE_URL}/check_in_out/check-out/${id}`, requestOptions)
            .then((res) => res.json())
            .then((data) => {});
          setSuccessMessage(`Check-out successful`);
          getAllShifts();
        },
        (geoError) => {
          setError("Geolocation error: " + geoError.message);
        }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shift-manager">
      <Modal show={show} size="lg" onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Shift</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {apiError && <Alert variant="danger">{apiError}</Alert>}
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formUser">
                  <Form.Label>User</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter user name"
                    {...register("user", { required: "User name is required" })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formClient">
                  <Form.Label>Client</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter client name"
                    {...register("client", {
                      required: "Client name is required",
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formStartTime">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    {...register("start_time", {
                      required: "Start time is required",
                    })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formEndTime">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    {...register("end_time", {
                      required: "End time is required",
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formLocation">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter location"
                    {...register("location", {
                      required: "Location is required",
                    })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formPeriod">
                  <Form.Label>Period</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter period (e.g., MORNING, AFTERNOON)"
                    {...register("period", { required: "Period is required" })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              onClick={handleSubmit(updateShift)}
            >
              Save Shift
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <h1>List of Shifts</h1>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      <ShiftCard
        shifts={shifts}
        onUpdate={showModal}
        onDelete={deleteShift}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
      />
    </div>
  );
};

export default ShiftManager;
