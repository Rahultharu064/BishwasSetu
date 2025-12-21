import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Button from '../../ui/Button';

interface Complaint {
  id: string;
  serviceName: string;
  providerName: string;
  providerImage: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  date: string;
  adminResponse?: string;
  resolution?: string;
}

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showNewComplaintForm, setShowNewComplaintForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    serviceName: '',
    providerName: '',
    description: ''
  });

  useEffect(() => {
    // Mock data - replace with API call
    const mockComplaints: Complaint[] = [
      {
        id: '1',
        serviceName: 'Plumbing Repair',
        providerName: 'John Smith',
        providerImage: '/api/placeholder/40/40',
        description: 'The plumber arrived 2 hours late and the work was not completed properly.',
        status: 'resolved',
        date: '2024-01-16',
        adminResponse: 'We have investigated your complaint and contacted the provider.',
        resolution: 'Provider has been warned and offered to redo the work at no extra cost.'
      },
      {
        id: '2',
        serviceName: 'House Cleaning',
        providerName: 'Sarah Johnson',
        providerImage: '/api/placeholder/40/40',
        description: 'Cleaner did not show up for the scheduled appointment.',
        status: 'investigating',
        date: '2024-01-18',
        adminResponse: 'We are currently investigating this matter.'
      }
    ];
    setComplaints(mockComplaints);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'investigating': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'dismissed': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitComplaint = () => {
    // Mock submission - replace with API call
    const complaint: Complaint = {
      id: Date.now().toString(),
      ...newComplaint,
      providerImage: '/api/placeholder/40/40',
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    setComplaints([complaint, ...complaints]);
    setNewComplaint({ serviceName: '', providerName: '', description: '' });
    setShowNewComplaintForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-gray-600 mt-1">File and track complaints about service providers</p>
          </div>
          <Button onClick={() => setShowNewComplaintForm(true)}>
            File New Complaint
          </Button>
        </div>
      </div>

      {/* New Complaint Form */}
      {showNewComplaintForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">File a New Complaint</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={newComplaint.serviceName}
                onChange={(e) => setNewComplaint({...newComplaint, serviceName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Plumbing Repair"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider Name
              </label>
              <input
                type="text"
                value={newComplaint.providerName}
                onChange={(e) => setNewComplaint({...newComplaint, providerName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the issue in detail..."
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSubmitComplaint}>
                Submit Complaint
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewComplaintForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start space-x-4">
              <img
                src={complaint.providerImage}
                alt={complaint.providerName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.serviceName}</h3>
                    <p className="text-gray-600">{complaint.providerName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(complaint.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{complaint.description}</p>
                <p className="text-sm text-gray-500 mb-4">Filed on {complaint.date}</p>

                {complaint.adminResponse && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Admin Response</span>
                    </div>
                    <p className="text-blue-800 mb-2">{complaint.adminResponse}</p>
                    {complaint.resolution && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-blue-900">Resolution: </span>
                        <span className="text-blue-800">{complaint.resolution}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {complaints.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints filed</h3>
          <p className="mt-1 text-sm text-gray-500">Your filed complaints will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
