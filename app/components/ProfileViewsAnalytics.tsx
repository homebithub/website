import { useEffect, useState } from 'react';
import { Eye, TrendingUp, Clock, Calendar, Users } from 'lucide-react';
import { profileViewService } from '~/services/grpc/profileView.service';

interface ProfileViewsAnalyticsProps {
  profileId: string;
  profileType: string;
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

export default function ProfileViewsAnalytics({ profileId, profileType }: ProfileViewsAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [profileId]);

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

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-6 h-48" />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-600" />
          Profile Views
        </h3>
        <button
          onClick={loadAnalytics}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.total_views.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Total Views</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.unique_views.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium flex items-center justify-center gap-1">
            <Users className="w-3 h-3" />
            Unique Visitors
          </div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {analytics.views_today.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Today</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {analytics.views_this_week.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">This Week</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Unique Visitor Rate</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {Math.round((analytics.unique_views / analytics.total_views) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
              style={{ width: `${(analytics.unique_views / analytics.total_views) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
