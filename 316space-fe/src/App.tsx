import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import SiteLayout from './components/SiteLayout'
import EquipmentRentalPage from './pages/EquipmentRentalPage'
import GuidePage from './pages/GuidePage'
import BookingPage from './pages/BookingPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import PriceInfoPage from './pages/PriceInfoPage'
import ReviewEventPage from './pages/ReviewEventPage'
import SpecialOffersPage from './pages/SpecialOffersPage'
import StudioPage from './pages/StudioPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SiteLayout />}>
        <Route index element={<Navigate to="/guide" replace />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="price-info" element={<Navigate to="/price-information" replace />} />
        <Route path="price-information" element={<PriceInfoPage />} />
        <Route path="equipment-rental" element={<EquipmentRentalPage />} />
        <Route path="review-event" element={<ReviewEventPage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="studio" element={<StudioPage />} />
        <Route path="special-offers" element={<SpecialOffersPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/guide" replace />} />
      </Route>
    </Routes>
  )
}
