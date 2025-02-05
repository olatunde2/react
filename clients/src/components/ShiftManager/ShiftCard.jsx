import { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode"; // Corrected import

const ShiftCard = ({ shifts, onUpdate, onDelete, onCheckIn, onCheckOut }) => {
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role?.toLowerCase());
      setUserId(decoded.user_id);
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    let filtered = shifts.filter((shift) => {
      const shiftStart = new Date(shift.start_time);

      if (userRole === "admin") {
        return true;
      }

      if (userRole === "worker") {
        return (
          shift.user_id === userId &&
          !shift.is_checked_out &&
          shiftStart >= todayStart &&
          shiftStart <= todayEnd
        );
      }

      return false;
    });

    setFilteredShifts(filtered);
  }, [shifts, userRole, userId]);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>User ID</th>
          <th>Patient Name</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Address</th>
          <th>Period</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredShifts.map((shift, index) => (
          <tr key={index}>
            <td>{shift.user_id}</td>
            <td>{shift.client}</td>
            <td>{new Date(shift.start_time).toLocaleString()}</td>
            <td>{new Date(shift.end_time).toLocaleString()}</td>
            <td>{shift.location?.address || "N/A"}</td>
            <td>{shift.period}</td>
            <td>
              {shift.is_checked_out === true
                ? "Completed"
                : shift.is_checked_in === true
                ? "Checked In"
                : "Not Checked In"}
            </td>
            <td>
              {userRole === "admin" && (
                <>
                  <Button
                    variant="primary"
                    className="mr-2"
                    onClick={() => onUpdate(shift.id)}
                  >
                    Update
                  </Button>{" "}
                  <Button
                    variant="danger"
                    onClick={() => onDelete(shift.id)}
                    className="mr-2"
                  >
                    Delete
                  </Button>
                </>
              )}
              {userRole === "worker" && (
                <div>
                  {!shift.is_checked_in && (
                    <Button
                      variant="success"
                      onClick={() => onCheckIn(shift.id)}
                      className="mr-2"
                    >
                      Check In{" "}
                    </Button>
                  )}
                  {shift.is_checked_in && (
                    <Button
                      variant="warning"
                      onClick={() => {
                        onCheckOut(shift.id);
                      }}
                    >
                      Check Out
                    </Button>
                  )}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

ShiftCard.propTypes = {
  shifts: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCheckIn: PropTypes.func.isRequired,
  onCheckOut: PropTypes.func.isRequired,
};

export default ShiftCard;
