'use client'; // Make this a Client Component

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchaseOrderDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function fetchPurchaseOrderDetails() {
            try {
                console.log(`Fetching purchase order details with ID: ${id}`);
                const purchaseOrderResponse = await fetch(`http://34.219.34.28:5000/api/purchase-orders/${id}`);
                if (!purchaseOrderResponse.ok) {
                    const purchaseOrderError = await purchaseOrderResponse.text();
                    throw new Error(`Failed to fetch purchase order. Status: ${purchaseOrderResponse.status}. Message: ${purchaseOrderError}`);
                }
                const purchaseOrderData = await purchaseOrderResponse.json();
                setPurchaseOrder(purchaseOrderData.purchaseOrder);
            } catch (err: any) {
                console.error('Error fetching data:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchPurchaseOrderDetails();
        }
    }, [id]);

    if (loading) {
        return <p>Loading purchase order details...</p>;
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

    if (!purchaseOrder) {
        return (
            <div>
                <p>No purchase order found.</p>
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
            <h1 className="text-2xl font-bold mb-4">Purchase Order Details</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <p><strong>ID:</strong> {purchaseOrder.id}</p>
                <p><strong>Description:</strong> {purchaseOrder.description}</p>
                <p><strong>Status:</strong> {purchaseOrder.status}</p>
                {purchaseOrder.status === 'approved' && (
                    <p><strong>Total Amount:</strong> ${purchaseOrder.total_amount}</p>
                )}
                <p><strong>Created on:</strong> {new Date(purchaseOrder.created_at).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(purchaseOrder.updated_at).toLocaleDateString()}</p>
                {purchaseOrder.file_url && (
                    <p>
                        <strong>File URL: </strong> 
                        <a href={purchaseOrder.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            View File
                        </a>
                    </p>
                )}
            </div>

            <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Go Back
            </button>
        </div>
    );
}
