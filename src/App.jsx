import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
// import Home from './components/Home'
import { Suspense, lazy } from "react"
import ProtectRoute from './components/auth/ProtectRoute'
import AdminLogin from './pages/admin/AdminLogin'
import { server } from './components/Constants/Config'
import axios from "axios"
import { useDispatch, useSelector } from 'react-redux'
import { userExists, userNotExists } from './redux/reducers/auth'
import { SocketProvider } from '../Socket'
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Groups = lazy(() => import('./pages/Groups'))
const Chat = lazy(() => import('./pages/Chat'))
const NotFound = lazy(() => import('./pages/NotFound'))
const LayoutLoader = lazy(() => import('./components/Layout/Loaders'))
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ChatManagement = lazy(() => import("./pages/admin/ChatManagement"));
const MessagesManagement = lazy(() =>
  import("./pages/admin/MessageManagement")
);
import { Toaster } from 'react-hot-toast'


function App() {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(`${server}/api/v1/user/profile`, { withCredentials: true })
      .then(({ data }) => dispatch(userExists(data.user)))
      .catch((err) => dispatch(userNotExists()));
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Suspense fallback={<LayoutLoader />}>
        <Routes>
          <Route


            element={
              <SocketProvider>
                <ProtectRoute user={user} />
              </SocketProvider>

            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/groups" element={<Groups />} />
          </Route>

          <Route
            path="/login"
            element={
              <ProtectRoute user={!user} redirect="/">
                <Login />
              </ProtectRoute>
            }
          />
          <Route path='/admin' element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/chats" element={<ChatManagement />} />
          <Route path="/admin/messages" element={<MessagesManagement />} /><Route path="/admin/dashboard" element={<Dashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Toaster position="bottom-center" />
    </BrowserRouter>
  )
}

export default App