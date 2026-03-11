import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Badge,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import api from "../Services/api";

const EmailStatus = () => {
  const [list, setList] = useState([]);

  // Filters
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");

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

  /* ================= LOAD LIST ================= */
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [page, type, status, userId]);

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/email_status.php", {
        params: {
          page,
          limit,
          type: type || undefined,
          status: status || undefined,
          user_id: userId || undefined,
        },
      });

      const data = res.data?.data;

      setList(data?.list || []);
      setPagination(data?.pagination || pagination);
    } catch (err) {
      console.error("Email logs error:", err);
      alert(err.response?.data?.message || "Failed to load email logs");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (s) => {
    if (s === "sent") return <Badge color="success">Sent</Badge>;
    return <Badge color="danger">Failed</Badge>;
  };

  return (
    <div style={{ padding: "30px 0" }}>
      <Container>
        <h2 className="mb-4">Email Logs</h2>

        <Card className="shadow-sm">
          <CardBody>
            {/* FILTERS */}
            <Row className="align-items-end g-3 mb-3">
              <Col md="3">
                <label className="fw-bold mb-1">Filter by Type</label>
                <Input
                  type="select"
                  value={type}
                  onChange={(e) => {
                    setPage(1);
                    setType(e.target.value);
                  }}
                >
                  <option value="">All</option>
                  <option value="donation">Donation</option>
                  <option value="donation_review">Donation Review</option>
                  <option value="notification">Notification</option>
                  <option value="activation">Activation</option>
                </Input>
              </Col>

              <Col md="3">
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
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </Input>
              </Col>

              <Col md="3">
                <label className="fw-bold mb-1">Filter by User ID</label>
                <Input
                  type="number"
                  placeholder="Enter user_id"
                  value={userId}
                  onChange={(e) => {
                    setPage(1);
                    setUserId(e.target.value);
                  }}
                />
              </Col>

              <Col md="3">
                <Button
                  color="secondary"
                  className="w-100"
                  onClick={() => {
                    setType("");
                    setStatus("");
                    setUserId("");
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>

            {/* TABLE */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner />
                <p className="mt-2 mb-0">Loading email logs...</p>
              </div>
            ) : list.length === 0 ? (
              <p className="text-center text-muted mb-0">
                No email logs found.
              </p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User ID</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {list.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{item.user_id || "-"}</td>
                        <td>{item.type}</td>
                        <td style={{ minWidth: "240px" }}>{item.subject}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
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
      </Container>
    </div>
  );
};

export default EmailStatus;
