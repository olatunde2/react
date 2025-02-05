import { Button, Table } from "react-bootstrap";
import PropTypes from "prop-types";

const ClientCard = ({ clients, onUpdate, onDelete }) => {
  if (!clients?.length) {
    return <p>No clients found.</p>;
  }

  ClientCard.propTypes = {
    clients: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        phone_number: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
      })
    ).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Patient Name</th>
          <th>Patient Address</th>
          <th>Phone Number</th>
          <th>Patient Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            <td>{client.name}</td>
            <td>{client.address}</td>
            <td>{client.phone_number}</td>
            <td>{client.email}</td>
            <td>
              <Button
                variant="warning"
                onClick={() => {
                  onUpdate(client.id);
                }}
              >
                Update
              </Button>{" "}
              <Button
                variant="danger"
                onClick={() => {
                  onDelete(client.id);
                }}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ClientCard;
