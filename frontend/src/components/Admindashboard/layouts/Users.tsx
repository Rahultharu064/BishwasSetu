import  { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, UserCheck, UserX } from 'lucide-react';
import Button from '../../ui/Button';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'provider' | 'admin';
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    lastLogin?: string;
}

const Users = ( ) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');

    useEffect(() => {
        // Mock data - replace with API call
        const mockUsers: User[] = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'customer',
                status: 'active',
                createdAt: '2024-01-15',
                lastLogin: '2024-01-20'
            },
            {
                id: '2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'provider',
                status: 'active',
                createdAt: '2024-01-10',
                lastLogin: '2024-01-19'
            },
            {
                id: '3',
                name: 'Bob Johnson',
                email: 'bob@example.com',
                role: 'customer',
                status: 'suspended',
                createdAt: '2024-01-05',
                lastLogin: '2024-01-18'
            }
        ];
        setUsers(mockUsers);
        setLoading(false);
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: newStatus } : user
        ));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading users...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-600 mt-1">Manage platform users and their access</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value="customer">Customers</option>
                            <option value="provider">Providers</option>
                            <option value="admin">Admins</option>
                        </select>
                        <Button className="flex items-center gap-2">
                            <Filter size={16} />
                            More Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'provider' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                                            user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.status === 'active' ? (
                                                <Button
                                                    onClick={() => handleStatusChange(user.id, 'suspended')}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    variant="ghost"
                                                >
                                                    <UserX size={16} />
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleStatusChange(user.id, 'active')}
                                                    className="text-green-600 hover:text-green-900 p-1"
                                                    variant="ghost"
                                                >
                                                    <UserCheck size={16} />
                                                </Button>
                                            )}
                                            <Button className="text-gray-400 hover:text-gray-600 p-1" variant="ghost">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No users found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Users;
