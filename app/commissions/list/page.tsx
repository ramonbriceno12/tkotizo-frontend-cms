'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Commissions() {
    const [commissions, setCommissions] = useState([]);
    const [filteredCommissions, setFilteredCommissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const router = useRouter();

    // Fetch commissions from the API
    async function fetchCommissions() {
        try {
            const response = await fetch('http://34.219.34.28:5000/api/commissions');
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            const data = await response.json();
            setCommissions(data);
            setFilteredCommissions(data);
        } catch (error) {
            console.error('Failed to fetch commissions:', error);
        }
    }

    useEffect(() => {
        fetchCommissions();
    }, []);

    // Filter commissions when the search term changes
    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = commissions.filter(
            (commission) =>
                commission.purchase_order_id.toString().includes(lowercasedTerm) ||
                commission.commission_percentage.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredCommissions(filtered);
        setCurrentPage(1);
    }, [searchTerm, commissions]);

    // Pagination logic
    const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCommissions = filteredCommissions.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Lista de Comisiones</h1>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por ID de orden o porcentaje"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 w-full"
                />
            </div>

            {/* Commissions Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">ID Orden de Compra</th>
                            <th className="py-2 px-4 border-b">Porcentaje</th>
                            <th className="py-2 px-4 border-b">Monto</th>
                            <th className="py-2 px-4 border-b">Fecha de Creación</th>
                            <th className="py-2 px-4 border-b">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCommissions.map((commission) => (
                            <tr key={commission.id} className="text-center">
                                <td className="py-2 px-4 border-b">{commission.id}</td>
                                <td className="py-2 px-4 border-b">{commission.purchase_order_id}</td>
                                <td className="py-2 px-4 border-b">{commission.commission_percentage}%</td>
                                <td className="py-2 px-4 border-b">${commission.amount}</td>
                                <td className="py-2 px-4 border-b">{new Date(commission.created_at).toLocaleString()}</td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => router.push(`/commissions/${commission.id}`)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Ver Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCommissions.length === 0 && (
                    <p className="text-center mt-4 text-gray-600">No se encontraron comisiones.</p>
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
