'use client'
import { useState, useEffect } from 'react';

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 10;

    // Fetch invoices
    async function fetchInvoices() {
        try {
            const response = await fetch('http://localhost:5000/api/invoices');
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            const data = await response.json();
            setInvoices(data);
            setFilteredInvoices(data);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        }
    }

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Approve invoice
    async function approveInvoice(id: number) {
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to approve invoice: ${response.statusText}`);
            }
            alert('Invoice approved successfully.');
            fetchInvoices(); // Refresh list after approval
        } catch (error) {
            console.error('Failed to approve invoice:', error);
        }
    }

    // Function to open the modal and set the selected user ID
    function openModal(invoiceId: number) {
        setSelectedInvoiceId(invoiceId); // Set the user ID
        setIsModalOpen(true);      // Open the modal
    }

    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = invoices.filter(
            (invoice) =>
                invoice.status.toLowerCase().includes(lowercasedTerm) ||
                invoice.user.name.toLowerCase().includes(lowercasedTerm) ||
                invoice.user.email.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredInvoices(filtered);
        setCurrentPage(1);
    }, [searchTerm, invoices]);

    // Function to handle the form submission
    async function handleUpdateInvoice(amount, selectedInvoiceId) {
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${selectedInvoiceId}/update-amount`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),
            });
            if (!response.ok) {
                throw new Error(`Failed to update purchase invoice: ${response.statusText}`);
            }
            alert('Invoice updated successfully.');
            setIsModalOpen(false); // Close the modal
            fetchInvoices(); // Refresh list after update
        } catch (error) {
            console.error('Failed to update purchase invoice:', error);
        }

    }

    async function cancelInvoice(id: number) {
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to cancel invoice: ${response.statusText}`);
            }
            alert('invoice canceled successfully.');
            fetchInvoices(); // Refresh the list
        } catch (error) {
            console.error('Error canceling invoice:', error);
        }
    }
    

    // Pagination logic
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Modal */}
            <UpdateInvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleUpdateInvoice}
                selectedInvoiceId={selectedInvoiceId}
            />
            <h1 className="text-2xl font-bold mb-4">Ordenes de Compra</h1>
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by user or status"
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
                        {paginatedInvoices.map((invoice) => (
                            <tr key={invoice.id} className="text-center">
                                <td className="py-2 px-4 border-b">{invoice.id}</td>
                                <td className="py-2 px-4 border-b">{invoice.status === 'approved' ? 'Aprobada' : invoice.status === 'unpaid' ? 'Pendiente' : invoice.status === 'cancelled' ? 'Cancelada' : 'N/A'}</td>
                                <td className="py-2 px-4 border-b">${invoice.total_amount}</td>
                                <td className="py-2 px-4 border-b">
                                    {new Date(invoice.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => window.open(invoice.purchaseOrder?.file_url, "_blank")}
                                        className="text-blue-500 hover:underline"
                                        disabled={!invoice.purchaseOrder?.file_url}
                                    >
                                        {invoice.purchaseOrder?.file_url ? "View File" : "No File"}
                                    </button>
                                </td>
                                <td className="py-2 px-4 border-b">{invoice.purchaseOrder?.user?.name || "N/A"}</td>
                                <td className="py-2 px-4 border-b">{invoice.purchaseOrder?.user?.email || "N/A"}</td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2 justify-center">
                                        {invoice.status === 'unpaid' || invoice.status === 'cancelled' ? (
                                            <button
                                                onClick={() => approveInvoice(invoice.id)}
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
                                            <button
                                                onClick={() => cancelInvoice(invoice.id)}
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
                                        )}

                                        {/* Modificar Button with Pencil Icon */}
                                        <button
                                            onClick={() => openModal(invoice.id)}
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
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredInvoices.length === 0 && (
                    <p className="text-center mt-4 text-gray-600">No invoices found.</p>
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

    function UpdateInvoiceModal({ isOpen, onClose, onSubmit, selectedInvoiceId }) {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                    <>
                        <h2 className="text-xl font-semibold mb-4">Modificar Factura</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const amount = e.target.elements.amount.value || null; // Allow null for amount

                                if (amount && selectedInvoiceId) {
                                    onSubmit(amount, selectedInvoiceId); // Pass all data to the parent function
                                } else {
                                    console.error("Amount or invoice ID missing.");
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
}
