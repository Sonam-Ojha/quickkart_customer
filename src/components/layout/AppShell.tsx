import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import ActiveOrderBar from './ActiveOrderBar'
import FestivalOnceOverlay from '@/features/festival/FestivalOnceOverlay'
import FestivalPageWash from '@/features/festival/FestivalPageWash'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-appBackground flex flex-col">
      <Navbar />
      <main className="flex-1 relative isolate">
        <FestivalPageWash />
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ActiveOrderBar />
      <FestivalOnceOverlay />
    </div>
  )
}
