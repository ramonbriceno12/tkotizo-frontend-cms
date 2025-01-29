'use client'; // Make this a Client Component

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [provider, setProvider] = useState<any>(null);
    const [estimates, setEstimates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function fetchProviderDetails() {
            try {
                console.log(`Fetching provider details with ID: ${id}`);
                const providerResponse = await fetch(`http://34.219.34.28:5000/api/providers/${id}`);
                if (!providerResponse.ok) {
                    const providerError = await providerResponse.text();
                    throw new Error(`Failed to fetch provider. Status: ${providerResponse.status}. Message: ${providerError}`);
                }
                const providerData = await providerResponse.json();
                setProvider(providerData);

                console.log(`Fetching estimates for provider ID: ${id}`);
                const estimatesResponse = await fetch(`http://34.219.34.28:5000/api/provider-estimates/provider/${id}`);
                if (!estimatesResponse.ok) {
                    const estimatesError = await estimatesResponse.text();
                    throw new Error(`Failed to fetch estimates. Status: ${estimatesResponse.status}. Message: ${estimatesError}`);
                }
                const estimatesData = await estimatesResponse.json();
                setEstimates(estimatesData);
            } catch (err: any) {
                console.error('Error fetching data:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchProviderDetails();
        }
    }, [id]);

    if (loading) {
        return <p>Loading provider details...</p>;
    }

    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!provider) {
        return (
            <div>
                <p>No provider found.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Proveedor Detalles</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <p><strong>ID:</strong> {provider.id}</p>
                <p><strong>Nombre:</strong> {provider.name}</p>
                <p><strong>Email:</strong> {provider.contact_email}</p>
                <p><strong>Teléfono:</strong> {provider.phone || 'No disponible'}</p>
                <p><strong>Creado el:</strong> {new Date(provider.created_at).toLocaleDateString()}</p>
                <p><strong>Última actualización:</strong> {new Date(provider.updated_at).toLocaleDateString()}</p>
            </div>

            <h2 className="text-xl font-bold mb-4">Estimaciones de Proveedor</h2>
            {estimates.length === 0 ? (
                <p>No estimates found for this provider.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">Orden de Compra</th>
                                <th className="py-2 px-4 border-b">Monto Estimado</th>
                                <th className="py-2 px-4 border-b">Estado</th>
                                <th className="py-2 px-4 border-b">Archivo</th>
                                <th className="py-2 px-4 border-b">Fecha Creación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estimates.map((estimate) => (
                                <tr key={estimate.id} className="text-center">
                                    <td className="py-2 px-4 border-b">{estimate.id}</td>
                                    <td className="py-2 px-4 border-b">{estimate.purchase_order_id}</td>
                                    <td className="py-2 px-4 border-b">
                                        {estimate.estimated_amount !== null
                                            ? `$${estimate.estimated_amount}`
                                            : 'No disponible'}
                                    </td>
                                    <td className="py-2 px-4 border-b">{estimate.status}</td>
                                    <td className="py-2 px-4 border-b">
                                        {estimate.estimate_file_url ? (
                                            <a
                                                href={`${estimate.estimate_file_url}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                Ver Archivo
                                            </a>
                                        ) : (
                                            'No disponible'
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {new Date(estimate.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Go Back
            </button>
        </div>
    );
}
