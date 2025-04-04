// Custom cursor movement
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.custom-cursor-dot');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let dotX = 0;
let dotY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth cursor movement
function animateCursor() {
    // Cursor ring movement
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Cursor dot movement
    dotX += (mouseX - dotX) * 0.3;
    dotY += (mouseY - dotY) * 0.3;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';

    requestAnimationFrame(animateCursor);
}

animateCursor();

// Cursor hover effect
const interactiveElements = document.querySelectorAll('a, button, input, textarea');
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.style.width = '30px';
        cursor.style.height = '30px';
        cursorDot.style.width = '6px';
        cursorDot.style.height = '6px';
    });

    element.addEventListener('mouseleave', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursorDot.style.width = '4px';
        cursorDot.style.height = '4px';
    });

    element.addEventListener('mousedown', () => {
        cursor.style.width = '15px';
        cursor.style.height = '15px';
        cursorDot.style.width = '3px';
        cursorDot.style.height = '3px';
    });

    element.addEventListener('mouseup', () => {
        cursor.style.width = '30px';
        cursor.style.height = '30px';
        cursorDot.style.width = '6px';
        cursorDot.style.height = '6px';
    });
});

// Initialize particles.js
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
        modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
});

// Store issued certificates in localStorage
const certificates = JSON.parse(localStorage.getItem('certificates')) || {};

// Toast notification with enhanced styling
const showToast = (message, type = 'info') => {
    const toast = document.getElementById('notificationToast');
    const toastBody = toast.querySelector('.toast-body');
    toastBody.textContent = message;
    toast.classList.add(`bg-${type}`);

    // Add icon based on type
    const icon = document.createElement('i');
    icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'} me-2`;
    toastBody.insertBefore(icon, toastBody.firstChild);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    setTimeout(() => {
        toast.classList.remove(`bg-${type}`);
        icon.remove();
    }, 5000);
};

// Show/Hide loading spinner
const showLoading = (show) => {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
};

// Constants for transaction
const MODULE_ADDRESS = "0xbee15f02b0f40ed652915038caa88f6d29d514f34523b15b8435a434d52d90b6";
const MODULE_NAME = "attendance_nft";

// Cache for attendance records
let attendanceCache = new Map();

// Function to preload NFT metadata
const preloadNFTMetadata = async () => {
    try {
        const response = await fetch('https://attendance.nft/metadata/preload');
        return await response.json();
    } catch (error) {
        console.error('Error preloading NFT metadata:', error);
        return null;
    }
};

// Function to show confirmation popup with NFT preview
const showConfirmationPopup = (action, studentId, courseCode) => {
    return new Promise((resolve) => {
        const nftPreview = generateNFTPreview(studentId, courseCode);
        const popup = document.createElement('div');
        popup.className = 'modal fade';
        popup.setAttribute('data-bs-backdrop', 'static');
        popup.setAttribute('data-bs-keyboard', 'false');
        popup.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content glass-card">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle"></i> Confirm Attendance
                        </h5>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            ${nftPreview}
                            <h4 class="mt-3">Mark Attendance</h4>
                            <p class="text-muted">Your NFT is ready to be minted</p>
                        </div>
                        <div class="d-grid gap-2">
                            <button class="btn btn-success confirm-btn">
                                <i class="fas fa-check"></i> Confirm & Mint NFT
                            </button>
                            <button class="btn btn-outline-light cancel-btn">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        const modal = new bootstrap.Modal(popup);
        modal.show();

        popup.querySelector('.confirm-btn').addEventListener('click', () => {
            modal.hide();
            popup.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(popup);
                resolve(true);
            }, { once: true });
        });

        popup.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.hide();
            popup.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(popup);
                resolve(false);
            }, { once: true });
        });
    });
};

// Generate NFT preview HTML
const generateNFTPreview = (studentId, courseCode) => {
    const timestamp = new Date().toLocaleString();
    const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    return `
        <div class="nft-preview" style="background: ${randomColor}; padding: 20px; border-radius: 10px; width: 200px; margin: 0 auto;">
            <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px;">
                <i class="fas fa-user-graduate fa-3x mb-3"></i>
                <h5 class="mb-2">${studentId}</h5>
                <p class="mb-1">${courseCode}</p>
                <small>${timestamp}</small>
            </div>
        </div>
    `;
};

// Check if Petra wallet is installed
const checkPetraWallet = () => {
    const installBtn = document.getElementById('installPetraWallet');
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletDisconnected = document.getElementById('walletDisconnected');
    const walletConnected = document.getElementById('walletConnected');
    const attendanceSection = document.getElementById('attendanceSection');

    if (!window.petra) {
        installBtn.style.display = 'block';
        connectBtn.style.display = 'none';
        walletDisconnected.style.display = 'block';
        walletConnected.style.display = 'none';
        attendanceSection.style.display = 'none';
        return false;
    }

    installBtn.style.display = 'none';
    connectBtn.style.display = 'block';
    return true;
};

// Connect to Petra wallet with enhanced feedback
const connectWallet = async() => {
    if (!checkPetraWallet()) {
        window.open('https://petra.app/', '_blank');
        return;
    }

    try {
        const response = await window.petra.connect();
        const address = response.address;
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

        // Update UI elements
        const walletDisconnected = document.getElementById('walletDisconnected');
        const walletConnected = document.getElementById('walletConnected');
        const walletAddress = document.getElementById('walletAddress');
        const attendanceSection = document.getElementById('attendanceSection');

        walletDisconnected.style.display = 'none';
        walletConnected.style.display = 'block';
        walletAddress.textContent = shortAddress;
        attendanceSection.style.display = 'block';

        showToast('Wallet connected successfully!', 'success');
        updateAttendanceRecords();
        
        // Preload NFT metadata
        preloadNFTMetadata();
    } catch (error) {
        console.error('Error connecting to wallet:', error);
        showToast('Failed to connect wallet. Please try again.', 'error');
    }
};

// Simulate APT permission check
const simulateAptPermissionCheck = async () => {
    return new Promise((resolve) => {
        resolve({
            success: true,
            message: 'APT permission granted'
        });
    });
};

// Simulate NFT minting process
const simulateNFTMinting = async (studentId, courseCode) => {
    return new Promise((resolve) => {
        resolve({
            success: true,
            message: 'NFT minted successfully',
            nftId: `NFT#${Math.floor(Math.random() * 10000)}`,
            timestamp: new Date().toISOString()
        });
    });
};

// Simulate wallet approval with custom UI
const simulateWalletApproval = async () => {
    return new Promise((resolve) => {
        const popup = document.createElement('div');
        popup.className = 'modal fade';
        popup.setAttribute('data-bs-backdrop', 'static');
        popup.setAttribute('data-bs-keyboard', 'false');
        popup.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content glass-card">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-wallet"></i> Petra Wallet Approval
                        </h5>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-4">
                            <i class="fas fa-shield-alt fa-3x text-primary mb-3"></i>
                            <h4>Approve Transaction</h4>
                            <p class="text-muted">Please approve the transaction in your Petra wallet</p>
                            <p class="text-muted small">Cost: 0 APT</p>
                        </div>
                        <div class="d-flex justify-content-center gap-3">
                            <button class="btn btn-success approve-btn">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-danger reject-btn">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        const modal = new bootstrap.Modal(popup);
        modal.show();

        popup.querySelector('.approve-btn').addEventListener('click', () => {
            modal.hide();
            popup.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(popup);
                resolve(true);
            }, { once: true });
        });

        popup.querySelector('.reject-btn').addEventListener('click', () => {
            modal.hide();
            popup.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(popup);
                resolve(false);
            }, { once: true });
        });
    });
};

// Handle attendance submission with fake NFT minting
const handleAttendanceSubmit = async(e) => {
    e.preventDefault();

    try {
        const studentId = document.getElementById('studentId').value.trim();
        const courseCode = document.getElementById('courseCode').value.trim();

        // Validate inputs
        if (!studentId || !courseCode) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        // Check wallet connection
        if (!window.petra || !window.petra.isConnected()) {
            showToast('Please connect your wallet first', 'warning');
            return;
        }

        // Show NFT preview and confirmation
        const confirmed = await showConfirmationPopup('attendance', studentId, courseCode);
        if (!confirmed) {
            showToast('Attendance marking cancelled', 'warning');
            return;
        }

        // Show fake wallet approval
        const walletApproved = await simulateWalletApproval();
        if (!walletApproved) {
            showToast('Transaction rejected by wallet', 'error');
            return;
        }

        // Show loading only for NFT minting
        showLoading(true);

        // Simulate NFT minting process (quick)
        const mintingResult = await simulateNFTMinting(studentId, courseCode);
        
        if (mintingResult.success) {
            // Update UI after successful minting
            updateAttendanceRecords();
            showToast('Attendance marked successfully! NFT has been minted.', 'success');
            document.getElementById('attendanceForm').reset();
        } else {
            showToast(mintingResult.message, 'error');
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        showToast('Failed to mark attendance. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
};

// Update attendance records with fake NFT data
const updateAttendanceRecords = () => {
    const tbody = document.getElementById('attendanceRecords');
    if (!tbody || !window.petra || !window.petra.isConnected()) {
        return;
    }

    try {
        const currentTime = new Date().toLocaleString();
        const nftId = `NFT#${Math.floor(Math.random() * 10000)}`;
        
        // Create new row with animation
        const newRow = document.createElement('tr');
        newRow.className = 'fade-in';
        newRow.innerHTML = `
            <td>${document.getElementById('studentId').value || 'Sample ID'}</td>
            <td>${document.getElementById('courseCode').value || 'Sample Course'}</td>
            <td>${currentTime}</td>
            <td><span class="badge bg-success">Present</span></td>
            <td><span class="badge bg-info">${nftId}</span></td>
        `;

        // Prepend new row
        if (tbody.firstChild) {
            tbody.insertBefore(newRow, tbody.firstChild);
        } else {
            tbody.appendChild(newRow);
        }

        // Remove old rows if more than 5
        while (tbody.children.length > 5) {
            tbody.removeChild(tbody.lastChild);
        }
    } catch (error) {
        console.error('Error updating attendance records:', error);
        showToast('Error updating attendance records', 'error');
    }
};

// Initialize the application
const initializeApp = () => {
    // Check wallet connection on page load
    checkPetraWallet();

    // Add event listeners
    const attendanceForm = document.getElementById('attendanceForm');
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', handleAttendanceSubmit);
    }

    const installBtn = document.getElementById('installPetraWallet');
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            window.open('https://petra.app/', '_blank');
        });
    }

    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);