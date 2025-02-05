import { Button, Form, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const ShiftForm = ({ onClick, defaultValues }) => {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues, // Set default values directly
  });

  useEffect(() => {
    if (defaultValues) {
      Object.keys(defaultValues).forEach((key) => {
        setValue(key, defaultValues[key]);
      });
    }
  }, [defaultValues, setValue]);

  const onSubmit = (data) => {
    onClick(data);
    reset();
  };

  return (
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
              {...register("client", { required: "Client name is required" })}
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
              {...register("end_time", { required: "End time is required" })}
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
              {...register("location", { required: "Location is required" })}
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
        onClick={handleSubmit(onSubmit)}
      >
        Save Shift
      </Button>
    </Form>
  );
};

ShiftForm.propTypes = {
  onClick: PropTypes.func.isRequired,
  defaultValues: PropTypes.object,
};

export default ShiftForm;
