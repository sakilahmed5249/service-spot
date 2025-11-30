import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { MdSpaceDashboard } from 'react-icons/md';

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { icon: FaFacebookF, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    { label: 'Browse Services', to: '/services' },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Become a Provider', to: '/signup?type=provider' },
    { label: 'About Us', to: '/#about' },
    { label: 'Contact', to: '/#contact' },
  ];

  const categories = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting'];

  return (
    <footer className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white border-t border-white/10">

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-all duration-300">
                <MdSpaceDashboard size={28} />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Service-Spot
              </span>
            </Link>

            <p className="text-gray-400 leading-relaxed mb-6 max-w-xs">
              Discover top-rated professionals instantly. Book services securely and effortlessly.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  aria-label={label}
                  className="
                    bg-white/10 p-3 rounded-lg transition-all duration-300 group
                    hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600
                    hover:scale-110 hover:shadow-xl
                  "
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={20} className="group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="
                      text-gray-400 hover:text-white inline-block transition-all duration-300 relative group
                    "
                  >
                    <span className="absolute -left-3 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    <span className="group-hover:translate-x-1 inline-block transition-all">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Top Categories
            </h3>
            <ul className="space-y-3">
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    to={`/services?category=${c}`}
                    className="
                      text-gray-400 hover:text-white inline-block transition-all duration-300 relative group
                    "
                  >
                    <span className="absolute -left-3 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    <span className="group-hover:translate-x-1 inline-block transition-all">{c}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Get In Touch
            </h3>

            <ul className="space-y-5">
              {/* Email */}
              <li className="flex items-start gap-3 group">
                <Mail size={20} className="text-blue-400 flex-shrink-0 group-hover:scale-110 transition-all" />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <a href="mailto:support@servicespot.com" className="text-gray-400 hover:text-white transition-colors">
                    support@servicespot.com
                  </a>
                </div>
              </li>

              {/* Phone */}
              <li className="flex items-start gap-3 group">
                <Phone size={20} className="text-purple-400 flex-shrink-0 group-hover:scale-110 transition-all" />
                <div>
                  <p className="font-semibold text-white">Phone</p>
                  <a href="tel:+911234567890" className="text-gray-400 hover:text-white transition-colors">
                    +91 123-456-7890
                  </a>
                </div>
              </li>

              {/* Address */}
              <li className="flex items-start gap-3 group">
                <MapPin size={20} className="text-pink-400 flex-shrink-0 group-hover:scale-110 transition-all" />
                <div>
                  <p className="font-semibold text-white">Address</p>
                  <p className="text-gray-400 group-hover:text-white transition-colors">
                    123 Service Street<br />Mumbai, India 400001
                  </p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">&copy; {year} Service-Spot. All rights reserved.</p>

          <p className="text-gray-400 text-sm flex items-center gap-2">
            Made with
            <Heart size={16} className="text-red-500 animate-pulse" />
            for connecting people
          </p>

          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
