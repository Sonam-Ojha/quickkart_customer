import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import HomePage from '@/features/home/HomePage'
import CategoryPage from '@/features/category/CategoryPage'
import ProductDetailPage from '@/features/product/ProductDetailPage'
import CartPage from '@/features/cart/CartPage'
import PrintPage from '@/features/print/PrintPage'
import SearchPage from '@/features/search/SearchPage'
import LoginPage from '@/features/auth/LoginPage'
import InfoPage from '@/features/info/InfoPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login — outside AppShell (no navbar/footer) */}
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home"        element={<HomePage />} />
          <Route path="/category"    element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/search"      element={<SearchPage />} />
          <Route path="/print"       element={<PrintPage />} />
          <Route path="/cart"        element={<CartPage />} />
          <Route path="/info/:slug"  element={<InfoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
