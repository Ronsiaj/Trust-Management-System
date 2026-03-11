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

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [status, setStatus] = useState("");
  const [donorId, setDonorId] = useState("");
  const [donationId, setDonationId] = useState("");
  const [paymentId, setPaymentId] = useState("");

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
    fetchPayments();
    // eslint-disable-next-line
  }, [page]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/payment_list.php", {
        params: {
          page,
          limit,
          status: status || undefined,
          donor_id: donorId || undefined,
          donation_id: donationId || undefined,
          payment_id: paymentId || undefined,
        },
      });

      const data = res.data?.data;
      setPayments(data?.list || []);
      setPagination(data?.pagination || pagination);
    } catch (err) {
      console.error("Payment list error:", err);
      alert(err.response?.data?.message || "Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPayments();
  };

  const handleReset = () => {
    setStatus("");
    setDonorId("");
    setDonationId("");
    setPaymentId("");
    setPage(1);
    setTimeout(() => fetchPayments(), 100);
  };

  const getStatusBadge = (s) => {
    if (s === "success") return <Badge color="success">Success</Badge>;
    if (s === "failed") return <Badge color="danger">Failed</Badge>;
    return <Badge color="secondary">{s}</Badge>;
  };

  return (
    <div style={{ padding: "30px 0" }}>
      <Container>
        <h2 className="mb-4">Payments List</h2>

        <Card className="shadow-sm">
          <CardBody>
            {/* FILTERS */}
            <Row className="g-3 mb-3 align-items-end">
              <Col md="3">
                <label className="fw-bold mb-1">Status</label>
                <Input
                  type="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </Input>
              </Col>

              <Col md="3">
                <label className="fw-bold mb-1">Donor ID</label>
                <Input
                  type="number"
                  placeholder="ex: 12"
                  value={donorId}
                  onChange={(e) => setDonorId(e.target.value)}
                />
              </Col>

              <Col md="3">
                <label className="fw-bold mb-1">Donation ID</label>
                <Input
                  type="number"
                  placeholder="ex: 5"
                  value={donationId}
                  onChange={(e) => setDonationId(e.target.value)}
                />
              </Col>

              <Col md="3">
                <label className="fw-bold mb-1">Payment ID</label>
                <Input
                  type="number"
                  placeholder="ex: 100"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                />
              </Col>

              <Col md="6">
                <Button color="primary" className="w-100" onClick={handleSearch}>
                  Search
                </Button>
              </Col>

              <Col md="6">
                <Button color="secondary" className="w-100" onClick={handleReset}>
                  Reset
                </Button>
              </Col>
            </Row>

            {/* TABLE */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner />
                <p className="mt-2 mb-0">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <p className="text-center text-muted mb-0">
                No payments found.
              </p>
            ) : (
              <div className="table-responsive">
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Payment ID</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Razorpay Payment ID</th>
                      <th>Donor</th>
                      <th>Donation Request</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((p, index) => (
                      <tr key={p.id}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td>{p.id}</td>
                        <td>{getStatusBadge(p.status)}</td>
                        <td>₹{p.amount}</td>
                        <td>
                          {p.payment_date
                            ? new Date(p.payment_date).toLocaleString()
                            : "-"}
                        </td>
                        <td style={{ fontSize: "13px" }}>
                          {p.razorpay_payment_id || "-"}
                        </td>
                        <td>
                          <b>{p.donor_name || "-"}</b>
                          <br />
                          <small className="text-muted">
                            {p.donor_email || ""}
                          </small>
                        </td>
                        <td style={{ maxWidth: "260px" }}>
                          <div style={{ fontSize: "14px" }}>
                            {p.donation_description
                              ? p.donation_description.slice(0, 80)
                              : "-"}
                            {p.donation_description?.length > 80 ? "..." : ""}
                          </div>
                          <small className="text-muted">
                            Requested: ₹{p.donation_amount || 0}
                          </small>
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

export default PaymentList;
