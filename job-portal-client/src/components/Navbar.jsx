import React, { useState, useEffect } from 'react'
import { socket } from '../socket'  // Adjust path to where you put socket.js
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'
import { UserButton, useUser, SignInButton, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react'
import { BellIcon } from '@heroicons/react/24/outline'  // Make sure you installed @heroicons/react
import NotificationsContainer from './NotificationsContainer' // Your notification UI container

const Navbar = () => {
  const { openSignIn } = useClerk()
  const { user } = useUser()
  const [showNotifications, setShowNotifications] = useState(false)



// Socket connection setup
  useEffect(() => {
    socket.connect();

    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      socket.off('newNotification');
      socket.disconnect();
    };
  }, []);


  // Notifications state here (initially mock data)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New job posted: Frontend Developer", read: false },
    { id: 2, text: "Deadline reminder for Application", read: true },
  ])

  // Handler to remove notification by id
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Count unread notifications dynamically
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="shadow-2xl py-4 bg-gray-200 border-b border-gray-400 relative z-10">
      <div className="max-w-7xl px-4 2xl:px-20 mx-auto flex justify-between items-center">
        <Link to="/">
          <img src={assets.logo} alt="Logo" className="h-10" />
        </Link>

        <div className="flex gap-8 items-center">
          {/* Recruiter Login */}
          <Link to="/recruiter/login">
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200">
              Recruiter Login
            </button>
          </Link>

          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition duration-200">
                Login
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-6 relative">
              <Link to={'/applications'} className="hover:text-blue-600 transition duration-200">
                Applied Jobs
              </Link>
              <span>Welcome, {user?.firstName || 'User'}!</span>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(prev => !prev)}
                  className="relative focus:outline-none"
                  aria-label="Toggle notifications"
                >
                  <BellIcon className="h-6 w-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white shadow-lg rounded border z-50">
                    <NotificationsContainer
                      notifications={notifications}
                      onRemove={removeNotification}
                    />
                  </div>
                )}
              </div>

              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  )
}

export default Navbar
