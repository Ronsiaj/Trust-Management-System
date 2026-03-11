import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Spinner,
  Badge,
  Input
} from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../Services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [donationChart, setDonationChart] = useState([]);

  const [period, setPeriod] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard.php", {
        params: {
          period,
          fromDate: formatDate(fromDate),
          toDate: formatDate(toDate)
        }
      });
      const data = res.data?.data;
      setStats(data?.stats);
      setRecentRequests(data?.recent_requests);
      setRecentPayments(data?.recent_payments);
      setDonationChart(data?.donation_chart);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period, fromDate, toDate]);

  return (
    <Container fluid className="py-4">
      <h4>Dashboard</h4>

      {/* Filter */}
      <Row className="mb-3 align-items-end">
        <Col md={3}>
          <label>Period</label>
          <Input type="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="">All</option>
            <option value="today">Today</option>
            <option value="last_3_days">Last 3 Days</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_year">Last Year</option>
            <option value="custom">Custom Range</option>
          </Input>
        </Col>

        {period === "custom" && (
          <>
            <Col md={3}>
              <label>From Date</label>
              <DatePicker
                selected={fromDate}
                onChange={setFromDate}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                maxDate={new Date()}
              />
            </Col>

            <Col md={3}>
              <label>To Date</label>
              <DatePicker
                selected={toDate}
                onChange={setToDate}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                minDate={fromDate}
                maxDate={new Date()}
              />
            </Col>
          </>
        )}
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="dash-card dash-orange">
                <CardBody>
                  <div className="dash-card-icon">₹</div>
                  <h6 className="dash-card-title">Total Donations</h6>
                  <h3 className="dash-card-value">
                    ₹{Number(stats?.total_donations_received || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </CardBody>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="dash-card dash-green">
                <CardBody>
                  <div className="dash-card-icon">💳</div>
                  <h6 className="dash-card-title">Total Payments</h6>
                  <h3 className="dash-card-value">
                    {stats?.total_payments || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="dash-card dash-orange">
                <CardBody>
                  <div className="dash-card-icon">📌</div>
                  <h6 className="dash-card-title">Total Requests</h6>
                  <h3 className="dash-card-value">
                    {stats?.requests?.total || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="dash-card dash-green">
                <CardBody>
                  <div className="dash-card-icon">🏁</div>
                  <h6 className="dash-card-title">Completed Requests</h6>
                  <h3 className="dash-card-value">
                    {stats?.requests?.completed || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* ✅ New Row: Pending / Approved / Rejected */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="dash-card dash-orange">
                <CardBody>
                  <div className="dash-card-icon">⏳</div>
                  <h6 className="dash-card-title">Pending Requests</h6>
                  <h3 className="dash-card-value">
                    {stats?.requests?.pending || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="dash-card dash-green">
                <CardBody>
                  <div className="dash-card-icon">✅</div>
                  <h6 className="dash-card-title">Approved Requests</h6>
                  <h3 className="dash-card-value">
                    {stats?.requests?.approved || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="dash-card dash-orange">
                <CardBody>
                  <div className="dash-card-icon">❌</div>
                  <h6 className="dash-card-title">Rejected Requests</h6>
                  <h3 className="dash-card-value">
                    {stats?.requests?.rejected || 0}
                  </h3>
                </CardBody>
              </Card>
            </Col>
          </Row>


          {/* Donations chart */}
          <Row className="mb-4">
            <Col>
              <Card><CardBody>
                <h6>Donations Over Time</h6>
                {donationChart.length === 0 ? (
                  <p>No data</p>
                ) : (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={donationChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#ff7a00" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardBody></Card>
            </Col>
          </Row>

          {/* Recent Payments */}
          <Card><CardBody>
            <h6>Recent Payments</h6>
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Donation ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Razorpay ID</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.donation_id}</td>
                    <td>₹{Number(p.amount).toLocaleString()}</td>
                    <td>
                      {p.status === "success" ? <Badge color="success">Success</Badge> :
                        <Badge color="danger">Failed</Badge>}
                    </td>
                    <td>{p.razorpay_payment_id}</td>
                    <td>{p.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody></Card>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
