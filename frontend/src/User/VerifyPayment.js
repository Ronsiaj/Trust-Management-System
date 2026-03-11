import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Spinner,
  Alert,
  Input,
  Form,
  FormGroup,
  Label,
} from "reactstrap";
import api from "../Services/api";

const Verifypayment = ({ donationId }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startPayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payAmount = Number(amount);

    if (!payAmount || payAmount <= 0) {
      setError("Enter valid amount");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Razorpay SDK failed to load. Check internet.");
        return;
      }

      // 2️⃣ Create order from backend
      const orderRes = await api.post("/user/create_order.php", {
        donation_id: donationId,
        amount: payAmount,
      });

      const orderData = orderRes.data?.data;

      if (!orderData?.order_id) {
        setError("Failed to create order");
        return;
      }

      // 3️⃣ Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Trust Donation",
        description: "Donation Payment",
        order_id: orderData.order_id,

        handler: async function (response) {
          // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }

          try {
            // 4️⃣ Verify payment using your PHP API
            const verifyRes = await api.post("/user/verify_payment.php", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verifyData = verifyRes.data?.data;

            setSuccess(
              `Payment Successful ✅ 
Donation ID: ${verifyData?.donation_id}
Paid: ₹${verifyData?.paid_amount}
Remaining: ₹${verifyData?.remaining_amount}
Status: ${verifyData?.status}`
            );

          } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Payment verification failed");
          }
        },

        theme: {
          color: "#ff7a00",
        },
      };

      // 5️⃣ Open Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg="6">
            <Card className="shadow-sm">
              <CardBody>
                <h4 className="mb-3">Donate Now</h4>

                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}

                <Form onSubmit={startPayment}>
                  <FormGroup className="mb-3">
                    <Label>Donation Amount (₹)</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      disabled={loading}
                      required
                    />
                  </FormGroup>

                  <Button color="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      "Pay with Razorpay"
                    )}
                  </Button>
                </Form>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Verifypayment;
