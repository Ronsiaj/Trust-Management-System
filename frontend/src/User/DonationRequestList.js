import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Table,
  Badge,
  Button,
  Spinner,
} from "reactstrap";
import api from "../Services/api";

const MyRequests = () => {
  const [list, setList] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD LIST ================= */
  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [page]);

  const fetchRequests = async () => {
    setLoading(true);

    try {
      const res = await api.get("/user/donation_request_list.php", {
        params: {
          page,
          limit: 10,
        },
      });

      const data = res.data?.data;

      setList(data?.list || []);
      setPagination(
        data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          total_pages: 1,
        }
      );
    } catch (err) {
      console.error("My requests error:", err);
      alert(err.response?.data?.message || "Failed to load my requests");
      setList([]);
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

  /* ================= PHOTO VIEW ================= */
  const getPhotos = (photoString) => {
    if (!photoString) return [];
    return photoString.split(",").map((x) => x.trim());
  };

  return (
    <div className="donation-request-list-page">
      {/* HERO */}
      <section className="page-hero">
        <div className="container">
          <h1>My Requests</h1>
          <p>Here you can see only the donation requests you created.</p>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ padding: "40px 0" }}>
        <Container>
          <Card className="shadow-sm">
            <CardBody>
              {/* TABLE */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spinner color="primary" />
                  <p className="mt-3 mb-0">Loading your requests...</p>
                </div>
              ) : list.length === 0 ? (
                <p className="text-center text-muted mb-0">
                  You have not created any donation requests yet.
                </p>
              ) : (
                <div className="table-responsive">
                  <Table bordered hover>
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Photos</th>
                        <th>Created</th>
                      </tr>
                    </thead>

                    <tbody>
                      {list.map((item, index) => {
                        const photos = getPhotos(item.photo);

                        return (
                          <tr key={item.id}>
                            <td>{(page - 1) * 10 + index + 1}</td>

                            <td>{getStatusBadge(item.status)}</td>

                            <td style={{ minWidth: "240px" }}>
                              {item.description}
                            </td>

                            <td>₹{item.amount}</td>

                            <td>{item.phone}</td>

                            <td>{item.location}</td>

                            <td style={{ minWidth: "220px" }}>
                              {photos.length === 0 ? (
                                <span className="text-muted">No photos</span>
                              ) : (
                                <div className="d-flex flex-wrap gap-2">
                                  {photos.slice(0, 3).map((img, i) => (
                                    <a
                                      key={i}
                                      href={`http://localhost/trust_site/uploads/${img}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <img
                                        src={`http://localhost/trust_site/uploads/${img}`}
                                        alt="proof"
                                        style={{
                                          width: "60px",
                                          height: "60px",
                                          objectFit: "cover",
                                          borderRadius: "10px",
                                          border: "1px solid #eee",
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </td>

                            <td style={{ minWidth: "170px" }}>
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString()
                                : "-"}
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

export default MyRequests;
