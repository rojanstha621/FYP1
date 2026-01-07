import React from 'react'
import NavBar from './NavBar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#content" className="skip-link">Skip to main content</a>
      <NavBar />
      <main id="content" tabIndex="-1" className="flex-grow">
        <div className="container-main pt-8 pb-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
