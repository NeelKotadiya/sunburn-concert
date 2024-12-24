let selectedTicketType = '';
let quantity = 1;

let baseAmount = 0;
let totalAmount = 0;


const ticketData = [
    {
        name: "STAG GENERAL ENTRY",
        price: 499,
        benefits: ["General Entry", "Basic Amenities", "Standard View"],
    },
    {
        name: "STAG VIP ENTRY",
        price: 699,
        benefits: ["Premium Entry", "VIP Lounge Access", "Premium View"],
    },
    {
        name: "COUPLE GENERAL ENTRY",
        price: 899,
        benefits: ["COUPLE GENERAL ENTRY", "Meet & Greet", "Best View"],
    },
    {
        name: "COUPLE VIP ENTRY",
        price: 1199,
        benefits: ["COUPLE VIP Entry", "Meet & Greet", "Best View"],
    },
    {
        name: "BACKSTAGE 1 PAX",
        price: 1499,
        benefits: ["BACKSTAGE 1 PAX", "Meet & Greet", "Best View"],
    },
    {
        name: "GROUP OF 4 GENERAL ENTRY",
        price: 1599,
        benefits: ["GROUP OF 4 GENERAL ENTRY", "Meet & Greet", "Best View"],
    },
    {
        name: "GROUP OF 4 VIP ENTRY",
        price: 1998,
        benefits: ["GROUP OF 4 VIP ENTRY", "Meet & Greet", "Best View"],
    },
    {
        name: "MIP LOUNGE",
        price: 1999,
        benefits: ["MIP LOUNGE", "Meet & Greet", "Best View"],
    },
    {
        name: "Z1 VVIP LOUNGE",
        price: 2499,
        benefits: ["Z1 VVIP LOUNGE", "Meet & Greet", "Best View"],
    },
];
renderTickets();

// Function to select a ticket type
function selectTicket(type, amount) {
    baseAmount = amount;
    totalAmount = amount;
    selectedTicketType = type;

    document.getElementById('selectedTicket').textContent = type;
    document.getElementById('selectedAmount').textContent = totalAmount;
    document.getElementById('paymentModal').classList.remove('hidden');
    document.getElementById('paymentModal').classList.add('flex');
}

function showQRCode() {

    // Generate QR Code
    const qr = qrcode(0, 'M');
    qr.addData(`upi://pay?pa=neel6911-1@okhdfcbank&pn=SUNBURN&am=${totalAmount}&cu=INR`);
    qr.make();
    document.getElementById('qrCode').innerHTML = qr.createImgTag(5);
}


// Function to close the payment modal
function closePaymentModal() {

    document.getElementById('paymentModal').classList.add('hidden');
    document.getElementById('paymentModal').classList.remove('flex');
    resetForm();
}
function closeTicketModal() {

  document.getElementById('ticketModal').classList.add('hidden');
  document.getElementById('ticketModal').classList.remove('flex');
  resetForm();
}
// Function to generate a unique ticket ID
function generateTicketId() {
    return 'SB' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
async function processPayment(event) {
    if (validateInputs()) {
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const mobile = document.getElementById('userPhone').value;
        const tickets = selectedTicketType;
        const transactionId = document.getElementById('transactionId').value;

        // Check for empty fields
        if (!name || !email || !tickets || !transactionId || !mobile) {
            alert('Please fill all required fields');
            return;
        }

        // Prepare the ticket data for storage
        const ticketData = {
            userId: 'user123', // Optional: modify as needed
            appSlug: 'sunburn-concert', // Optional: modify as needed
            action: 'create', // Optional: modify as needed
            table: 'bookings', // Optional: modify as needed
            data: {
                name,
                email,
                ticketType: selectedTicketType,
                transactionId,
                mobile,
                isScanned : false,
                totalAmount,
                quantity

            }
        };


        try {
            const response = await fetch('/tickets/submit', { // Updated endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData),
            });

            const result = await response.json();
            if (response.ok) {
                closePaymentModal();
                generateETicket(ticketData.data);
                // Generate the QR code with the ticket HTML
                //const ticketURL = `http://13.49.251.99/tickets/verify-ticket?transactionId=${ticketData.data.transactionId}`; // Adjust the domain accordingly

                //const qrCode = qrcode(0, 'L'); // Create a new QR Code object
                //qrCode.addData(ticketURL); // Add the data
                //qrCode.make(); // Make the QR Code
                //document.getElementById('ticketQR').innerHTML = qrCode.createImgTag(5);

            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting your data. Please try again later.');
        }
    }
}
function generateETicket(bookingData) {

    document.getElementById('ticketType').textContent = bookingData.ticketType;
    document.getElementById('ticketName').textContent = bookingData.name;
    document.getElementById('ticketId').textContent = bookingData.transactionId;

    // Show ticket modal
    document.getElementById('ticketModal').classList.remove('hidden');
    document.getElementById('ticketModal').classList.add('flex');


    setTimeout(() => {
        document.querySelector('.ticket').classList.add('show');
    }, 100);
}
async function downloadTicket(bookingData) {

    try {
         const checkbox = document.getElementById("ticketQR");
        if (!checkbox.checked) {
            alert("Please check the box to confirm your WhatsApp details.");
            return;
        } 
        const ticketIdElement = document.getElementById('ticketId');

        // Get the value (text content) of the element
        const transactionId = ticketIdElement.innerText || ticketIdElement.textContent;
        // Make a call to the new endpoint
        const response = await fetch(`/tickets/get-ticket?transactionId=${transactionId}`);
        var message= "";
        if (!response.ok) {
            const errorData = await response.json(); // Get the error message
            message = `<p>${errorData.message}</p>`;
            return; // Exit the function if response is not ok
        }

        const data = await response.json();
        const ticket = data.ticket;

         message = `🎫 *Sunburn Festival Ticket* 🎫\n\n` +
            `*Name:* ${ticket.name}\n` +
            `*Email:* ${ticket.email}\n` +
            `*Mobile:* ${ticket.mobile}\n` +
            `*Ticket Type:* ${ticket.ticketType}\n` +
            `*Transaction ID:* ${ticket.transactionId}\n` +
            `*Total Amount:* ₹${ticket.totalAmount}\n\n` +
            `*Total quantity:* ₹${ticket.quantity}\n\n` +
            `See you at the event!`;

        // Encode the message for WhatsApp
        const whatsappMessage = encodeURIComponent(message);

        // Redirect to WhatsApp
        const whatsappURL = `https://wa.me/${919904040063}?text=${whatsappMessage}`;
        window.open(whatsappURL, '_blank');



    } catch (error) {
        console.error('Error fetching ticket details:', error);
        document.getElementById('ticketDetails').innerHTML = '<p>An error occurred while fetching ticket details.</p>';
    }
}


// Example amount per ticket

function updateTotalAmount() {

    totalAmount = quantity * baseAmount;
    document.getElementById('selectedAmount').textContent = totalAmount;
    showQRCode();

}

function increaseQuantity() {
    quantity++;
    document.getElementById('quantity').textContent = quantity;
    updateTotalAmount();
}

function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
        document.getElementById('quantity').textContent = quantity;
        updateTotalAmount();
    }
}

function validateInputs() {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userPhone = document.getElementById('userPhone');
    const transactionId = document.getElementById('transactionId');

    // Validate Name
    if (userName.value.trim() === '') {
        alert('Name is required.');
        return false;
    }
    if (transactionId.value.trim() === '') {
        alert('transactionId is required.');
        return false;
    }

    // Validate Email
    if (!validateEmail(userEmail.value)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Validate Phone
    if (!validatePhoneNumber(userPhone.value)) {
        alert('Please enter a valid 10-digit phone number.');
        return false;
    }

    return true;
}
function validatePhoneNumber(phoneNumber) {
    // Regular expression for validating a 10-digit phone number
    const phonePattern = /^\d{10}$/;
    return phonePattern.test(phoneNumber);
}
function validateEmail(email) {
    // Regular expression for validating email format
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailPattern.test(email);
}
function resetForm() {
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('transactionId').value = '';

    document.getElementById('qrCodeSection').classList.add('hidden');
    quantity = 1;
    document.getElementById('quantity').textContent = quantity;
    updateTotalAmount();
}
function selectPaymentMethod(method) {
    const paymentOptions = document.getElementById('paymentOptions');
    const transactionIdInput = document.getElementById('transactionId');


    if (method === 'qr') {
        // QR Code selected
        document.getElementById('qrCodeSection').classList.remove('hidden');
        transactionIdInput.placeholder = 'Enter QR Code Transaction ID';
        showQRCode();
    } else if (method === 'upi') {
        // UPI selected
        document.getElementById('qrCodeSection').classList.add('hidden');
        transactionIdInput.placeholder = 'Enter UPI Transaction ID';
        
    }
}
function renderTickets() {
    const ticketContainer = document.querySelector('#tickets .grid');

    ticketData.forEach(ticket => {
        // Create a list of benefits
        const benefitsHTML = ticket.benefits
            .map(benefit => `<li><i class="bi bi-check-circle-fill text-green-500 mr-2"></i>${benefit}</li>`)
            .join('');

        // Create the ticket card HTML
        const ticketCard = `
            <div class="bg-gray-900 rounded-xl p-6 text-center hover:transform hover:scale-105 transition-transform">
                <h3 class="text-2xl font-bold mb-4">${ticket.name}</h3>
                <p class="text-3xl font-bold text-yellow-500 mb-4">₹${ticket.price}</p>
                <ul class="text-left mb-6 space-y-2">${benefitsHTML}</ul>
                <button onclick="selectTicket('${ticket.name}', ${ticket.price})" class="bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-600">
                    Book Now
                </button>
            </div>
        `;

        // Append the ticket card to the container
        ticketContainer.innerHTML += ticketCard;
    });
}
