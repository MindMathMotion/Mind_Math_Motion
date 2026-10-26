
const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const selectedDate = document.getElementById("selectedDate");
const timeSlots = document.getElementById("timeSlots");
const bookingMessage = document.getElementById("bookingMessage");

let currentMonth = new Date();
currentMonth.setDate(1);

const today = new Date();
today.setHours(0, 0, 0, 0);

let selectedButton = null;

// Example weekly availability
const availability = {
    0: ["9:00 AM", "10:00 AM", "11:00 AM"],
    1: ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
    2: ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
    3: ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
    4: ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
    5: ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
    6: ["9:00 AM", "10:00 AM", "11:00 AM"]
};
// Manually unavailable appointments
// Format: YYYY-MM-DD

const unavailable = {
    "2026-10-25": ["4:00 PM", "6:00 PM"],
    "2026-10-26": ["5:00 PM", "7:00 PM"]
};

Object.keys(unavailable).forEach(dateKey => {
    if (dateKey < formatDateKey(today)) {
        delete unavailable[dateKey];
    }
});

function renderCalendar() {
    calendar.innerHTML = "";
    timeSlots.innerHTML = "";
    selectedDate.textContent = "Select a day";
    bookingMessage.textContent = "";
    selectedButton = null;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    monthTitle.textContent = currentMonth.toLocaleDateString(
        "en-CA",
        { month: "long", year: "numeric" }
    );

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    weekdays.forEach(day => {
        const label = document.createElement("div");
        label.className = "weekday";
        label.textContent = day;
        calendar.appendChild(label);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const button = document.createElement("button");

        button.textContent = day;
        button.disabled = date <= today;

        button.addEventListener("click", () => {
            if (selectedButton) {
                selectedButton.classList.remove("selected");
            }

            button.classList.add("selected");
            selectedButton = button;
            showTimeSlots(date);
        });

        calendar.appendChild(button);
    }

    const isCurrentMonth =
        year === today.getFullYear() &&
        month === today.getMonth();

    document.getElementById("prevMonth").disabled = isCurrentMonth;
}


let requestedDate = null;
let requestedTime = null;

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function showTimeSlots(date) {
    selectedDate.textContent = date.toLocaleDateString(
        "en-CA",
        {
            weekday: "long",
            month: "long",
            day: "numeric"
        }
    );

    timeSlots.innerHTML = "";
    bookingMessage.textContent = "";

    document.getElementById("bookingSection").hidden = true;

    requestedDate = null;
    requestedTime = null;

    const dateKey = formatDateKey(date);

    const slots = availability[date.getDay()] || [];
    const blockedSlots = unavailable[dateKey] || [];

    slots.forEach(time => {
        const button = document.createElement("button");
        button.textContent = time;

        const isUnavailable =
            blockedSlots.includes(time) ||
            hasTimePassed(date, time);

        if (isUnavailable) {
            button.disabled = true;
            button.classList.add("unavailable");
        } else {
            button.addEventListener("click", () => {
                requestedDate = dateKey;
                requestedTime = time;

                bookingMessage.textContent =
                    `Requesting ${time} on ${selectedDate.textContent}`;

                document.getElementById("bookingSection").hidden = false;

                document.getElementById("bookingSection")
                    .scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
            });
        }

        timeSlots.appendChild(button);
    });

    // Automatically scroll to the times
    document.getElementById("timeSection")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}

function hasTimePassed(date, time) {
    const now = new Date();

    const match = time.match(/^(\d+):(\d+)\s*(AM|PM)$/);
    if (!match) return false;

    let hour = Number(match[1]) % 12;
    const minute = Number(match[2]);

    if (match[3] === "PM") hour += 12;

    const slotDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        minute
    );

    return slotDate <= now;
}

document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
});

renderCalendar();




const FORM_ENDPOINT = "https://formspree.io/f/xaeeelne";

document.getElementById("bookingForm")
    .addEventListener("submit", async function(event) {
        event.preventDefault();

        const status = document.getElementById("formStatus");
        const submitButton = this.querySelector(
            'button[type="submit"]'
        );

        if (!requestedDate || !requestedTime) {
            status.textContent = "Please select a date and time.";
            return;
        }

        const formData = new FormData(this);

        formData.set("date", requestedDate);
        formData.set("time", requestedTime);
        formData.set("timezone", "America/Vancouver");
        formData.set("_subject", "New Mind Math Motion Booking Request");

        submitButton.disabled = true;
        status.textContent = "Sending your request...";

        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Submission failed");
            }

            status.textContent =
                "Request sent! Your session is not confirmed until you receive a reply.";

            this.reset();

        } catch (error) {
            status.textContent =
                "Unable to send your request. Please try again.";
        } finally {
            submitButton.disabled = false;
        }
    });

