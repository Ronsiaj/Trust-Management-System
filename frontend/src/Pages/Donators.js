import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardBody,
  Spinner,
  Table,
  Badge,
} from "reactstrap";
import api from "../Services/api";

const Donators = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/donators.php", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      setList(res.data?.data?.list || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load donators list");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const getFirstPhoto = (photoString) => {
    if (!photoString) return "";
    return photoString.split(",")[0].trim();
  };

  return (
    <div className="donators-page">
      <section className="page-hero">
        <div className="container">
          <h1>Donation Testimonials</h1>
          <p>Read stories from donors and beneficiaries of our trust.</p>
        </div>
      </section>

      <section style={{ padding: "40px 0" }}>
        <Container>
          <Card className="shadow-sm">
            <CardBody>
              {loading ? (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                  <Spinner />
                  <p className="mt-2 mb-0">Loading...</p>
                </div>
              ) : list.length === 0 ? (
                <p className="text-center text-muted mb-0">
                  No donations made yet.
                </p>
              ) : (
                <Table responsive bordered hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th><center>S.No.</center></th>
                      <th><center>Donator Name</center></th>
                      <th><center>Amount</center></th>
                      <th><center>Description</center></th>
                      <th><center>Location</center></th>
                      <th><center>Photo</center></th>
                    
                    </tr>
                  </thead>

                  <tbody>
                    {list.map((d, index) => {
                      const firstPhoto = getFirstPhoto(d.photo);

                      return (
                        <tr key={d.id}>
                          <td>{index + 1}</td>

                          <td>
                            {d.donor_name || "-"}
                          </td>

                          <td>
                            {d.donated_amount || 0}
                          </td>

                          <td style={{ maxWidth: "250px" }}>
                            {(d.description || "").slice(0, 80)}
                            {(d.description || "").length > 80 ? "..." : ""}
                          </td>

                          <td>{d.location || "-"}</td>

                          <td>
                            {firstPhoto ? (
                              <img
                                src={`http://localhost/trust_site/uploads/${firstPhoto}`}
                                alt="proof"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                  borderRadius: "10px",
                                  border: "1px solid #ddd",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-muted">No Photo</span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Container>
      </section>
    </div>
  );
};

export default Donators;
