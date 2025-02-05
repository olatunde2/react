import { Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const ClientForm = ({ onClick, defaultValues }) => {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues,
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
    <div>
      <Form>
        <Form.Group controlId="formClientName">
          <Form.Label>Patient Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            {...register("name", { required: "Name is required" })}
          />
        </Form.Group>

        <Form.Group controlId="formClientAddress">
          <Form.Label>Patient Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter address"
            {...register("address", { required: "Address is required" })}
          />
        </Form.Group>

        <Form.Group controlId="formClientPhone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            {...register("phone_number", {
              required: "Phone number is required",
            })}
          />
        </Form.Group>

        <Form.Group controlId="formClientEmail">
          <Form.Label>Patient Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            {...register("email", { required: "Email is required" })}
          />
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
  );
};

ClientForm.propTypes = {
  onClick: PropTypes.func.isRequired,
  defaultValues: PropTypes.object,
};

export default ClientForm;
