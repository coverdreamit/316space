import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import SiteLayout from './components/SiteLayout'
import AboutPage from './pages/AboutPage'
import BookingPage from './pages/BookingPage'
import ContactPage from './pages/ContactPage'
import FloorplanPage from './pages/FloorplanPage'
import HomePage from './pages/HomePage'
import SpecialOffersPage from './pages/SpecialOffersPage'
import StudioPage from './pages/StudioPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="studio" element={<StudioPage />} />
        <Route path="floorplan" element={<FloorplanPage />} />
        <Route path="special-offers" element={<SpecialOffersPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
