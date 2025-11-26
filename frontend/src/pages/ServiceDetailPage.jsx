import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Star, Calendar, Clock, DollarSign } from 'lucide-react';
import { providerAPI, reviewAPI, serviceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/constants';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();
  
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchProviderDetails();
    fetchReviews();
  }, [id]);

  const fetchProviderDetails = async () => {
    setLoading(true);
    try {
      const response = await providerAPI.getById(id);
      setProvider(response.data);
      
      // Fetch services for this provider (when implemented)
      // const servicesResponse = await serviceAPI.getByProvider(id);
      // setServices(servicesResponse.data);
      
      // Mock services for now
      setServices([
        {
          id: 1,
          title: 'General Service',
          category: 'Plumbing',
          basePrice: 500,
          durationMinutes: 60,
          description: 'Basic plumbing services including repairs and installations'
        }
      ]);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      // const response = await reviewAPI.getByProvider(id);
      // setReviews(response.data);
      
      // Mock reviews for now
      setReviews([
        {
          id: 1,
          customerName: 'John Doe',
          rating: 5,
          comment: 'Excellent service! Very professional and punctual.',
          createdAt: '2025-11-20'
        },
        {
          id: 2,
          customerName: 'Jane Smith',
          rating: 4,
          comment: 'Good work, would recommend.',
          createdAt: '2025-11-18'
        }
      ]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBookService = (service) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isCustomer) {
      alert('Only customers can book services');
      return;
    }

    // Navigate to booking page with service details
    navigate('/bookings/new', {
      state: {
        providerId: id,
        providerName: provider.name,
        service: service,
      }
    });
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-gray-600">Provider not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Provider Header */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{provider.name}</h1>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <MapPin size={20} className="mr-2 text-primary" />
                <span>
                  {provider.doorNo}, {provider.addressLine}, {provider.city}, {provider.state} - {provider.pincode}
                </span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <Phone size={20} className="mr-2 text-primary" />
                <span>{provider.phone}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <Mail size={20} className="mr-2 text-primary" />
                <span>{provider.email}</span>
              </div>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="bg-blue-50 p-6 rounded-lg text-center min-w-[200px]">
            <div className="flex items-center justify-center mb-2">
              <Star size={32} className="text-yellow-400 fill-current" />
              <span className="text-4xl font-bold ml-2">{calculateAverageRating()}</span>
            </div>
            <p className="text-gray-600">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      {/* Services Offered */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-6">Services Offered</h2>
        
        {services.length === 0 ? (
          <p className="text-gray-600">No services available at the moment</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <DollarSign size={18} className="mr-2 text-primary" />
                    <span className="font-semibold">{formatCurrency(service.basePrice)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Clock size={18} className="mr-2 text-primary" />
                    <span>{service.durationMinutes} minutes</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookService(service)}
                  className="btn-primary w-full"
                >
                  <Calendar size={18} className="inline mr-2" />
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.customerName}</p>
                    <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailPage;
