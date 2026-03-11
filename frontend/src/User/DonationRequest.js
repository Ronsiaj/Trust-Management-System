import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Alert,
} from "reactstrap";
import api from "../Services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DonationRequest = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    description: "",
    amount: "",
    upi_id: "",
    bank_account_number: "",
    ifsc: "",
    phone: "",
    location: "",
  });

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Global messages (top alert)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Field-wise errors
  const [fieldErrors, setFieldErrors] = useState({});

  /* ===================== Input Change ===================== */
  const handleChange = (e) => {
    setError("");
    setSuccess("");

    // clear field error when user types
    setFieldErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));

    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===================== Photo Change ===================== */
  const handlePhotoChange = (e) => {
    setError("");
    setSuccess("");

    // clear photo field error
    setFieldErrors((prev) => ({
      ...prev,
      photos: "",
    }));

    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      setPhotos([]);
      setPhotoPreviews([]);
      return;
    }

    if (files.length > 3) {
      setError("Maximum 3 photos only");
      setFieldErrors((prev) => ({
        ...prev,
        photos: "Maximum 3 photos only",
      }));
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    for (let f of files) {
      if (!allowedTypes.includes(f.type)) {
        setError("Only JPG / JPEG / PNG images allowed");
        setFieldErrors((prev) => ({
          ...prev,
          photos: "Only JPG / JPEG / PNG images allowed",
        }));
        return;
      }

      if (f.size > 10 * 1024 * 1024) {
        toast.error(`"${f.name}" is larger than 10MB`);

        setError("Each image must be below 10MB");
        setFieldErrors((prev) => ({
          ...prev,
          photos: "Each image must be below 10MB",
        }));

        e.target.value = "";
        setPhotos([]);
        setPhotoPreviews([]);
        return;
      }
    }

    setPhotos(files);

    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  /* ===================== Submit ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setFieldErrors({});

    let newErrors = {};

    // Required fields
    const requiredFields = [
      "description",
      "amount",
      "upi_id",
      "bank_account_number",
      "ifsc",
      "phone",
      "location",
    ];

    requiredFields.forEach((f) => {
      if (!form[f] || String(form[f]).trim() === "") {
        newErrors[f] = "This field is required";
      }
    });

    // Phone validation
    const phone = String(form.phone || "").trim();
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = "Enter valid 10-digit phone number";
    }

    // Amount validation
    if (form.amount && Number(form.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    // Photos validation
    if (!photos || photos.length < 1) {
      newErrors.photos = "At least 1 photo required";
    }

    if (photos.length > 3) {
      newErrors.photos = "Maximum 3 photos only";
    }

    // If any errors -> show them
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError("Please fix the highlighted errors.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("description", form.description);
      fd.append("amount", form.amount);
      fd.append("upi_id", form.upi_id);
      fd.append("bank_account_number", form.bank_account_number);
      fd.append("ifsc", form.ifsc);
      fd.append("phone", phone);
      fd.append("location", form.location);

      photos.forEach((file) => {
        fd.append("photos[]", file);
      });

      const res = await api.post("/user/donation_request.php", fd);

      setSuccess(
        res.data?.message ||
          "Donation request submitted. Waiting for admin review."
      );

      toast.success("Request submitted successfully!");

      // Reset form
      setForm({
        description: "",
        amount: "",
        upi_id: "",
        bank_account_number: "",
        ifsc: "",
        phone: "",
        location: "",
      });

      setPhotos([]);
      setPhotoPreviews([]);
      setFieldErrors({});

      setTimeout(() => navigate("/my-requests"), 1500);
    } catch (err) {
      console.error("Donation request error:", err);

      const msg =
        err.response?.data?.message ||
        "Failed to submit request. Please try again.";

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-request-page">
      {/* HERO */}
      <section className="page-hero">
        <div className="container">
          <h1>Donation Request Form</h1>
          <p>
            Submit your request with supporting photos. Our team will review it
          </p>
        </div>
      </section>

      {/* FORM */}
      <section style={{ padding: "40px 0" }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg="8">
              <Card className="shadow-sm">
                <CardBody>
                  <h4 className="mb-3">Donation Request Form</h4>

                  {/* Top Alert (global) */}
                  {error && (
                    <Alert color="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert color="success" className="mb-3">
                      {success}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    {/* DESCRIPTION */}
                    <FormGroup className="mb-3">
                      <Label>Description *</Label>
                      <Input
                        type="textarea"
                        name="description"
                        rows="4"
                        placeholder="Explain your situation clearly..."
                        value={form.description}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        invalid={!!fieldErrors.description}
                      />
                      {fieldErrors.description && (
                        <small className="text-danger">
                          {fieldErrors.description}
                        </small>
                      )}
                    </FormGroup>

                    <Row>
                      {/* AMOUNT */}
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label>Amount (₹) *</Label>
                          <Input
                            type="number"
                            name="amount"
                            placeholder="Requested amount"
                            value={form.amount}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            invalid={!!fieldErrors.amount}
                          />
                          {fieldErrors.amount && (
                            <small className="text-danger">
                              {fieldErrors.amount}
                            </small>
                          )}
                        </FormGroup>
                      </Col>

                      {/* PHONE */}
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label>Phone *</Label>
                          <Input
                            type="tel"
                            name="phone"
                            placeholder="10-digit phone"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            invalid={!!fieldErrors.phone}
                          />
                          {fieldErrors.phone && (
                            <small className="text-danger">
                              {fieldErrors.phone}
                            </small>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>

                    {/* LOCATION */}
                    <FormGroup className="mb-3">
                      <Label>Location *</Label>
                      <Input
                        type="text"
                        name="location"
                        placeholder="City / District"
                        value={form.location}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        invalid={!!fieldErrors.location}
                      />
                      {fieldErrors.location && (
                        <small className="text-danger">
                          {fieldErrors.location}
                        </small>
                      )}
                    </FormGroup>

                    <Row>
                      {/* UPI */}
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label>UPI ID *</Label>
                          <Input
                            type="text"
                            name="upi_id"
                            placeholder="example@upi"
                            value={form.upi_id}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            invalid={!!fieldErrors.upi_id}
                          />
                          {fieldErrors.upi_id && (
                            <small className="text-danger">
                              {fieldErrors.upi_id}
                            </small>
                          )}
                        </FormGroup>
                      </Col>

                      {/* IFSC */}
                      <Col md="6">
                        <FormGroup className="mb-3">
                          <Label>IFSC Code *</Label>
                          <Input
                            type="text"
                            name="ifsc"
                            placeholder="Bank IFSC"
                            value={form.ifsc}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            invalid={!!fieldErrors.ifsc}
                          />
                          {fieldErrors.ifsc && (
                            <small className="text-danger">
                              {fieldErrors.ifsc}
                            </small>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>

                    {/* BANK ACCOUNT */}
                    <FormGroup className="mb-3">
                      <Label>Bank Account Number *</Label>
                      <Input
                        type="text"
                        name="bank_account_number"
                        placeholder="Account number"
                        value={form.bank_account_number}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        invalid={!!fieldErrors.bank_account_number}
                      />
                      {fieldErrors.bank_account_number && (
                        <small className="text-danger">
                          {fieldErrors.bank_account_number}
                        </small>
                      )}
                    </FormGroup>

                    {/* PHOTOS */}
                    <FormGroup className="mb-3">
                      <Label>
                        Upload Photos * (min 1, max 3, jpg/jpeg/png, ≤ 10MB)
                      </Label>

                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png"
                        onChange={handlePhotoChange}
                        disabled={loading}
                        className="form-control"
                      />

                      {fieldErrors.photos && (
                        <small className="text-danger">
                          {fieldErrors.photos}
                        </small>
                      )}
                    </FormGroup>

                    {/* PREVIEW */}
                    {photoPreviews.length > 0 && (
                      <div className="mb-3">
                        <Label className="fw-bold">Preview:</Label>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {photoPreviews.map((src, index) => (
                            <img
                              key={index}
                              src={src}
                              alt="preview"
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "12px",
                                border: "1px solid #eee",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <Button color="primary" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>

                    <p className="text-muted mt-3 mb-0">
                      After submitting, your request will be marked as{" "}
                      <b>pending</b> until admin approves.
                    </p>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default DonationRequest;
