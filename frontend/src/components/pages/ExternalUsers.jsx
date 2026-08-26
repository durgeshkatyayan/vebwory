import { useEffect, useState } from 'react';
import { getExternalUsers } from '../services/api';

export default function ExternalUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getExternalUsers()
      .then(data => {
        if (data?.error) {
          setError(data.error);
          return;
        }
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Unable to load external users.'));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">External API Integration Users</h1>
      {error && <p className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900">{u.name}</h3>
            <p className="text-sm text-gray-500">{u.email}</p>
            <p className="text-xs text-indigo-600 mt-2 font-medium">{u.company?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}