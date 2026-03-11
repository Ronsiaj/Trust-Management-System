import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Spinner,
  Alert,
  Badge,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import api from "../Services/api";
import { FaUserCircle } from "react-icons/fa";


const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [original, setOriginal] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.get("/user/profile.php");

      if (res.data?.success) {
        const data = res.data.data;

        setProfile(data);

        setForm({
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
        });

        setOriginal({
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
        });
      } else {
        setError(res.data?.message || "Failed to load profile");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Server error while loading profile"
      );
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setError("");
    setSuccess("");

    setForm({
      name: original.name,
      email: original.email,
      phone: original.phone,
    });

    setEditMode(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const payload = {};

    if (form.name.trim() && form.name.trim() !== original.name) {
      payload.name = form.name.trim();
    }
    if (form.email.trim() && form.email.trim() !== original.email) {
      payload.email = form.email.trim();
    }
    if (form.phone.trim() && form.phone.trim() !== original.phone) {
      payload.phone = form.phone.trim();
    }

    if (Object.keys(payload).length === 0) {
      setError("Change at least one field before updating.");
      return;
    }

    if (payload.phone && !/^[6-9]\d{9}$/.test(payload.phone)) {
      setError("Enter valid 10-digit phone number");
      return;
    }

    try {
      setSaving(true);

      const res = await api.post("/user/update.php", payload);

      setSuccess(res.data?.message || "Profile updated");

      const updatedProfile = {
        ...profile,
        ...payload,
      };

      setProfile(updatedProfile);

      setOriginal({
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
      });

      setForm({
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
      });

      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err);
      setError(
        err.response?.data?.message || "Update failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center profile-page">
        <Spinner />
        <p className="mt-2">Loading profile...</p>
      </Container>
    );
  }

  if (error && !profile) {
    return (
      <Container className="py-5 profile-page">
        <Alert color="danger">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="py-5 profile-page">
        <Alert color="warning">No profile data found</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 profile-page">
      <Row className="justify-content-center">
        <Col md="9" lg="8">
          <Card className="profile-card">
            <CardBody className="p-4">
              {/* ================= HEADER STRIP ================= */}
              <div className="profile-header-strip mb-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  {/* Left: Avatar + Name */}
                  <div className="d-flex align-items-center gap-3">
                    {/* Human Icon */}
                    <div className="profile-avatar">
                      <FaUserCircle size={30} color="orange" />
                    </div>


                    <div>
                      <h3 className="profile-name">{profile.name}</h3>
                      <p className="profile-subtext mb-0">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: Buttons */}
                  <div>
                    {!editMode ? (
                      <Button
                        color="warning"
                        className="profile-edit-btn"
                        onClick={() => setEditMode(true)}
                      >
                        Edit
                      </Button>
                    ) : (
                      <Button
                        color="secondary"
                        className="profile-edit-btn"
                        onClick={handleCancel}
                      >
                        ✖ Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= ALERTS ================= */}
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

              {/* ================= PROFILE DETAILS ================= */}
              {!editMode ? (
                <Row className="gy-3">
                  <Col md="6">
                    <div className="profile-info-box">
                      <p className="profile-info-label">Email</p>
                      <p className="profile-info-value">{profile.email}</p>
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="profile-info-box">
                      <p className="profile-info-label">Phone</p>
                      <p className="profile-info-value">
                        {profile.phone || "-"}
                      </p>
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="profile-info-box">
                      <p className="profile-info-label">Status</p>
                      <p className="profile-info-value">
                        {profile.status === "active" ? (
                          <Badge color="success">Active</Badge>
                        ) : (
                          <Badge color="secondary">{profile.status}</Badge>
                        )}
                      </p>
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="profile-info-box">
                      <p className="profile-info-label">Role</p>
                      <p className="profile-info-value">{profile.role}</p>
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="profile-info-box">
                      <p className="profile-info-label">Location</p>
                      <p className="profile-info-value">
                        {profile.location || "-"}
                      </p>
                    </div>
                  </Col>

                  <Col md="12">
                    <div className="profile-info-box">
                      <p className="profile-info-label">Description</p>
                      <p className="profile-info-value">
                        {profile.description || "-"}
                      </p>
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="profile-info-box">
                      <p className="profile-info-label">Created At</p>
                      <p className="profile-info-value">{profile.created_at}</p>
                    </div>
                  </Col>

                  <Col md="6">
                    <div className="profile-info-box">
                      <p className="profile-info-label">Updated At</p>
                      <p className="profile-info-value">{profile.updated_at}</p>
                    </div>
                  </Col>
                </Row>
              ) : (
                /* ================= EDIT MODE ================= */
                <Form onSubmit={handleUpdate}>
                  <FormGroup className="mb-3">
                    <Label className="fw-semibold">Name</Label>
                    <Input
                      className="p-3 rounded-3 border"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </FormGroup>

                  <FormGroup className="mb-3">
                    <Label className="fw-semibold">Email</Label>
                    <Input
                      className="p-3 rounded-3 border"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </FormGroup>

                  <FormGroup className="mb-3">
                    <Label className="fw-semibold">Phone</Label>
                    <Input
                      className="p-3 rounded-3 border"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </FormGroup>

                  <Button color="success" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </Form>
              )}

              {/* ================= DOCUMENTS ================= */}
              <hr className="profile-divider" />

              <h5 className="profile-section-title">
                Verification Documents
              </h5>

              {profile.photo && profile.photo.length > 0 ? (
                <div className="d-flex gap-3 flex-wrap">
                  {profile.photo.map((img, i) => (
                    <img
                      key={i}
                      src={`http://localhost/trust_site/uploads/${img}`}
                      alt="proof"
                      className="profile-proof-img"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No verification documents uploaded.
                </p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
