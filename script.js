// Sample pair coding sessions
const pairCodingSessions = [
    {
        host: "Stefan H.",
        weekday: 6, // Saturday
        startHour: 16,
        startMinute: 0,
        endHour: 18,
        endMinute: 0
    },
    {
        host: "Stefan H.",
        weekday: 7, // Sunday
        startHour: 16,
        startMinute: 0,
        endHour: 18,
        endMinute: 0
    },
    {
        host: "Steven Borrie",
        weekday: 7, // Sunday
        startHour: 9,
        startMinute: 30,
        endHour: 10,
        endMinute: 30
    }
];

// Populate timezone dropdown
function populateTimezones() {
    const select = document.getElementById('timezone');
    const userTimezone = luxon.DateTime.local().zoneName;
    
    // Get all timezone names using Intl API
    const timeZones = Intl.supportedValuesOf('timeZone');
    
    // Create timezone options with additional info
    const options = timeZones.map(zone => {
        const now = luxon.DateTime.now().setZone(zone);
        const offset = now.toFormat('ZZ');
        const label = `(GMT${offset}) ${zone.replace(/_/g, ' ')}`;
        
        return {
            id: zone,
            text: label,
            selected: zone === userTimezone
        };
    });

    // Sort options by offset and name
    options.sort((a, b) => {
        const offsetA = a.text.substring(4, 10);
        const offsetB = b.text.substring(4, 10);
        if (offsetA === offsetB) {
            return a.text.localeCompare(b.text);
        }
        return offsetA.localeCompare(offsetB);
    });

    // Initialize Select2
    $(select).select2({
        theme: 'bootstrap-5',
        data: options,
        width: '100%',
        placeholder: 'Search for your timezone...',
        allowClear: false
    });

    // Set default value
    const defaultOption = options.find(opt => opt.selected);
    if (defaultOption) {
        $(select).val(defaultOption.id).trigger('change');
    }
}

// Get the next occurrence of a given weekday
function getNextWeekdayDate(weekday) {
    const today = luxon.DateTime.now().setZone('UTC');
    let targetDate = today;
    
    // Adjust the date to the next occurrence of the weekday
    while (targetDate.weekday !== weekday) {
        targetDate = targetDate.plus({ days: 1 });
    }
    
    return targetDate;
}

function getDurationString(startHour, startMinute, endHour, endMinute) {
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    const durationMinutes = end - start;
    
    if (durationMinutes === 60) {
        return "1 hour";
    } else if (durationMinutes < 60) {
        return `${durationMinutes} minutes`;
    } else {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return minutes > 0 ? `${hours} hours ${minutes} minutes` : `${hours} hours`;
    }
}

// Convert time and display sessions
function displaySessions() {
    const sessionsTableBody = document.getElementById('sessionsTableBody');
    const userTimezone = document.getElementById('timezone').value;
    
    // Clear existing sessions
    sessionsTableBody.innerHTML = '';
    
    // Sort sessions by weekday and time
    const sortedSessions = [...pairCodingSessions].sort((a, b) => {
        if (a.weekday !== b.weekday) {
            return a.weekday - b.weekday;
        }
        return (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute);
    });

    // Display each session
    sortedSessions.forEach(session => {
        const row = document.createElement('tr');
        
        // Get next occurrence of the session's weekday
        const nextDate = getNextWeekdayDate(session.weekday);
        
        // Create DateTime objects for start and end times
        const sessionStart = nextDate.set({
            hour: session.startHour,
            minute: session.startMinute
        });
        
        // Convert to user's timezone
        const localSessionStart = sessionStart.setZone(userTimezone);
        
        // Format the time range
        const timeStr = `${localSessionStart.toFormat('HH:mm')}`;
        const duration = getDurationString(
            session.startHour,
            session.startMinute,
            session.endHour,
            session.endMinute
        );
        
        // Get weekday name
        const dayName = localSessionStart.toFormat('cccc');
        
        row.innerHTML = `
            <td>${session.host}</td>
            <td>${dayName}</td>
            <td>${timeStr}</td>
            <td>${duration}</td>
        `;
        
        sessionsTableBody.appendChild(row);
    });
}

// Initialize the calendar
function initCalendar() {
    populateTimezones();
    displaySessions();
    
    // Add event listener for timezone changes
    $('#timezone').on('select2:select', function (e) {
        displaySessions();
    });
}

// Start the application
document.addEventListener('DOMContentLoaded', initCalendar);
