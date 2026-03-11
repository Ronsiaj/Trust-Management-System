import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  Spinner,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import api from "../Services/api";

const Donate = () => {
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 9;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit,
    total: 0,
    total_pages: 1,
  });

  // Modal
  const [payModal, setPayModal] = useState(false);

  /* ================= LOAD DONATIONS ================= */
  useEffect(() => {
    fetchApprovedDonations();
    // eslint-disable-next-line
  }, [page]);

  const fetchApprovedDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/donation_request_list.php", {
        params: {
          status: "approved", // ✅ always only approved for donors
          page,
          limit,
          mode:"donate"
        },
      });

      const data = res.data?.data;

      setDonations(data?.list || []);
      setPagination(
        data?.pagination || {
          page: 1,
          limit,
          total: 0,
          total_pages: 1,
        }
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load donation requests");
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (s) => {
    if (s === "approved") return <Badge color="success">Approved</Badge>;
    if (s === "rejected") return <Badge color="danger">Rejected</Badge>;
    if (s === "completed") return <Badge color="primary">Completed</Badge>;
    return <Badge color="warning">Pending</Badge>;
  };

  /* ================= PHOTO PARSE ================= */
  const getPhotos = (photoString) => {
    if (!photoString) return [];
    return photoString.split(",").map((x) => x.trim());
  };

  /* ================= SELECT DONATION ================= */
  const handleSelectDonation = (d) => {
    setSelectedDonation(d);
    setAmount("");
    setPayModal(true);
  };

  /* ================= PAY NOW ================= */
  const handlePayNow = async () => {
    if (!selectedDonation) {
      alert("Select a donation request first");
      return;
    }

    const payAmount = Number(amount);

    if (!payAmount || payAmount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay script not loaded. Check index.html");
      return;
    }

    setPayLoading(true);

    try {
      // 1) Create order
      const orderRes = await api.post("/user/donate.php", {
        donation_id: selectedDonation.id,
        amount: payAmount,
      });

      const orderData = orderRes.data?.data;

      if (!orderData?.order_id) {
        alert("Order creation failed");
        return;
      }

      // 2) Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Helping Hands Trust",
        description: selectedDonation.description || "",
        order_id: orderData.order_id,

        handler: async function (response) {
          try {
            const verifyRes = await api.post("/user/verify_payment.php", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert(verifyRes.data?.message || "Payment success!");

            setAmount("");
            setSelectedDonation(null);
            setPayModal(false);

            // refresh list
            fetchApprovedDonations();
          } catch (err) {
            console.error(err);
            alert(
              err.response?.data?.message ||
              "Payment verification failed. Contact admin."
            );
          }
        },

        theme: {
          color: "#0d6efd",
        },
      };

      // 3) Open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="donate-page">
      <section className="page-hero">
        <div className="container">
          <h1>Donate</h1>
          <p>Approved requests only will be shown here.</p>
        </div>
      </section>

      <section style={{ padding: "40px 0" }}>
        <Container>
          <Card className="shadow-sm">
            <CardBody>
              {/* LIST */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <Spinner />
                  <p className="mt-2 mb-0">Loading requests...</p>
                </div>
              ) : donations.length === 0 ? (
                <p className="text-center text-muted mb-0">
                  No approved donation requests found.
                </p>
              ) : (
                <Row className="g-3">
                  {donations.map((d) => {
                    const photos = getPhotos(d.photo);
                    const mainPhoto = photos?.[0];

                    return (
                      <Col md="6" lg="4" key={d.id}>
                        <Card className="h-100 shadow-sm">
                          {/* ✅ MAIN IMAGE TOP */}
                          {mainPhoto && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                paddingTop: "15px",
                              }}
                            >
                              <img
                                src={`http://localhost/trust_site/uploads/${mainPhoto}`}
                                alt="proof"
                                style={{
                                  width: "180px",
                                  height: "180px",
                                  objectFit: "cover",
                                  borderRadius: "15px",
                                  border: "1px solid #eee",
                                }}
                              />
                            </div>
                          )}

                          <CardBody>
                            <div className="d-flex justify-content-between align-items-center">
                              <h5 className="mb-0"> {d.id}</h5>
                              {getStatusBadge(d.status)}
                            </div>

                            <p className="mt-2 text-muted">
                              {(d.description || "").slice(0, 120)}
                              {(d.description || "").length > 120 ? "..." : ""}
                            </p>

                            <p className="mb-1">
                              <b>Amount:</b> ₹{d.amount}
                            </p>

                            <p className="mb-1">
                              <b>Location:</b> {d.location || "-"}
                            </p>

                            {/* ✅ SMALL THUMBNAILS */}
                            {photos.length >= 1 && (
                              <div className="d-flex justify-content-center gap-2 flex-wrap mt-3">
                                {photos.slice(0, 3).map((img, i) => (
                                  <img
                                    key={i}
                                    src={`http://localhost/trust_site/uploads/${img}`}
                                    alt="proof"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      borderRadius: "10px",
                                      border: "1px solid #eee",
                                    }}
                                  />
                                ))}
                              </div>
                            )}


                            {/* SELECT BUTTON */}
                            <div className="mt-3">
                              <Button
                                color="primary"
                                size="sm"
                                className="w-100"
                                onClick={() => handleSelectDonation(d)}
                              >
                                Donate Now
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}

              {/* PAGINATION */}
              {pagination.total_pages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
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
              )}
            </CardBody>
          </Card>
        </Container>
      </section>

      {/* ✅ PAYMENT MODAL */}
      <Modal isOpen={payModal} toggle={() => setPayModal(false)} centered>
        <ModalHeader toggle={() => setPayModal(false)}>
          Confirm Donation
        </ModalHeader>

        <ModalBody>
          {selectedDonation && (
            <>
              <p className="mb-2">
                <b>Request ID:</b> #{selectedDonation.id}
              </p>

              <p className="mb-2">
                <b>Description:</b> {selectedDonation.description}
              </p>

              <p className="mb-2">
                <b>Requested Amount:</b> ₹{selectedDonation.amount}
              </p>

              <p className="mb-3">
                <b>Location:</b> {selectedDonation.location || "-"}
              </p>

              <label className="fw-bold mb-1">Enter Amount (₹)</label>
              <Input
                type="number"
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={payLoading}
              />
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setPayModal(false)}
            disabled={payLoading}
          >
            Cancel
          </Button>

          <Button color="success" onClick={handlePayNow} disabled={payLoading}>
            {payLoading ? (
              <>
                <Spinner size="sm" /> Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Donate;
