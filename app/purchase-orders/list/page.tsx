'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchaseOrders() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalProviderOpen, setIsModalProviderOpen] = useState(false);
    const [waitingResponse, setWaitingResponse] = useState(false);
    const [selectedPurchaseOrderFile, setSelectedPurchaseOrderFile] = useState('');
    const [providers, setProviders] = useState([]); // State to store providers
    const [selectedProvider, setSelectedProvider] = useState(null);
    const itemsPerPage = 10;
    const router = useRouter();

    // Fetch purchase orders
    async function fetchPurchaseOrders() {
        try {
            const response = await fetch('http://34.219.34.28:5000/api/purchase-orders');
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            const data = await response.json();
            setPurchaseOrders(data.purchaseOrders);
            setFilteredOrders(data.purchaseOrders);
        } catch (error) {
            console.error('Failed to fetch purchase orders:', error);
        }
    }

    async function fetchProviders() {
        try {
            const response = await fetch('http://34.219.34.28:5000/api/providers/');
            if (!response.ok) {
                throw new Error(`Failed to fetch providers: ${response.statusText}`);
            }
            const data = await response.json();
            setProviders(data);
        } catch (err) {
            console.error('Error fetching providers:', err.message);
        } finally {
            console.log('Providers fetched successfully.');
        }
    }

    useEffect(() => {
        fetchPurchaseOrders();
        fetchProviders();
    }, []);

    // Approve purchase order
    async function approveOrder(id) {
        try {
            const response = await fetch(`http://34.219.34.28:5000/api/purchase-orders/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to approve order: ${response.statusText}`);
            }
            alert('Order approved successfully.');
            fetchPurchaseOrders(); // Refresh list after approval
        } catch (error) {
            console.error('Failed to approve order:', error);
        }
    }

    // Function to open the modal and set the selected user ID
    function openModal(purchaseOrderId: number) {
        setSelectedPurchaseOrderId(purchaseOrderId); // Set the user ID
        setIsModalOpen(true);      // Open the modal
    }

    function openProviderModal(purchaseOrderId: number, purchaseOrderFile: string) {
        setSelectedPurchaseOrderId(purchaseOrderId); // Set the user ID
        setSelectedPurchaseOrderFile(purchaseOrderFile); // Set the file URL
        setIsModalProviderOpen(true);      // Open the modal
    }

    // Filter purchase orders when search term changes
    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = purchaseOrders.filter(
            (order) =>
                order.description.toLowerCase().includes(lowercasedTerm) ||
                order.status.toLowerCase().includes(lowercasedTerm) ||
                order.user.name.toLowerCase().includes(lowercasedTerm) ||
                order.user.email.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [searchTerm, purchaseOrders]);

    // Function to handle the form submission
    async function handleUpdatePurchaseOrder(amount, selectedPurchaseOrderId) {

        setWaitingResponse(true);

        try {
            const response = await fetch(`http://34.219.34.28:5000/api/purchase-orders/${selectedPurchaseOrderId}/update-amount`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),
            });
            if (!response.ok) {
                throw new Error(`Failed to update purchase order: ${response.statusText}`);
            }
            alert('Purchase order updated successfully.');
            setIsModalOpen(false); // Close the modal
            setWaitingResponse(false);
            fetchPurchaseOrders(); // Refresh list after update
        } catch (error) {
            console.error('Failed to update purchase order:', error);
        }

    }

    async function handleSendPurchaseOrderFileToProvider(email, selectedPurchaseOrderId, selectedPurchaseOrderFile) {

        setWaitingResponse(true);
        setIsModalProviderOpen(false); // Close the modal
        try {
            const response = await fetch(`http://34.219.34.28:5000/api/purchase-orders/${selectedPurchaseOrderId}/send-to-provider`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, selectedPurchaseOrderFile }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send purchase order to provider: ${response.statusText}`);
            }

            alert('Purchase order sent to provider successfully.');
            setWaitingResponse(false);
            fetchPurchaseOrders(); // Refresh list after update

        } catch (error) {
            console.error('Failed to send purchase order to provider:', error);
        }

    }

    async function cancelOrder(id) {
        try {
            const response = await fetch(`http://34.219.34.28:5000/api/purchase-orders/${id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to cancel order: ${response.statusText}`);
            }
            alert('Order canceled successfully.');
            fetchPurchaseOrders(); // Refresh the list
        } catch (error) {
            console.error('Error canceling order:', error);
        }
    }


    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Modal */}
            <UpdatePurchaseOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleUpdatePurchaseOrder}
                selectedPurchaseOrderId={selectedPurchaseOrderId}
            />
            <SendPurchaseOrderFileToProvider
                isOpen={isModalProviderOpen}
                onCloseProviderModal={() => setIsModalProviderOpen(false)}
                onSubmit={handleSendPurchaseOrderFileToProvider}
                selectedPurchaseOrderId={selectedPurchaseOrderId}
                selectedPurchaseOrderFile={selectedPurchaseOrderFile}
                providers={providers}
                selectedProvider={selectedProvider}
            />
            <h1 className="text-2xl font-bold mb-4">Ordenes de Compra</h1>
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by description or status"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 w-full"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Descripcion</th>
                            <th className="py-2 px-4 border-b">Estado</th>
                            <th className="py-2 px-4 border-b">Total</th>
                            <th className="py-2 px-4 border-b">Fecha</th>
                            <th className="py-2 px-4 border-b">Archivo</th>
                            <th className="py-2 px-4 border-b">Usuario</th>
                            <th className="py-2 px-4 border-b">Correo</th>
                            <th className="py-2 px-4 border-b">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order) => (
                            <tr key={order.id} 
                                className="text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => router.push(`/purchase-orders/${order.id}`)} >
                                <td className="py-2 px-4 border-b">{order.id}</td>
                                <td className="py-2 px-4 border-b">{order.description}</td>
                                <td className="py-2 px-4 border-b">{order.status === 'approved' ? 'Aprobada' : order.status === 'pending' ? 'Pendiente' : order.status === 'cancelled' ? 'Cancelada' : 'N/A'}</td>
                                <td className="py-2 px-4 border-b">${order.total_amount}</td>
                                <td className="py-2 px-4 border-b">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => window.open(order.file_url, "_blank")}
                                        className="text-blue-500 hover:underline"
                                        disabled={!order.file_url}
                                    >
                                        {order.file_url ? "View File" : "No File"}
                                    </button>
                                </td>
                                <td className="py-2 px-4 border-b">{order.user?.name || "N/A"}</td>
                                <td className="py-2 px-4 border-b">{order.user?.email || "N/A"}</td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2 justify-center">
                                        {order.status === 'pending' || order.status === 'cancelled' ? (
                                            <button
                                                onClick={() => approveOrder(order.id)}
                                                className="bg-green-500 text-white px-3 py-2 rounded-full hover:bg-green-600 flex items-center justify-center"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => cancelOrder(order.id)}
                                                    className="bg-red-500 text-white px-3 py-2 rounded-full hover:bg-red-600 flex items-center justify-center"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => openProviderModal(order.id, order.file_url)}
                                                    className="bg-green-500 text-white px-3 py-2 rounded-full hover:bg-green-600 flex items-center justify-center"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 10h18M3 14h18m-6 4h6m-6-8h6m-6-4h6"
                                                        />
                                                    </svg>
                                                </button>
                                            </>
                                        )}

                                        {/* Modificar Button with Pencil Icon */}
                                        {/* <button
                                            onClick={() => openModal(order.id)}
                                            className="bg-yellow-500 text-white px-3 py-2 rounded-full hover:bg-yellow-600 flex items-center justify-center"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M11 17l-4 4m0 0H7m4-4h1m4-4l4-4m0 0h-1m-4 4H7m7-7l-4 4"
                                                />
                                            </svg>
                                        </button> */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <p className="text-center mt-4 text-gray-600">No purchase orders found.</p>
                )}
            </div>
            {/* Pagination */}
            <div className="flex justify-center items-center mt-4">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-4">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div >
    );

    function UpdatePurchaseOrderModal({ isOpen, onClose, onSubmit, selectedPurchaseOrderId }) {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                    <>
                        <h2 className="text-xl font-semibold mb-4">Create Purchase Order</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const amount = e.target.elements.amount.value || null; // Allow null for amount

                                if (amount && selectedPurchaseOrderId) {
                                    onSubmit(amount, selectedPurchaseOrderId); // Pass all data to the parent function
                                } else {
                                    console.error("Amount or ORDER ID missing.");
                                }
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                                    Monto $
                                </label>
                                <input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    placeholder="Ingresa el monto en $"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="flex justify-center space-x-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Modificar
                                </button>
                            </div>
                        </form>
                    </>
                </div>
            </div>
        );
    }


    function SendPurchaseOrderFileToProvider({ isOpen, onCloseProviderModal, onSubmit, selectedPurchaseOrderId, selectedPurchaseOrderFile, providers, selectedProvider }) {

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                    <>
                        <h2 className="text-xl font-semibold mb-4">Enviar Cotizacion a Proveedor</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (selectedProvider && selectedPurchaseOrderId && selectedPurchaseOrderFile) {
                                    onSubmit(
                                        selectedProvider.contact_email,
                                        selectedPurchaseOrderId,
                                        selectedPurchaseOrderFile
                                    );
                                } else {
                                    alert('Please select a provider and ensure all fields are filled.');
                                }
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="provider_email" className="block text-gray-700 font-medium mb-2">
                                    Proveedor
                                </label>
                                <select
                                    id="provider_email"
                                    name="provider_email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    value={selectedProvider?.id || ''} // Control the value with state
                                    onChange={(e) => {
                                        const providerId = e.target.value;
                                        const provider = providers.find((p) => p.id === parseInt(providerId, 10));
                                        setSelectedProvider(provider || null); // Update state immediately
                                    }}
                                    required
                                >
                                    <option value="">-- Select a Provider --</option>
                                    {providers.map((provider) => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.name} ({provider.contact_email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-center space-x-2">
                                <button
                                    type="button"
                                    onClick={onCloseProviderModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Enviar
                                </button>
                            </div>
                        </form>
                    </>
                </div>
            </div>
        )
    }
}
