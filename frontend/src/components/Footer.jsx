import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { MdSpaceDashboard } from 'react-icons/md';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <MdSpaceDashboard size={28} />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Service-Spot
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              Your trusted platform for discovering and booking local services. Connect with verified professionals instantly.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, href: '#', label: 'Facebook' },
                { icon: FaTwitter, href: '#', label: 'Twitter' },
                { icon: FaInstagram, href: '#', label: 'Instagram' },
                { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
                { icon: FaYoutube, href: '#', label: 'YouTube' }
              ].map(({ icon: Icon, href, label }, index) => (
                <a
                  key={index}
                  href={href}
                  className="bg-white/10 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon size={20} />
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
              {[
                { label: 'Browse Services', to: '/services' },
                { label: 'How It Works', to: '/#how-it-works' },
                { label: 'Become a Provider', to: '/signup?type=provider' },
                { label: 'About Us', to: '/#about' },
                { label: 'Contact', to: '/#contact' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300 relative group"
                  >
                    <span className="absolute -left-3 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {label}
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
              {[
                'Plumbing',
                'Electrical',
                'Cleaning',
                'Carpentry',
                'Painting',
              ].map((category) => (
                <li key={category}>
                  <Link
                    to={`/services?category=${category}`}
                    className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300 relative group"
                  >
                    <span className="absolute -left-3 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Get In Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white mb-1">Email</p>
                  <a href="mailto:support@servicespot.com" className="hover:underline">
                    support@servicespot.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone size={20} className="text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white mb-1">Phone</p>
                  <a href="tel:+911234567890" className="hover:underline">
                    +91 123-456-7890
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                <MapPin size={20} className="text-pink-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white mb-1">Address</p>
                  <p>123 Service Street<br />Mumbai, India 400001</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Service-Spot. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              Made with <Heart size={16} className="text-red-500 fill-current animate-pulse" /> for connecting people
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
      </div>
    </footer>
  );
};

export default Footer;
