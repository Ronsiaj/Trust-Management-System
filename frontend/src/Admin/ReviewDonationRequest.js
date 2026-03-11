import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Badge,
  Button,
  Spinner,
  Input,
} from "reactstrap";
import api from "../Services/api";

const ReviewDonationRequest = () => {
  const [list, setList] = useState([]);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    id: null,
    action: null,
  });


  const normalizeStatus = (s) => (s ? String(s).toLowerCase().trim() : "");

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [page, status, limit]);

  const fetchRequests = async () => {
    setLoading(true);

    try {
      const res = await api.get("/user/donation_request_list.php", {
        params: {
          page,
          limit,
          status: status || undefined,
        },
      });

      const data = res.data?.data;
      setList(data?.list || []);
      setPagination(data?.pagination || pagination);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load donation requests");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (s) => {
    const statusValue = normalizeStatus(s);

    if (statusValue === "approved")
      return <Badge color="success">Approved</Badge>;

    if (statusValue === "rejected")
      return <Badge color="danger">Rejected</Badge>;

    if (statusValue === "pending")
      return <Badge color="warning">Pending</Badge>;

    if (statusValue === "completed")
      return <Badge color="primary">Completed</Badge>;

    return <Badge color="secondary">{statusValue || "Unknown"}</Badge>;
  };

  const handleReview = async (donation_id, action) => {
    if (!donation_id) return;

    const confirmMsg =
      action === "approve"
        ? "Approve this donation request?"
        : "Reject this donation request?";

    if (!window.confirm(confirmMsg)) return;

    setActionLoading({ id: donation_id, action });

    try {
      const res = await api.post("/admin/review_donation_request.php", {
        donation_id,
        action,
      });

      alert(res.data?.message || "Updated successfully");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading({ id: null, action: null });

    }
  };

  const money = (val) => {
    const num = Number(val || 0);
    return `₹${num.toFixed(2)}`;
  };

  return (
    <div className="admin-review-page">


      <section style={{ padding: "40px 0" }}>
        <Container>
          <h2 className="mb-4">Review Requests</h2>
          <Card className="shadow-sm">
            <CardBody>
              {/* FILTERS */}
              <Row className="align-items-end g-3 mb-3">
                <Col md="4">
                  <label className="fw-bold mb-1">Status</label>
                  <Input
                    type="select"
                    value={status}
                    onChange={(e) => {
                      setPage(1);
                      setStatus(e.target.value);
                    }}
                  >
                    <option value="">All</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </Input>
                </Col>

                <Col md="3">
                  <label className="fw-bold mb-1">Limit</label>
                  <Input
                    type="select"
                    value={limit}
                    onChange={(e) => {
                      setPage(1);
                      setLimit(Number(e.target.value));
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </Input>
                </Col>

                <Col md="2">
                  <Button
                    color="secondary"
                    className="w-100"
                    onClick={() => {
                      setStatus("");
                      setPage(1);
                      setLimit(10);
                    }}
                  >
                    Reset
                  </Button>
                </Col>

                <Col md="3">
                  <Button
                    color="primary"
                    className="w-100"
                    onClick={fetchRequests}
                    disabled={loading}
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </Button>
                </Col>
              </Row>

              {/* TABLE */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spinner color="primary" />
                  <p className="mt-3 mb-0">Loading...</p>
                </div>
              ) : list.length === 0 ? (
                <p className="text-center text-muted mb-0">
                  No donation requests found.
                </p>
              ) : (
                <div className="table-responsive">
                  <Table bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Status</th>
                        <th>Description</th>

                        {/* ✅ NEW */}
                        <th>Requested</th>
                        <th>Paid</th>
                        <th>Pending</th>

                        <th>User</th>
                        <th>Created</th>
                        <th style={{ width: "220px" }}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {list.map((item, index) => {
                        const statusValue = normalizeStatus(item.status);

                        const requested = Number(item.amount || 0);
                        const paid = Number(item.total_paid || 0);
                        const pending = Number(item.remaining_amount || 0);

                        return (
                          <tr key={item.id}>
                            <td>{(page - 1) * limit + index + 1}</td>

                            <td>{getStatusBadge(item.status)}</td>

                            <td style={{ minWidth: "280px" }}>
                              {item.description}
                            </td>

                            {/* ✅ NEW */}
                            <td>{money(requested)}</td>
                            <td>{money(paid)}</td>
                            <td>{money(pending)}
                            </td>

                            <td style={{ minWidth: "200px" }}>
                              <div>
                                <b>{item.user_name}</b>
                              </div>
                              <div className="text-muted">{item.user_email}</div>
                            </td>

                            <td style={{ minWidth: "170px" }}>
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString()
                                : "-"}
                            </td>

                            <td>
                              {statusValue !== "pending" ? (
                                <span className="text-muted">
                                  Already reviewed
                                </span>
                              ) : (
                                <div className="d-flex gap-2">
                                  <Button
                                    color="success"
                                    size="sm"
                                    disabled={actionLoading.id === item.id && actionLoading.action === "approve"}
                                    onClick={() => handleReview(item.id, "approve")}
                                  >
                                    {actionLoading.id === item.id && actionLoading.action === "approve" ? (
                                      <Spinner size="sm" />
                                    ) : (
                                      "Approve"
                                    )}
                                  </Button>


                                  <Button
                                    color="danger"
                                    size="sm"
                                    disabled={actionLoading.id === item.id && actionLoading.action === "reject"}
                                    onClick={() => handleReview(item.id, "reject")}
                                  >
                                    {actionLoading.id === item.id && actionLoading.action === "reject" ? (
                                      <Spinner size="sm" />
                                    ) : (
                                      "Reject"
                                    )}
                                  </Button>

                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
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
      </section>
    </div>
  );
};

export default ReviewDonationRequest;
