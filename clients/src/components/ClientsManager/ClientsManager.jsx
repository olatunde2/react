import { useEffect, useState } from "react";
import { Modal, Alert, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import ClientCard from "./ClientCard";
import ClientsForm from "./ClientsForm";

const ClientsHome = () => {
  const [clients, setClients] = useState([]);
  const [show, setShow] = useState(false);
  const [clientsId, setClientsId] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { handleSubmit, setValue, reset } = useForm();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = JSON.parse(localStorage.getItem("REACT_TOKEN_AUTH_KEY"));

  useEffect(() => {
    getAllClients();
  }, []);

  const getAllClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/clients/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      setError("Error fetching clients: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShow(false);
    reset();
  };

  const showModal = (id) => {
    setClientsId(id);
    setShow(true);
    const selectedClient = clients.find((client) => client.id === id);
    if (selectedClient) {
      setValue("name", selectedClient.name);
      setValue("address", selectedClient.address);
      setValue("phone_number", selectedClient.phone_number);
      setValue("email", selectedClient.email);
    }
  };

  const updateClients = async (data) => {
    try {
      const requestOptions = {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      };
      await fetch(`${API_BASE_URL}/clients/${clientsId}`, requestOptions);
      getAllClients();
      closeModal();
      setTimeout(() => {
        setSuccessMessage("Client updated successfully!");
      }, 3000);
    } catch (err) {
      console.log("Error updating client", err);
      setApiError("Error updating client: " + err.message);
    }
  };

  const deleteClient = async (id) => {
    try {
      const requestOptions = {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await fetch(`${API_BASE_URL}/clients/${id}`, requestOptions);
      if (!res.ok) throw new Error("Failed to delete client");
      getAllClients();
      setTimeout(() => {
        setSuccessMessage("Client deleted successfully");
      }, 3000);
    } catch (err) {
      console.log("Error deleting client", err);
      setApiError("Error deleting client: " + err.message);
    }
  };

  return (
    <div className="recipes">
      <Modal show={show} size="lg" onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {apiError && <Alert variant="danger">{apiError}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          <ClientsForm
            onClick={updateClients}
            defaultValues={
              clients.find((client) => client.id === clientsId) || {}
            }
          />
        </Modal.Body>
      </Modal>
      <h1>List of Patient</h1>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      <ClientCard
        clients={clients}
        onUpdate={showModal}
        onDelete={deleteClient}
      />
    </div>
  );
};

export default ClientsHome;
