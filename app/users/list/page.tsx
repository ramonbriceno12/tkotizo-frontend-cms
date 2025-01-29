// pages/users.js
'use client'
// pages/users.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [waitingResponse, setWaitingResponse] = useState(false);
    const router = useRouter();
    const itemsPerPage = 10;

    async function fetchUsers() {
        try {
            const response = await fetch('http://34.219.34.28:5000/api/users/');
            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users when the search term changes
    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = users.filter(
            (user) =>
                user.name.toLowerCase().includes(lowercasedTerm) ||
                user.email.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [searchTerm, users]);


    // Function to open the modal and set the selected user ID
    function openModal(userId: number) {
        setSelectedUserId(userId); // Set the user ID
        setIsModalOpen(true);      // Open the modal
    }

    async function handleCreatePurchaseOrder(file, userId, description, amount) {

        setWaitingResponse(true);

        try {
            console.log(file, userId, description, amount);
            if (!file || !userId) {
                console.error("User ID or file is missing.");
                return;
            }

            const formData = new FormData();
            formData.append("userId", userId); // Add user ID
            formData.append("file", file); // Add file
            formData.append("description", description); // Add description
            if (amount)
                formData.append("amount", amount); // Add amount if provided
            else
                formData.append("amount", 0); // Default amount to 0 if not provided

            const response = await fetch('http://34.219.34.28:5000/api/purchase-orders', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log("Purchase order created successfully!");
                setIsSuccess(true); // Show success icon
                setWaitingResponse(false); // Reset waiting state
                setTimeout(() => {
                    setIsSuccess(false); // Reset success state after 2 seconds
                    setIsModalOpen(false); // Close modal
                }, 2000);
            } else {
                console.error(`Failed to create purchase order: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error creating purchase order:", error);
        }
    }


    async function handleDeactivateUser(userId: number) {
        try {
            const response = await fetch(`http://34.219.34.28:5000/api/users/${userId}/deactivate`, {
                method: 'PUT', // Use PUT or POST as appropriate
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log(`User ID ${userId} deactivated successfully`);
                await fetchUsers(); // Refresh the user list
                // Optionally, update the UI after successful deactivation
                // For example, remove the user from the local state
            } else if (response.status === 404) {
                console.error(`User ID ${userId} not found`);
            } else {
                console.error(`Failed to deactivate user ID ${userId}`);
            }
        } catch (error) {
            console.error(`Error deactivating user ID ${userId}:`, error);
        }
    }

    async function handleActivateUser(userId: number) {
        try {
            const response = await fetch(`http://34.219.34.28:5000/api/users/${userId}/activate`, {
                method: 'PUT', // Use PUT or POST as appropriate
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log(`User ID ${userId} activated successfully`);
                await fetchUsers(); // Refresh the user list
                // Optionally, update the UI after successful activation
                // For example, remove the user from the local state
            } else if (response.status === 404) {
                console.error(`User ID ${userId} not found`);
            } else {
                console.error(`Failed to activate user ID ${userId}`);
            }
        } catch (error) {
            console.error(`Error activating user ID ${userId}:`, error);
        }
    }


    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Modal */}
            <CreatePurchaseOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreatePurchaseOrder}
                userId={selectedUserId}
                isSuccess={isSuccess}
                waitingResponse={waitingResponse}
            />
            <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name or email"
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
                            <th className="py-2 px-4 border-b">Nombre</th>
                            <th className="py-2 px-4 border-b">Email</th>
                            <th className="py-2 px-4 border-b">Identificacion</th>
                            <th className="py-2 px-4 border-b">Comisiones</th>
                            <th className="py-2 px-4 border-b">Estatus</th>
                            <th className="py-2 px-4 border-b">Ordenes/Facturas</th>
                            <th className="py-2 px-4 border-b">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user) => (
                            <tr key={user.id} className="text-center">
                                <td className="py-2 px-4 border-b">{user.id}</td>
                                <td className="py-2 px-4 border-b">{user.name}</td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b">{user.identification}</td>
                                <td className="py-2 px-4 border-b">
                                    ${user.purchaseOrders.reduce((total, order) => {
                                        return (
                                            total +
                                            order.commissions.reduce((orderTotal, commission) => {
                                                return orderTotal + parseFloat(commission.amount);
                                            }, 0)
                                        );
                                    }, 0)}
                                </td>
                                <td className="py-2 px-4 border-b">{user.status}</td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => router.push(`/users/${user.id}`)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        View Orders
                                    </button>
                                </td>
                                <td className="py-2 px-4 border-b flex space-x-4 justify-center">
                                    {/* Deactivate Button */}
                                    {user.status === 'active' ? (
                                        <>
                                            <button
                                                onClick={() => handleDeactivateUser(user.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Desactivar Usuario"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="2"
                                                    stroke="currentColor"
                                                    className="w-6 h-6"
                                                >
                                                    <circle cx="12" cy="12" r="9" />
                                                    <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => openModal(user.id)}
                                                className="text-green-500 hover:text-green-700"
                                                title="Crear Orden de Compra"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="2"
                                                    stroke="currentColor"
                                                    className="w-6 h-6"
                                                >
                                                    <circle cx="12" cy="12" r="9" />
                                                    <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" />
                                                    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            </button>
                                        </>
                                    ) : (
                                        // Button for inactive users
                                        <button
                                            onClick={() => handleActivateUser(user.id)}
                                            className="text-green-500 hover:text-green-700"
                                            title="Activar Usuario"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="2"
                                                stroke="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                                <path
                                                    d="M9 12l2 2 4-4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>

                                        </button>
                                    )}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <p className="text-center mt-4 text-gray-600">No users found.</p>
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
        </div>
    );
}


function CreatePurchaseOrderModal({ isOpen, onClose, onSubmit, userId, isSuccess, waitingResponse }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                {isSuccess ? (
                    <div className="flex flex-col items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-16 h-16 text-green-500 mb-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.03 13.53a.75.75 0 01-1.06 0l-2.47-2.47a.75.75 0 011.06-1.06l1.97 1.97 4.47-4.47a.75.75 0 111.06 1.06l-5 5z"
                                clipRule="evenodd"
                            />
                        </svg>

                        <h2 className="text-xl font-semibold text-green-500">
                            Orden de Compra Creada!
                        </h2>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold mb-4">Crear Orden de Compra</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const file = e.target.elements.fileInput.files[0];
                                const description = e.target.elements.description.value;
                                const amount = e.target.elements.amount.value || null; // Allow null for amount

                                if (file && userId) {
                                    onSubmit(file, userId, description, amount); // Pass all data to the parent function
                                } else {
                                    console.error("File or User ID is missing.");
                                }
                            }}
                        >
                            <div className="mb-4">
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="fileInput"
                                        className="flex flex-col items-center px-4 py-6 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-10 h-10 text-gray-400 mb-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        <span className="text-gray-500 text-sm">
                                            Click to upload or drag a file here
                                        </span>
                                        <input
                                            id="fileInput"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.xlsx,.png,.jpg"
                                            onChange={(e) => {
                                                const fileName = e.target.files[0]?.name; // Get the selected file name
                                                const fileNameDiv = document.getElementById("fileName");
                                                if (fileName) {
                                                    fileNameDiv.textContent = `Selected file: ${fileName}`;
                                                } else {
                                                    fileNameDiv.textContent = ""; // Clear the text if no file is selected
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div id="fileName" className="mt-2 text-sm text-gray-500 text-center"></div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                                    Descripcion
                                </label>
                                <input
                                    id="description"
                                    name="description"
                                    type="text"
                                    placeholder="Enter a description"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                                    Monto (optional)
                                </label>
                                <input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    placeholder="Enter an amount (optional)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="flex justify-center space-x-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
                                    disabled={waitingResponse} // Optional: Disable button during loading
                                >
                                    {waitingResponse ? (
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8H4z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        'Enviar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}