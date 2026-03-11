import { Routes, Route } from "react-router-dom";

/* Layouts */
import PublicLayout from "../Partials/PublicLayout";
import AdminLayout from "../Partials/AdminLayout";

/* Public */
import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";
import Publicview from "../Publicview";

/* USER */
import Profile from "../User/Profile";
import DonationRequest from "../User/DonationRequest";
import DonationRequestList from "../User/DonationRequestList";
import Donate from "../User/Donate";
import UserPaymentList from "../User/UserPaymentList";
import VerifyPayment from "../User/VerifyPayment";

/* ADMIN */
import ReviewDonationRequest from "../Admin/ReviewDonationRequest";
import Dashboard from "../Admin/Dashboard";
import EmailStatus from "../Admin/EmailStatus";
import ActivateUser from "../Admin/ActivateUser";
import PaymentList from "../Admin/PaymentList";
import UserList from "../Admin/UserList";

/* PAGES */
import Home from "../Pages/Home";
import About from "../Pages/About";
import Contact from "../Pages/Contact";
import Gallery from "../Pages/Gallery";
import Donators from "../Pages/Donators";

/* ROUTE GUARDS */
import PublicRouters from "./PublicRouter";
import AdminRoute from "./AdminRoute";
import PrivateRouter from "./PrivateRouter";

const Routers = () => {
  return (
    <Routes>
      {/* ================= PUBLIC + USER LAYOUT ================= */}
      <Route element={<PublicLayout />}>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/publicview" element={<Publicview />} />
        <Route path="/donators" element={<Donators />} />

        {/* AUTH */}
        <Route element={<PublicRouters />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* LOGIN REQUIRED (USER + DONOR) */}
        <Route element={<PrivateRouter />}>
          <Route path="/request" element={<DonationRequest />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/verify-payment" element={<VerifyPayment />} />

          <Route path="/my-requests" element={<DonationRequestList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-payments" element={<UserPaymentList />} />
        </Route>
      </Route>

      {/* ================= ADMIN LAYOUT (NO HEADER/FOOTER) ================= */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/review" element={<ReviewDonationRequest />} />
          <Route path="/payment-list" element={<PaymentList />} />
          <Route path="/userlist" element={<UserList />} />
          <Route path="/email-status" element={<EmailStatus />} />
          <Route path="/activate-user" element={<ActivateUser />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Routers;
