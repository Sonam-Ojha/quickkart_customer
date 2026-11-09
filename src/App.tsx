import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import ScrollToTop from '@/components/layout/ScrollToTop'
import StorefrontSync from '@/components/layout/StorefrontSync'
import Toast from '@/components/ui/Toast'
import GlobalLoginModal from '@/components/layout/GlobalLoginModal'

// Login is needed immediately on cold load — keep eager
import LoginPage from '@/features/auth/LoginPage'

// All other routes are lazy — each lands in its own chunk.
// Leaflet (~150 KB) only loads when OrderTrackingPage is visited.
const HomePage          = lazy(() => import('@/features/home/HomePage'))
const CategoryPage      = lazy(() => import('@/features/category/CategoryPage'))
const ProductDetailPage = lazy(() => import('@/features/product/ProductDetailPage'))
const CartPage          = lazy(() => import('@/features/cart/CartPage'))
const CheckoutPage      = lazy(() => import('@/features/checkout/CheckoutPage'))
const PrintPage         = lazy(() => import('@/features/print/PrintPage'))
const SearchPage        = lazy(() => import('@/features/search/SearchPage'))
const InfoPage          = lazy(() => import('@/features/info/InfoPage'))
const OrdersPage        = lazy(() => import('@/features/orders/OrdersPage'))
const OrderTrackingPage = lazy(() => import('@/features/orders/OrderTrackingPage'))
const ProfilePage       = lazy(() => import('@/features/profile/ProfilePage'))
const SupportPage       = lazy(() => import('@/features/support/SupportPage'))
const AddressesPage     = lazy(() => import('@/features/addresses/AddressesPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <StorefrontSync />
      <Toast />
      <GlobalLoginModal />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Login — outside AppShell */}
          <Route path="/login" element={<LoginPage />} />
          {/* Checkout — outside AppShell (no navbar distraction) */}
          <Route path="/checkout" element={<CheckoutPage />} />

          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home"            element={<HomePage />} />
            <Route path="/category"        element={<CategoryPage />} />
            <Route path="/category/:id"    element={<CategoryPage />} />
            <Route path="/product/:id"     element={<ProductDetailPage />} />
            <Route path="/search"          element={<SearchPage />} />
            <Route path="/print"           element={<PrintPage />} />
            <Route path="/cart"            element={<CartPage />} />
            <Route path="/orders"          element={<OrdersPage />} />
            <Route path="/orders/:id"      element={<OrderTrackingPage />} />
            <Route path="/profile"         element={<ProfilePage />} />
            <Route path="/info/:slug"      element={<InfoPage />} />
            <Route path="/support"         element={<SupportPage />} />
            <Route path="/addresses"       element={<AddressesPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
