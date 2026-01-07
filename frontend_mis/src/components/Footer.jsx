import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-12 bg-white border-t">
      <div className="container-main py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-primary-700">BabyEase</div>
          <div className="muted">Copyright • © {new Date().getFullYear()}</div>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-4">
            <li><Link to="/" className="text-sm text-primary-600">Home</Link></li>
            <li><Link to="/register" className="text-sm muted">Register</Link></li>
            <li><Link to="/login" className="text-sm muted">Login</Link></li>
            <li><a href="mailto:support@example.com" className="text-sm muted">Contact</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}