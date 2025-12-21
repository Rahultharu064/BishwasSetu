import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, FileText, User, Calendar, MapPin } from 'lucide-react';
import Button from '../../ui/Button';

interface ProviderApplication {
    id: string;
    name: string;
    email: string;
    phone: string;
    serviceCategory: string;
    location: string;
    experience: string;
    documents: {
        idProof: string;
        addressProof: string;
        qualificationCert?: string;
        businessLicense?: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
    reviewerNotes?: string;
}

const ProviderVerification = () => {
    const [applications, setApplications] = useState<ProviderApplication[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<ProviderApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        // Mock data - replace with API call
        const mockApplications: ProviderApplication[] = [
            {
                id: '1',
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                phone: '+91 9876543210',
                serviceCategory: 'Plumbing',
                location: 'Mumbai, Maharashtra',
                experience: '5 years',
                documents: {
                    idProof: 'aadhar_card.pdf',
                    addressProof: 'utility_bill.pdf',
                    qualificationCert: 'plumbing_cert.pdf'
                },
                status: 'pending',
                submittedAt: '2024-01-15'
            },
            {
                id: '2',
                name: 'Priya Sharma',
                email: 'priya@example.com',
                phone: '+91 9876543211',
                serviceCategory: 'Cleaning',
                location: 'Delhi, NCR',
                experience: '3 years',
                documents: {
                    idProof: 'pan_card.pdf',
                    addressProof: 'rent_agreement.pdf',
                    businessLicense: 'business_license.pdf'
                },
                status: 'pending',
                submittedAt: '2024-01-14'
            }
        ];
        setApplications(mockApplications);
        setLoading(false);
    }, []);

    const filteredApplications = applications.filter(app =>
        filter === 'all' || app.status === filter
    );

    const handleApprove = (applicationId: string) => {
        setApplications(apps =>
            apps.map(app =>
                app.id === applicationId
                    ? { ...app, status: 'approved' as const, reviewedAt: new Date().toISOString().split('T')[0] }
                    : app
            )
        );
        setSelectedApplication(null);
    };

    const handleReject = (applicationId: string, notes: string) => {
        setApplications(apps =>
            apps.map(app =>
                app.id === applicationId
                    ? {
                        ...app,
                        status: 'rejected' as const,
                        reviewedAt: new Date().toISOString().split('T')[0],
                        reviewerNotes: notes
                    }
                    : app
            )
        );
        setSelectedApplication(null);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading applications...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Provider Verification</h1>
                    <p className="text-gray-600 mt-1">Review and approve provider applications</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex space-x-4">
                    {[
                        { key: 'all', label: 'All Applications', count: applications.length },
                        { key: 'pending', label: 'Pending Review', count: applications.filter(a => a.status === 'pending').length },
                        { key: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'approved').length },
                        { key: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length }
                    ].map(({ key, label, count }) => (
                        <Button
                            key={key}
                            onClick={() => setFilter(key as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === key
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {label} ({count})
                        </Button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Provider
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApplications.map((application) => (
                                <tr key={application.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{application.name}</div>
                                                <div className="text-sm text-gray-500">{application.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{application.serviceCategory}</div>
                                        <div className="text-sm text-gray-500">{application.experience} experience</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {application.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(application.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            onClick={() => setSelectedApplication(application)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                            variant="outline"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Review
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Detail Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">Review Application</h2>
                                <Button
                                    onClick={() => setSelectedApplication(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Provider Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">{selectedApplication.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">{selectedApplication.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">{selectedApplication.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">{selectedApplication.location}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">{selectedApplication.experience} experience</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Service Details</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-gray-500">Category:</span>
                                            <span className="ml-2 text-gray-900">{selectedApplication.serviceCategory}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Submitted:</span>
                                            <span className="ml-2 text-gray-900">
                                                {new Date(selectedApplication.submittedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Submitted Documents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(selectedApplication.documents).map(([key, value]) => (
                                        <div key={key} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </div>
                                                <div className="text-sm text-gray-500">{value}</div>
                                            </div>
                                            <Button className="ml-auto text-blue-600 hover:text-blue-900" variant="outline">
                                                View
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedApplication.status === 'pending' && (
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <Button
                                        onClick={() => handleReject(selectedApplication.id, 'Application does not meet requirements')}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(selectedApplication.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No applications found for the selected filter.</p>
                </div>
            )}
        </div>
    );
};

export default ProviderVerification;
