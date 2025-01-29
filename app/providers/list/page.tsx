'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Providers() {
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const router = useRouter();

    // Fetch providers from the API
    async function fetchProviders() {
        try {
            const response = await fetch('http://localhost:5000/api/providers');
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            const data = await response.json();
            setProviders(data);
            setFilteredProviders(data);
        } catch (error) {
            console.error('Failed to fetch providers:', error);
        }
    }

    useEffect(() => {
        fetchProviders();
    }, []);

    // Filter providers when the search term changes
    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = providers.filter(
            (provider) =>
                provider.name.toLowerCase().includes(lowercasedTerm) ||
                provider.contact_email.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredProviders(filtered);
        setCurrentPage(1);
    }, [searchTerm, providers]);

    // Pagination logic
    const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProviders = filteredProviders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Lista de Proveedores</h1>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o correo"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 w-full"
                />
            </div>

            {/* Providers Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Nombre</th>
                            <th className="py-2 px-4 border-b">Correo</th>
                            <th className="py-2 px-4 border-b">Teléfono</th>
                            <th className="py-2 px-4 border-b">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProviders.map((provider) => (
                            <tr key={provider.id} className="text-center">
                                <td className="py-2 px-4 border-b">{provider.id}</td>
                                <td className="py-2 px-4 border-b">{provider.name}</td>
                                <td className="py-2 px-4 border-b">{provider.contact_email}</td>
                                <td className="py-2 px-4 border-b">
                                    {provider.phone || 'No disponible'}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => router.push(`/providers/${provider.id}`)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Ver Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProviders.length === 0 && (
                    <p className="text-center mt-4 text-gray-600">No se encontraron proveedores.</p>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="px-4">
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
