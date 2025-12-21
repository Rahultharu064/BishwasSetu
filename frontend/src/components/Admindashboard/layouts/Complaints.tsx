import { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../../ui/Button';

interface Complaint {
    id: string;
    complainantName: string;
    complainantEmail: string;
    providerName: string;
    providerEmail: string;
    description: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: string;
}

const Complaints = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        // Mock data - replace with API call when backend is ready
        const mockComplaints: Complaint[] = [
            {
                id: '1',
                complainantName: 'Alice Johnson',
                complainantEmail: 'alice@example.com',
                providerName: 'Bob Smith',
                providerEmail: 'bob@example.com',
                description: 'Service was not completed as promised.',
                status: 'pending',
                createdAt: '2024-01-15T10:00:00Z'
            },
            {
                id: '2',
                complainantName: 'Charlie Brown',
                complainantEmail: 'charlie@example.com',
                providerName: 'Diana Prince',
                providerEmail: 'diana@example.com',
                description: 'Provider was late and unprofessional.',
                status: 'pending',
                createdAt: '2024-01-14T14:30:00Z'
            },
            {
                id: '3',
                complainantName: 'Eve Wilson',
                complainantEmail: 'eve@example.com',
                providerName: 'Frank Miller',
                providerEmail: 'frank@example.com',
                description: 'Poor quality work, not satisfied.',
                status: 'resolved',
                createdAt: '2024-01-13T09:15:00Z'
            }
        ];
        setTimeout(() => {
            setComplaints(mockComplaints);
            setLoading(false);
        }, 500);
    }, []);

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            complaint.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (complaintId: string, newStatus: 'pending' | 'resolved' | 'dismissed') => {
        // Simulate status update - replace with API call when backend is ready
        setComplaints(complaints.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading complaints...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complaints Management</h1>
                    <p className="text-gray-600 mt-1">Review and manage customer complaints</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search complaints by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                        <Button className="flex items-center gap-2">
                            <Filter size={16} />
                            More Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Complainant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Provider
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredComplaints.map((complaint) => (
                                <tr key={complaint.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {complaint.complainantName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{complaint.complainantName}</div>
                                                <div className="text-sm text-gray-500">{complaint.complainantEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-green-600 font-semibold text-sm">
                                                    {complaint.providerName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{complaint.providerName}</div>
                                                <div className="text-sm text-gray-500">{complaint.providerEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate" title={complaint.description}>
                                            {complaint.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                            complaint.status === 'dismissed' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {complaint.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(complaint.id, 'resolved')}
                                                        className="text-green-600 hover:text-green-900 p-1"
                                                        title="Resolve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(complaint.id, 'dismissed')}
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                        title="Dismiss"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {complaint.status === 'resolved' && (
                                                <button
                                                    onClick={() => handleStatusChange(complaint.id, 'pending')}
                                                    className="text-yellow-600 hover:text-yellow-900 p-1"
                                                    title="Reopen"
                                                >
                                                    <Clock size={16} />
                                                </button>
                                            )}
                                            {complaint.status === 'dismissed' && (
                                                <button
                                                    onClick={() => handleStatusChange(complaint.id, 'pending')}
                                                    className="text-yellow-600 hover:text-yellow-900 p-1"
                                                    title="Reopen"
                                                >
                                                    <Clock size={16} />
                                                </button>
                                            )}
                                            <button className="text-gray-400 hover:text-gray-600 p-1" title="More options">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredComplaints.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No complaints found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Complaints;
