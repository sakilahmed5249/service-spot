import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  Briefcase,
  Award,
  CheckCircle,
  ArrowLeft,
  Edit3,
} from 'lucide-react';
import { providerAPI, reviewAPI, serviceAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import { ServiceCard } from '../components/ServiceCard';
import Modal from '../components/Modal';

/**
 * ProviderDetailPage - Public provider profile for customers
 * Shows provider information, services, and reviews
 */
export default function ProviderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);

  useEffect(() => {
    fetchProviderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchProviderData() {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching provider with ID:', id);

      // Fetch provider details
      const providerRes = await providerAPI.getById(id);
      const providerData = providerRes.data?.data || providerRes.data;
      console.log('Provider data:', providerData);

      // Map backend fields to frontend expected fields
      setProvider({
        id: providerData.id,
        name: providerData.name || 'Unknown Provider',
        email: providerData.email || 'N/A',
        phone: providerData.phone || 'N/A',
        city: providerData.city || 'Unknown',
        state: providerData.state || 'Unknown',
        addressLine: providerData.addressLine || '',
        doorNo: providerData.doorNo || '',
        pincode: providerData.pincode,
        serviceType: providerData.serviceType,
        approxPrice: providerData.approxPrice,
        description: providerData.description || 'No description available',
        yearsExperience: providerData.yearsExperience,
        verified: providerData.verified || false,
      });

      // Fetch provider's services
      try {
        const servicesRes = await serviceAPI.getByProvider(id);
        const servicesData = servicesRes.data?.data || servicesRes.data || [];
        console.log('Provider services:', servicesData);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.warn('Could not fetch provider services:', err);
        setServices([]);
      }

      // Fetch provider reviews
      try {
        console.log('Fetching reviews for provider ID:', id);
        const reviewsRes = await reviewAPI.getByProvider(id);
        console.log('Reviews API raw response:', reviewsRes);
        const reviewsData = reviewsRes.data?.data || reviewsRes.data || [];
        console.log('Extracted reviews data:', reviewsData);
        console.log('Number of reviews:', reviewsData.length);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.warn('Could not fetch provider reviews:', err);
        setReviews([]);
      }

      // Check if current user can leave a review (only customers with completed bookings)
      if (user && user.role === 'CUSTOMER') {
        try {
          const bookingsRes = await bookingAPI.getByUser(user.id, 'customer');
          const bookingsData = bookingsRes.data?.data || bookingsRes.data || [];

          // Filter for completed bookings with this provider
          const completedWithProvider = bookingsData.filter(
            b => (b.provider?.id === parseInt(id) || b.providerId === parseInt(id))
              && b.status === 'COMPLETED'
          );

          console.log('Completed bookings with provider:', completedWithProvider);
          setCompletedBookings(completedWithProvider);
          setCanReview(completedWithProvider.length > 0);
        } catch (err) {
          console.warn('Could not check booking history:', err);
          setCanReview(false);
        }
      }
    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError('Unable to load provider information. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== 'CUSTOMER') {
      alert('Only customers can leave reviews');
      return;
    }

    if (!canReview) {
      alert('You can only review providers you have used');
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      alert('Please select a rating between 1 and 5 stars');
      return;
    }

    // Validate comment - Backend requires at least 10 characters
    const trimmedComment = reviewForm.comment.trim();
    if (!trimmedComment || trimmedComment.length < 10) {
      alert('Please write a review comment with at least 10 characters');
      return;
    }

    if (trimmedComment.length > 2000) {
      alert('Review comment must not exceed 2000 characters');
      return;
    }

    setSubmittingReview(true);
    try {
      // Use the most recent completed booking for this review
      const bookingId = completedBookings[0]?.id;

      const reviewData = {
        providerId: parseInt(id),
        customerId: user.id,
        bookingId: bookingId,
        rating: reviewForm.rating,
        comment: trimmedComment,
      };

      console.log('Submitting review:', reviewData);
      const response = await reviewAPI.create(reviewData);
      console.log('Review submission response:', response);

      // Reset form and close modal first for better UX
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewModal(false);

      // Refresh reviews to show the new review
      await fetchProviderData();

      alert('Review submitted successfully! Thank you for your feedback.');
    } catch (err) {
      console.error('Error submitting review:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMsg = err.response?.data?.message || 'Failed to submit review. Please try again.';
      alert(errorMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow-lg border border-gray-200 p-8 rounded-2xl text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Award size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The provider you are looking for does not exist.'}
          </p>
          <button onClick={() => navigate('/services')} className="btn-primary">
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Provider Header */}
        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Provider Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {provider.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Provider Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {provider.name}
                    {provider.verified && (
                      <CheckCircle size={24} className="inline-block ml-2 text-green-500" />
                    )}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-primary" />
                      <span>{provider.city}, {provider.state}</span>
                    </div>
                    {provider.pincode && (
                      <span className="text-sm">PIN: {provider.pincode}</span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={24} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
                  </div>
                  <p className="text-sm text-gray-500">{reviews.length} reviews</p>
                </div>
              </div>

              {/* Service Type & Experience */}
              <div className="flex flex-wrap gap-4 mb-4">
                {provider.serviceType && (
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                    <Briefcase size={16} className="text-primary" />
                    <span className="text-sm font-medium text-gray-900">{provider.serviceType}</span>
                  </div>
                )}
                {provider.yearsExperience && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                    <Award size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {provider.yearsExperience} years experience
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {provider.description && (
                <p className="text-gray-700 mb-4">{provider.description}</p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-primary" />
                  <a href={`tel:${provider.phone}`} className="hover:text-primary">
                    {provider.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-primary" />
                  <a href={`mailto:${provider.email}`} className="hover:text-primary">
                    {provider.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Offered */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Services Offered</h2>
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 text-center">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No services listed yet</p>
            </div>
          )}
        </div>

        {/* Customer Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>

            {/* Write Review Button - Only show for customers who have completed bookings */}
            {user && user.role === 'CUSTOMER' && canReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit3 size={18} />
                Write Review
              </button>
            )}

            {/* Message for customers who haven't used the service */}
            {user && user.role === 'CUSTOMER' && !canReview && (
              <p className="text-sm text-gray-500 italic">
                Complete a booking to leave a review
              </p>
            )}

            {/* Message for non-logged-in users */}
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary text-sm"
              >
                Login to Review
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white shadow-lg border border-gray-200 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.customerName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.customerName || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} showValue={false} />
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                  {review.serviceTitle && (
                    <p className="text-sm text-gray-500 mt-2">
                      Service: <span className="font-medium">{review.serviceTitle}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 text-center">
              <Star size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No reviews yet</p>
              <p className="text-sm text-gray-500">
                Be the first to book a service and leave a review!
              </p>
            </div>
          )}
        </div>

        {/* Write Review Modal */}
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewForm({ rating: 5, comment: '' });
          }}
          title={`Review ${provider?.name || 'Provider'}`}
          size="md"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={reviewForm.rating}
                  showValue={false}
                  onRate={(newRating) => setReviewForm(prev => ({ ...prev, rating: newRating }))}
                />
                <span className="text-sm text-gray-600">
                  ({reviewForm.rating} {reviewForm.rating === 1 ? 'star' : 'stars'})
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                id="review-comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                rows="4"
                className="input-field"
                placeholder="Share your experience with this provider... (minimum 10 characters)"
                minLength="10"
                maxLength="2000"
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Minimum 10 characters required
                </p>
                <p className={`text-xs ${reviewForm.comment.trim().length < 10 ? 'text-red-500' : reviewForm.comment.length > 2000 ? 'text-red-500' : 'text-gray-500'}`}>
                  {reviewForm.comment.length}/2000 characters
                </p>
              </div>
            </div>

            {completedBookings.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Reviewing for:</span>{' '}
                  {completedBookings[0].serviceListing?.title || completedBookings[0].serviceTitle || 'Service'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Completed on:{' '}
                  {new Date(completedBookings[0].completedAt || completedBookings[0].bookingDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewForm({ rating: 5, comment: '' });
                }}
                className="btn-secondary flex-1"
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submittingReview || reviewForm.comment.trim().length < 10}
                title={reviewForm.comment.trim().length < 10 ? 'Please write at least 10 characters' : ''}
              >
                {submittingReview ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star size={16} />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

