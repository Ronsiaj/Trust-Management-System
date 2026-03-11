import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Input,
  Button,
  Table,
  Spinner,
  Badge,
} from "reactstrap";
import api from "../Services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/user_list.php", {
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

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    setRole("");
    setStatus("");
    setPage(1);
    setTimeout(() => fetchUsers(), 100);
  };

  const getRoleBadge = (r) => {
    if (r === "admin") return <Badge color="dark">Admin</Badge>;
    if (r === "donor") return <Badge color="primary">Donor</Badge>;
    return <Badge color="secondary">User</Badge>;
  };

  const getStatusBadge = (s) => {
    if (s === "active") return <Badge color="success">Active</Badge>;
    if (s === "inactive") return <Badge color="warning">Inactive</Badge>;
    if (s === "deleted") return <Badge color="danger">Deleted</Badge>;
    return <Badge color="secondary">{s}</Badge>;
  };

  return (
    <div style={{ padding: "30px 0" }}>
      <Container>
        <h2 className="mb-4">Users List</h2>

        <Card className="shadow-sm">
          <CardBody>
            {/* FILTERS */}
            <Row className="g-3 mb-3 align-items-end">
              <Col md="4">
                <label className="fw-bold mb-1">Role</label>
                <Input
                  type="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="user">User</option>
                  <option value="donor">Donor</option>
                  <option value="admin">Admin</option>
                </Input>
              </Col>

              <Col md="4">
                <label className="fw-bold mb-1">Status</label>
                <Input
                  type="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deleted">Deleted</option>
                </Input>
              </Col>

              <Col md="2">
                <Button color="primary" className="w-100" onClick={handleSearch}>
                  Search
                </Button>
              </Col>

              <Col md="2">
                <Button color="secondary" className="w-100" onClick={handleReset}>
                  Reset
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
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u, index) => (
                      <tr key={u.id}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td>{getStatusBadge(u.status)}</td>
                        <td>
                          {u.created_at
                            ? new Date(u.created_at).toLocaleString()
                            : "-"}
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
                <b>{pagination.page}</b> / <b>{pagination.total_pages}</b>
              </div>

              <div className="d-flex gap-2">
                <Button
                  outline
                  color="primary"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>

                <Button
                  outline
                  color="primary"
                  disabled={page >= pagination.total_pages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default UserList;
