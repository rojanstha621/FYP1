import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-12 bg-white border-t border-pink-100 text-gray-900">
      <div className="container-main py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-gray-900">BabyEase</div>
          <div className="text-sm text-gray-600">Copyright © {new Date().getFullYear()}</div>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-6">
            <li><Link to="/" className="text-sm text-pink-600 hover:text-pink-700 transition-colors">Home</Link></li>
            <li><Link to="/register" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Register</Link></li>
            <li><Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Login</Link></li>
            <li><a href="mailto:support@example.com" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}