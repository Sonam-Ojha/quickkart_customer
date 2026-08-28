import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import HomePage from '@/features/home/HomePage'
import CategoryPage from '@/features/category/CategoryPage'
import ProductDetailPage from '@/features/product/ProductDetailPage'
import CartPage from '@/features/cart/CartPage'
import CheckoutPage from '@/features/checkout/CheckoutPage'
import PrintPage from '@/features/print/PrintPage'
import SearchPage from '@/features/search/SearchPage'
import LoginPage from '@/features/auth/LoginPage'
import InfoPage from '@/features/info/InfoPage'
import OrdersPage from '@/features/orders/OrdersPage'
import OrderTrackingPage from '@/features/orders/OrderTrackingPage'

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="/info/:slug"      element={<InfoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
