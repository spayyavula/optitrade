import React from 'react';
import { Database, Wifi, WifiOff, AlertCircle, CheckCircle, Clock, TrendingUp, Settings } from 'lucide-react';
import { useDataQualityMonitor } from '../../hooks/useSupabaseData';
import { formatPercent } from '../../utils/formatters';

const DataQualityWidget: React.FC = () => {
  const { metrics, loading, refresh, isSupabaseAvailable } = useDataQualityMonitor();

  if (!isSupabaseAvailable) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="text-neutral-400 mr-2" size={20} />
            <h3 className="text-lg font-semibold">Data Quality Monitor</h3>
          </div>
          <Settings className="text-neutral-400" size={16} />
        </div>
        
        <div className="bg-warning-900/20 border border-warning-700/30 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="text-warning-400 mr-2" size={20} />
            <h4 className="font-medium text-warning-300">Database Not Configured</h4>
          </div>
          <p className="text-warning-200 text-sm mb-3">
            Supabase database is not configured. The application is running in demo mode with simulated data only.
          </p>
          <div className="text-xs text-warning-300">
            <p>• All market data is simulated for demonstration purposes</p>
            <p>• No data persistence or historical tracking available</p>
            <p>• Configure Supabase credentials to enable database features</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <span className="ml-2 text-sm">Loading data quality metrics...</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="text-success-400" size={16} />;
      case 'simulated': return <Database className="text-warning-400" size={16} />;
      case 'disconnected': return <WifiOff className="text-error-400" size={16} />;
      case 'error': return <AlertCircle className="text-error-500" size={16} />;
      default: return <Wifi className="text-neutral-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-success-400';
      case 'simulated': return 'text-warning-400';
      case 'disconnected': return 'text-error-400';
      case 'error': return 'text-error-500';
      default: return 'text-neutral-400';
    }
  };

  const totalRequests = metrics.reduce((sum, m) => sum + m.total_requests, 0);
  const successfulRequests = metrics.reduce((sum, m) => sum + m.successful_requests, 0);
  const overallSuccessRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Database className="text-primary-400 mr-2" size={20} />
          <h3 className="text-lg font-semibold">Data Quality Monitor</h3>
        </div>
        <button 
          onClick={refresh}
          className="btn-ghost p-2 rounded-full"
          title="Refresh metrics"
        >
          <TrendingUp size={16} />
        </button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-neutral-750 p-3 rounded-lg">
          <div className="text-xs text-neutral-400">Success Rate</div>
          <div className={`text-lg font-medium ${overallSuccessRate >= 95 ? 'text-success-400' : overallSuccessRate >= 80 ? 'text-warning-400' : 'text-error-400'}`}>
            {totalRequests > 0 ? formatPercent(overallSuccessRate) : 'N/A'}
          </div>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <div className="text-xs text-neutral-400">Total Requests</div>
          <div className="text-lg font-medium">{totalRequests.toLocaleString()}</div>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <div className="text-xs text-neutral-400">Data Sources</div>
          <div className="text-lg font-medium">{metrics.length}</div>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <div className="text-xs text-neutral-400">Mock Data %</div>
          <div className="text-lg font-medium text-warning-400">
            {metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + (m.mock_data_percentage || 0), 0) / metrics.length) : 0}%
          </div>
        </div>
      </div>

      {/* Data Source Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-300 mb-2">Data Sources</h4>
        {metrics.length === 0 ? (
          <div className="text-center py-4 text-neutral-400">
            <Database size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data quality metrics available</p>
            <p className="text-xs text-neutral-500 mt-1">
              Metrics will appear once data sources start reporting
            </p>
          </div>
        ) : (
          metrics.map((metric) => (
            <div key={metric.id} className="bg-neutral-750 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getStatusIcon(metric.connection_status)}
                  <span className="ml-2 font-medium capitalize">
                    {(metric as any).data_sources?.name || 'Unknown Source'}
                  </span>
                  <span className="ml-2 text-xs text-neutral-400">
                    ({(metric as any).data_sources?.type || 'unknown'})
                  </span>
                </div>
                <span className={`text-xs ${getStatusColor(metric.connection_status)}`}>
                  {metric.connection_status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-neutral-400">Requests:</span>
                  <span className="ml-1">{metric.total_requests}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Success:</span>
                  <span className="ml-1 text-success-400">{metric.successful_requests}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Failed:</span>
                  <span className="ml-1 text-error-400">{metric.failed_requests}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Mock:</span>
                  <span className="ml-1 text-warning-400">{metric.mock_data_percentage || 0}%</span>
                </div>
              </div>
              
              {metric.last_connection_attempt && (
                <div className="flex items-center mt-2 text-xs text-neutral-500">
                  <Clock size={12} className="mr-1" />
                  Last attempt: {new Date(metric.last_connection_attempt).toLocaleTimeString()}
                </div>
              )}
              
              {metric.error_details && (
                <div className="mt-2 text-xs text-error-400 bg-error-900/20 p-2 rounded">
                  Error: {typeof metric.error_details === 'string' ? metric.error_details : JSON.stringify(metric.error_details)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-700">
        <div className="flex items-center text-xs text-neutral-500">
          <AlertCircle size={12} className="mr-1" />
          <span>
            {isSupabaseAvailable 
              ? "Real-time monitoring of data sources. Mock data is used when markets are closed or connections fail."
              : "Database not configured - running in demo mode with simulated data only."
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataQualityWidget;