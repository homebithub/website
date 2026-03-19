import { useEffect, useRef, useState } from 'react';
import { Eye, TrendingUp, Clock, Calendar, Users, RefreshCw } from 'lucide-react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { profileViewService } from '~/services/grpc/profileView.service';

interface ProfileViewsAnalyticsProps {
  profileId: string;
  profileType: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Analytics {
  profile_id: string;
  profile_type: string;
  total_views: number;
  unique_views: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
  average_view_duration: number;
  last_viewed_at?: string;
}

export default function ProfileViewsAnalytics({ profileId, profileType, isOpen, onClose }: ProfileViewsAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, profileId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileViewService.getAnalytics(profileId, profileType);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load view analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatLastViewed = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full sm:max-w-lg sm:mx-4 max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-[#13131a] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-purple-500/30 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-purple-500/20 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-500" />
            Profile Views
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="h-9 w-9 rounded-full flex items-center justify-center border border-gray-300 dark:border-purple-500/30 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full flex items-center justify-center border border-gray-300 dark:border-purple-500/30 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse h-20 bg-purple-900/10 dark:bg-purple-900/20 rounded-xl" />
                ))}
              </div>
              <div className="animate-pulse h-16 bg-purple-900/10 dark:bg-purple-900/20 rounded-xl" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">{error}</p>
              <button onClick={loadAnalytics} className="mt-3 text-xs text-purple-500 hover:text-purple-400">Try again</button>
            </div>
          )}

          {!loading && !error && analytics && (
            <>
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-500/30">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.total_views.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Total Views</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.unique_views.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    Unique Visitors
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-500/30">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {analytics.views_today.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Today</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-500/30">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {analytics.views_this_week.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">This Week</div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-purple-500/20">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">This Month</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {analytics.views_this_month.toLocaleString()} views
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Avg Time</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatDuration(analytics.average_view_duration)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Last Viewed</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatLastViewed(analytics.last_viewed_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Rate */}
              {analytics.total_views > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-purple-500/20">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Unique Visitor Rate</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {Math.round((analytics.unique_views / analytics.total_views) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                      style={{ width: `${(analytics.unique_views / analytics.total_views) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
