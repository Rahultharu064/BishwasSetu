import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, FileText, User, Calendar, MapPin, RefreshCw } from 'lucide-react';
import Button from '../../ui/Button';
import toast from 'react-hot-toast';
import { getPendingProviders, acceptProvider, rejectProvider } from '../../../services/adminService';
import type { ProviderProfile } from '../../../types/providerTypes';

interface ProviderWithDetails extends ProviderProfile {
    user: {
        name?: string;
        email: string;
        phone?: string;
        address?: string;
        district?: string;
        municipality?: string;
    };
    kycDocuments: Array<{
        id: number;
        type: string;
        fileUrl: string;
        status: string;
    }>;
    category?: {
        name: string;
        description?: string;
    };
}

interface PendingProvidersResponse {
    message: string;
    count: number;
    providers: ProviderWithDetails[];
}

const ProviderVerification = () => {
    const [providers, setProviders] = useState<ProviderWithDetails[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<ProviderWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPendingProviders = async () => {
        try {
            setRefreshing(true);
            const response: PendingProvidersResponse = await getPendingProviders();
            setProviders(response.providers);
        } catch (error) {
            toast.error('Failed to fetch pending providers');
            console.error('Error fetching providers:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPendingProviders();
    }, []);

    const handleApprove = async (providerId: number) => {
        try {
            setActionLoading(true);
            await acceptProvider(providerId);
            toast.success('Provider application approved successfully');
            setSelectedProvider(null);
            // Refresh the list
            await fetchPendingProviders();
        } catch (error) {
            toast.error('Failed to approve provider');
            console.error('Error approving provider:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (providerId: number, reason?: string) => {
        try {
            setActionLoading(true);
            await rejectProvider(providerId, reason);
            toast.success('Provider application rejected successfully');
            setSelectedProvider(null);
            // Refresh the list
            await fetchPendingProviders();
        } catch (error) {
            toast.error('Failed to reject provider');
            console.error('Error rejecting provider:', error);
        } finally {
            setActionLoading(false);
        }
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
                <Button
                    onClick={fetchPendingProviders}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                    variant="outline"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Applications</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{providers.length}</p>
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
                                    Service Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Experience
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
                            {providers.map((provider) => (
                                <tr key={provider.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {provider.user.name || provider.legalName}
                                                </div>
                                                <div className="text-sm text-gray-500">{provider.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {provider.category?.name || 'Not specified'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {provider.serviceDistrict || provider.user.district}, {provider.serviceMunicipality || provider.user.municipality}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{provider.experienceYears} years</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(provider.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            onClick={() => setSelectedProvider(provider)}
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

            {/* Provider Detail Modal */}
            {selectedProvider && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">Review Provider Application</h2>
                                <Button
                                    onClick={() => setSelectedProvider(null)}
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
                                            <span className="text-gray-900">{selectedProvider.user.name || selectedProvider.legalName}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">{selectedProvider.user.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">{selectedProvider.user.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">
                                                {selectedProvider.serviceDistrict || selectedProvider.user.district}, {selectedProvider.serviceMunicipality || selectedProvider.user.municipality}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                            <span className="text-gray-900">{selectedProvider.experienceYears} years experience</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Service Details</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-gray-500">Category:</span>
                                            <span className="ml-2 text-gray-900">{selectedProvider.category?.name || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Bio:</span>
                                            <span className="ml-2 text-gray-900 block mt-1">{selectedProvider.bio}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Skills:</span>
                                            <span className="ml-2 text-gray-900">{selectedProvider.skills || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Submitted:</span>
                                            <span className="ml-2 text-gray-900">
                                                {new Date(selectedProvider.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Submitted Documents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedProvider.kycDocuments.map((doc) => (
                                        <div key={doc.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {doc.type.replace('_', ' ')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Status: {doc.status}
                                                </div>
                                            </div>
                                            <Button
                                                className="text-blue-600 hover:text-blue-900"
                                                variant="outline"
                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.fileUrl}`, '_blank')}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                {selectedProvider.tradeLicenseUrl && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Trade License</h4>
                                        <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">Trade License</div>
                                            </div>
                                            <Button
                                                className="text-blue-600 hover:text-blue-900"
                                                variant="outline"
                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedProvider.tradeLicenseUrl}`, '_blank')}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {selectedProvider.verificationStatus === 'UNDER_REVIEW' && (
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <Button
                                        onClick={() => handleReject(selectedProvider.id, 'Application does not meet requirements')}
                                        disabled={actionLoading}
                                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        {actionLoading ? 'Processing...' : 'Reject'}
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(selectedProvider.id)}
                                        disabled={actionLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {actionLoading ? 'Processing...' : 'Approve'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {providers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No pending provider applications found.</p>
                </div>
            )}
        </div>
    );
};

export default ProviderVerification;
