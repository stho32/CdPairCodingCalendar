// Sample pair coding sessions (times in GMT+0)
const pairCodingSessions = [
    {
        host: "Stefan H.",
        fromTime: "2024-12-07T16:00:00Z",  // Saturday 16:00 GMT
        toTime: "2024-12-07T18:00:00Z"     // Saturday 18:00 GMT
    },
    {
        host: "Stefan H.",
        fromTime: "2024-12-08T16:00:00Z",  // Sunday 16:00 GMT
        toTime: "2024-12-08T18:00:00Z"     // Sunday 18:00 GMT
    },
    {
        host: "Steven Borrie",
        fromTime: "2024-12-08T09:30:00Z",  // Sunday 09:30 GMT
        toTime: "2024-12-08T10:30:00Z"     // Sunday 10:30 GMT
    },
    // Add more sessions as needed
];

const DateTime = luxon.DateTime;

// Populate timezone dropdown
function populateTimezones() {
    const select = document.getElementById('timezone');
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Get all timezone names
    const timeZones = Intl.supportedValuesOf('timeZone');
    
    timeZones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.text = zone;
        option.selected = zone === userTimezone;
        select.appendChild(option);
    });
}

// Create the time slots
function createTimeSlots() {
    const hoursContainer = document.querySelector('.hours');
    const slotsContainer = document.querySelector('.slots-container');
    
    // Create hour labels
    for (let hour = 0; hour < 24; hour++) {
        const hourSlot = document.createElement('div');
        hourSlot.className = 'hour-slot';
        hourSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
        hoursContainer.appendChild(hourSlot);
    }

    // Create slots for each day
    for (let day = 0; day < 7; day++) {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        for (let hour = 0; hour < 24; hour++) {
            for (let quarter = 0; quarter < 4; quarter++) {
                const quarterSlot = document.createElement('div');
                quarterSlot.className = 'quarter-hour';
                quarterSlot.dataset.day = day;
                quarterSlot.dataset.hour = hour;
                quarterSlot.dataset.quarter = quarter;
                dayColumn.appendChild(quarterSlot);
            }
        }
        
        slotsContainer.appendChild(dayColumn);
    }
}

// Convert time and display sessions
function displaySessions() {
    const selectedZone = document.getElementById('timezone').value;
    const slotsContainer = document.querySelector('.slots-container');
    
    // Clear existing sessions
    const existingSessions = document.querySelectorAll('.session');
    existingSessions.forEach(session => session.remove());

    pairCodingSessions.forEach(session => {
        const fromDateTime = DateTime.fromISO(session.fromTime).setZone(selectedZone);
        const toDateTime = DateTime.fromISO(session.toTime).setZone(selectedZone);
        
        // Calculate position and size
        const dayIndex = fromDateTime.weekday - 1; // 1 = Monday, 7 = Sunday
        const startMinutes = fromDateTime.hour * 60 + fromDateTime.minute;
        const duration = toDateTime.diff(fromDateTime, 'minutes').minutes;
        
        const sessionElement = document.createElement('div');
        sessionElement.className = 'session';
        sessionElement.innerHTML = `
            <div class="host-name">${session.host}</div>
            <div class="session-time">
                ${fromDateTime.toFormat('HH:mm')} - ${toDateTime.toFormat('HH:mm')}
            </div>
        `;

        // Create session details for modal
        sessionElement.addEventListener('click', () => {
            const modalBody = document.getElementById('sessionModalBody');
            modalBody.innerHTML = `
                <div class="session-details">
                    <p><strong>Host:</strong> ${session.host}</p>
                    <p><strong>Day:</strong> ${fromDateTime.toFormat('cccc')}</p>
                    <p><strong>Time:</strong> ${fromDateTime.toFormat('HH:mm')} - ${toDateTime.toFormat('HH:mm')}</p>
                    <p><strong>Note:</strong> This is a recurring availability. Please contact the host on Discord to arrange a specific date.</p>
                </div>
            `;
            const modal = new bootstrap.Modal(document.getElementById('sessionModal'));
            modal.show();
        });

        // Position the session element
        sessionElement.style.left = `${(dayIndex / 7) * 100}%`;
        sessionElement.style.width = `${100/7}%`;
        sessionElement.style.top = `${(startMinutes / (24 * 60)) * 100}%`;
        sessionElement.style.height = `${(duration / (24 * 60)) * 100}%`;
        
        slotsContainer.appendChild(sessionElement);
    });
}

// Initialize the calendar
function initCalendar() {
    populateTimezones();
    createTimeSlots();
    displaySessions();
    
    // Add event listener for timezone changes
    document.getElementById('timezone').addEventListener('change', displaySessions);
}

// Start the application
document.addEventListener('DOMContentLoaded', initCalendar);
