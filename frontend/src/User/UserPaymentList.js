import { useEffect, useState } from "react";
import { Container,Row,Col,Card,CardBody,Table,Button,Input,Spinner,Badge, } from "reactstrap";
import api from "../Services/api";

const MyPayments = () => {
  const [list, setList] = useState([]);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);

  // Since backend not giving total_pages, we detect next availability
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line
  }, [page]);

  /* ================= LOAD PAYMENTS ================= */
  const fetchPayments = async () => {
    setLoading(true);

    try {
      const res = await api.get("/user/user_payment_list.php", {
        params: {
          page,
          from: from && to ? from : undefined,
          to: from && to ? to : undefined,
        },
      });

      const data = res.data?.data;
      const payments = data?.list || [];

      setList(payments);

      // if 10 records came, assume next page exists
      setHasNext(payments.length === limit);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load payments");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= APPLY FILTER ================= */
  const applyFilter = () => {
    if ((from && !to) || (!from && to)) {
      alert("Select both From and To date");
      return;
    }

    setPage(1);
    fetchPayments();
  };

  const resetFilter = () => {
    setFrom("");
    setTo("");
    setPage(1);
    setTimeout(fetchPayments, 50);
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (s) => {
    if (s === "success") return <Badge color="success">Success</Badge>;
    if (s === "failed") return <Badge color="danger">Failed</Badge>;
    return <Badge color="secondary">{s}</Badge>;
  };

  return (
    <div className="my-payments-page">
      {/* HERO */}
      <section className="page-hero">
        <div className="container">
          <h1>My Payments</h1>
          <p>View your donation history and completed transactions.</p>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ padding: "40px 0" }}>
        <Container>
          <Card className="shadow-sm">
            <CardBody>
              {/* FILTER */}
              <Row className="g-3 align-items-end mb-3">
                <Col md="4">
                  <label className="fw-bold mb-1">From Date</label>
                  <Input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    disabled={loading}
                  />
                </Col>

                <Col md="4">
                  <label className="fw-bold mb-1">To Date</label>
                  <Input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    disabled={loading}
                  />
                </Col>

                <Col md="2">
                  <Button
                    color="primary"
                    className="w-100"
                    onClick={applyFilter}
                    disabled={loading}
                  >
                    Filter
                  </Button>
                </Col>

                <Col md="2">
                  <Button
                    color="secondary"
                    className="w-100"
                    onClick={resetFilter}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </Col>
              </Row>

              {/* TABLE */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spinner color="primary" />
                  <p className="mt-3 mb-0">Loading payments...</p>
                </div>
              ) : list.length === 0 ? (
                <p className="text-center text-muted mb-0">
                  No payments found.
                </p>
              ) : (
                <div className="table-responsive">
                  <Table bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Status</th>
                        <th>Donation ID</th>
                        <th>Amount</th>
                        <th>Payment Date</th>
                        <th>Razorpay Payment ID</th>
                        <th>Created</th>
                      </tr>
                    </thead>

                    <tbody>
                      {list.map((p, index) => (
                        <tr key={p.id}>
                          <td>{(page - 1) * limit + index + 1}</td>

                          <td>{getStatusBadge(p.status)}</td>

                          <td>#{p.donation_id}</td>

                          <td>₹{p.amount}</td>

                          <td>
                            {p.payment_date
                              ? new Date(p.payment_date).toLocaleDateString()
                              : "-"}
                          </td>

                          <td style={{ minWidth: "260px" }}>
                            <code>{p.razorpay_payment_id}</code>
                          </td>

                          <td style={{ minWidth: "180px" }}>
                            {p.created_at
                              ? new Date(p.created_at).toLocaleString()
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
                  Page: <b>{page}</b> | Limit: <b>{limit}</b>
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
                    disabled={!hasNext || loading}
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

export default MyPayments;
