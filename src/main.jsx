import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import SignIn from './pages/SignIn'

import AdminLayout from './pages/admin/AdminLayout'
import Overview from './pages/admin/Overview'
import UsersPage from './pages/admin/Users'
import ProductsPage from './pages/admin/Products'
import OrdersPage from './pages/admin/Orders'
import CategoriesPage from './pages/admin/Categories'
import TagsPage from './pages/admin/Tags'
import OrderHistory from './pages/OrderHistory'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'

import { Provider } from 'react-redux'
import { store } from './store/index.js'
import ProtectedRoute from './components/route/ProtectedRoute.jsx'

const router = createBrowserRouter([
  // Default entry point — redirect to store (publicly accessible)
  {
    path: '/',
    element: <Navigate to="/store" replace />,
  },

  // Sign-in (standalone, no layout)
  {
    path: '/signin',
    element: <SignIn />,
  },

  // Admin dashboard — protected, admin-only
  {
    path: '/admin',
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'tags', element: <TagsPage /> },
    ],
  },

  {
    path: '/store',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },

      // Protected customer actions
      {
        path: 'cart',
        element: <ProtectedRoute><Cart /></ProtectedRoute>
      },
      {
        path: 'checkout',
        element: <ProtectedRoute><Checkout /></ProtectedRoute>
      },
      {
        path: 'orders',
        element: <ProtectedRoute><OrderHistory /></ProtectedRoute>
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: 'wishlist',
        element: <ProtectedRoute><Wishlist /></ProtectedRoute>
      },
    ],
  },
], {
  future: {
    v7_normalizeFormMethod: true,
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)