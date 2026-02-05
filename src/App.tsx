import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { bootstrapSession } from "./engine/authEngine"
import ProtectedRoute from "./shared/ProtectedRoute"
import RoleGate from "./shared/RoleGate"
import AuthLayout from "./layout/AuthLayout"
import Login from "./flows/auth/Login"
import RegisterCustomer from "./flows/auth/RegisterCustomer"
import RegisterOwner from "./flows/auth/RegisterOwner"
import Pending from "./flows/auth/Pending"
import Unauthorized from "./flows/auth/Unauthorized"
import OwnerApprovals from "./flows/admin/OwnerApprovals"
import AdminHome from "./flows/admin/AdminHome"
import AdminLayout from "./layout/AdminLayout"
import OwnerLayout from "./layout/OwnerLayout"
import OwnerHome from "./flows/owner/OwnerHome"
import OwnerTurfs from "./flows/owner/OwnerTurfs"
import OwnerTurfManage from "./flows/owner/OwnerTurfManage"
import EditTurfPage from "./flows/owner/EditTurfPage"
import Toasts from "./components/Toast"
import ManageTurfImages from "./flows/owner/ManageTurfImages"
import TurfSchedule from "./flows/owner/TurfSchedule"
import OwnerTurfSlots from "./flows/owner/OwnerTurfSlots"
import CustomerLayout from "./layout/CustomerLayout"
import CustomerTurfDetails from "./flows/customer/TurfDetails"
import CustomerDashboard from "./flows/customer/dashboard"
import CustomerBookingReview from "./flows/customer/CustomerBookingReview"
import PaymentSuccess from "./flows/customer/PaymentSuccess"
import PaymentFailed from "./flows/customer/PaymentFailed"
import BookingDetails from "./flows/customer/BookingDetails"
import MyBookings from "./flows/customer/Mybookings"
import OwnerBookingsList from "./flows/owner/BookingList"
import OwnerBookingDetails from "./flows/owner/OwnerBookingDetails"
import OwnerProfile from "./flows/owner/OwnerProfile"
import OwnerEarnings from "./flows/owner/Earnings"
import PayoutBatchDetails from "./flows/admin/PayoutBatchDetails"
import AdminPayoutsList from "./flows/admin/PayoutList"
import PayoutExecutionDetails from "./flows/admin/PayoutExecutionDetails"
import CustomerProfile from "./flows/customer/CustomerProfile"
import ForgotPassword from "./flows/auth/ForgotPassword"
import ResetPassword from "./flows/auth/ResetPassword" 

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    bootstrapSession().finally(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <BrowserRouter>
    <Toasts/>
      <Routes>

        {/* AUTH WORLD */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register/customer" element={<RegisterCustomer />} />
          <Route path="/auth/register/owner" element={<RegisterOwner />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/pending" element={<Pending />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
      
        {/* PROTECTED WORLD */}
       <Route element={<ProtectedRoute />}>

        <Route element={<RoleGate allow={["CUSTOMER"]} />}>
        <Route path="/app/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard/>}/>
          <Route path="turfs/:turfId" element={<CustomerTurfDetails/>}/>
          <Route path="booking/review" element={<CustomerBookingReview/>}/>
           <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-failed" element={<PaymentFailed />} />
             <Route path="bookings" element={<MyBookings />} />
    <Route path="bookings/:bookingId" element={<BookingDetails />} />
    <Route path="profile" element={<CustomerProfile/>}/>     
  </Route>
</Route>
    <Route element={<RoleGate allow={["OWNER"]} />}>
      <Route path="/app/owner" element={<OwnerLayout/>}>
        <Route index element={<OwnerHome />} />
        <Route path="turfs" element={<OwnerTurfs/>}/>
        <Route path="turfs/:turfId" element={<OwnerTurfManage/>}/>
        <Route path="turfs/:turfId/edit" element={<EditTurfPage/>}/>
        <Route path="turfs/:turfId/images" element={<ManageTurfImages/>}/>
        <Route path="turfs/:turfId/schedule" element={<TurfSchedule/>}/>
        <Route path="turfs/:turfId/slots" element={<OwnerTurfSlots/>}/>
        <Route path="bookings" element={<OwnerBookingsList />} />
        <Route path="booking-details/:bookingId" element={<OwnerBookingDetails />} />
          <Route path="earnings" element={<OwnerEarnings />} /> 
        <Route path="profile" element={<OwnerProfile/>}/>
      </Route>
    </Route>

        <Route element={<RoleGate allow={["ADMIN"]} />}>
          <Route path="/app/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="owners" element={<OwnerApprovals />} />
            <Route path="payouts" element={<AdminPayoutsList />} />
<           Route path="payouts/:batchId" element={<PayoutBatchDetails />} />
<Route path="payouts/executions/:executionId" element={<PayoutExecutionDetails />} />
          </Route>
        </Route>

    </Route>


        {/* FALLBACK */}
        <Route path="*" element={<Unauthorized />} />

      </Routes>
    </BrowserRouter>
  )
}