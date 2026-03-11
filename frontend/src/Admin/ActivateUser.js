import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Table,
  Button,
  Badge,
  Spinner,
  Row,
  Col,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import api from "../Services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);

  // Filters
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const [loading, setLoading] = useState(false);

  // Action Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, role, status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.post("/admin/user_list.php", null, {
        params: {
          page,
          limit,
          role: role || undefined,
          status: status || undefined,
        },
      });

      const data = res.data?.data;
      setUsers(data?.list || []);
      setPagination(data?.pagination || pagination);
    } catch (err) {
      console.error("User list error:", err);
      alert(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= BADGES ================= */
  const getStatusBadge = (s) => {
    if (s === "active") return <Badge color="success">Active</Badge>;
    if (s === "inactive") return <Badge color="warning">Inactive</Badge>;
    if (s === "deleted") return <Badge color="danger">Deleted</Badge>;
    return <Badge color="secondary">{s}</Badge>;
  };

  const getRoleBadge = (r) => {
    if (r === "admin") return <Badge color="dark">Admin</Badge>;
    if (r === "donor") return <Badge color="info">Donor</Badge>;
    return <Badge color="primary">User</Badge>;
  };

  /* ================= OPEN CONFIRM MODAL ================= */
  const openActionModal = (user, action) => {
    setSelectedUser(user);
    setSelectedAction(action);
    setModalOpen(true);
  };

  /* ================= API CALL: ACTIVATE USER ================= */
  const handleConfirmAction = async () => {
    if (!selectedUser || !selectedAction) return;

    try {
      const res = await api.post("/admin/activate_user.php", {
        user_id: selectedUser.id,
        action: selectedAction, // activate | deactivate | delete
      });

      alert(res?.message || "Action completed");
      setModalOpen(false);
      fetchUsers(); // refresh list
    } catch (err) {
      console.error("Action error:", err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div style={{ padding: "30px 0" }}>
      <Container>
        <h2 className="mb-4">Users Management</h2>

        <Card className="shadow-sm">
          <CardBody>
            {/* FILTERS */}
            <Row className="mb-3 g-3 align-items-end">
              <Col md="4">
                <label className="fw-bold mb-1">Filter by Role</label>
                <Input
                  type="select"
                  value={role}
                  onChange={(e) => {
                    setPage(1);
                    setRole(e.target.value);
                  }}
                >
                  <option value="">All</option>
                  <option value="user">User</option>
                  <option value="donor">Donor</option>
                  <option value="admin">Admin</option>
                </Input>
              </Col>

              <Col md="4">
                <label className="fw-bold mb-1">Filter by Status</label>
                <Input
                  type="select"
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value);
                  }}
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deleted">Deleted</option>
                </Input>
              </Col>

              <Col md="4">
                <Button
                  color="secondary"
                  className="w-100"
                  onClick={() => {
                    setRole("");
                    setStatus("");
                    setPage(1);
                  }}
                >
                  Reset Filters
                </Button>
              </Col>
            </Row>

            {/* TABLE */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner />
                <p className="mt-2 mb-0">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted mb-0">No users found.</p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th style={{ minWidth: "220px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u, index) => (
                      <tr key={u.id}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td>{getStatusBadge(u.status)}</td>
                        <td>
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              color="success"
                              disabled={u.status === "active"}
                              onClick={() => openActionModal(u, "activate")}
                            >
                              Activate
                            </Button>

                            <Button
                              size="sm"
                              color="warning"
                              disabled={u.status === "inactive"}
                              onClick={() => openActionModal(u, "deactivate")}
                            >
                              Deactivate
                            </Button>

                            <Button
                              size="sm"
                              color="danger"
                              disabled={u.status === "deleted"}
                              onClick={() => openActionModal(u, "delete")}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* PAGINATION */}
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <div className="text-muted">
                Total: <b>{pagination.total}</b> | Page{" "}
                <b>{pagination.page}</b> of <b>{pagination.total_pages}</b>
              </div>

              <div className="d-flex gap-2">
                <Button
                  color="primary"
                  outline
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>

                <Button
                  color="primary"
                  outline
                  disabled={page >= pagination.total_pages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* CONFIRM MODAL */}
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            Confirm Action
          </ModalHeader>

          <ModalBody>
            {selectedUser && (
              <>
                <p className="mb-2">
                  Are you sure you want to{" "}
                  <b className="text-danger">{selectedAction}</b> this user?
                </p>

                <p className="mb-0">
                  <b>{selectedUser.name}</b> ({selectedUser.email})
                </p>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>

            <Button color="danger" onClick={handleConfirmAction}>
              Yes, Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default UserList;
