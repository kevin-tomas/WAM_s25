const SPREADSHEET_ID = '1C-iegnutKxu5hfmqd07HA5081Ie_pfdxc0a-B_7jezI';
const API_KEY = 'AIzaSyCJ0TaH0vypcPDs9vXUbobqXaHfc_AlnmI';
const SHEET_RANGE = 'Sheet1!A2:F';

let collectionData = [];

const sortState = {
    date: 'newest',
    bestRating: 'none',
    worstRating: 'none'
};

function parseSheetDate(dateString) {
    if (!dateString) return { date: formatDate(), time: formatTime() };
    
    try {
        const parts = dateString.split(' ');
        if (parts.length >= 2) {
            return {
                date: parts[0],
                time: parts[1]
            };
        }
    } catch (e) {
        console.error('Error parsing date:', e);
    }
    
    return { date: formatDate(), time: formatTime() };
}

function formatDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}/${day}/${year}`;
}

function formatTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function loadIndexData() {
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                console.log("Response status:", response.status);
                return response.text().then(text => {
                    console.log("Error response body:", text);
                    throw new Error(`HTTP error! Status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            const rows = data.values || [];
            
            collectionData = [];
            
            rows.forEach(row => {
                if (row && row.length >= 5) {
                    const dateTimeObj = parseSheetDate(row[0] || '');
                    const location = row.length >= 6 ? row[5] : "UNKNOWN";
                    const bestMoment = row[1] || '';
                    const bestRating = parseInt(row[2]) || 3;
                    const worstMoment = row[3] || '';
                    const worstRating = parseInt(row[4]) || 3;
                    
                    if (bestMoment.trim() !== '' || worstMoment.trim() !== '') {
                        collectionData.push({
                            dateString: row[0] || '',
                            dateObj: new Date(dateTimeObj.date + ' ' + dateTimeObj.time),
                            dateFormatted: dateTimeObj.date,
                            timeFormatted: dateTimeObj.time,
                            location: location,
                            bestMoment: bestMoment,
                            bestRating: bestRating,
                            worstMoment: worstMoment,
                            worstRating: worstRating
                        });
                    }
                }
            });
            
            renderTable();
        })
        .catch(error => {
            console.error('Error fetching data from Google Sheets:', error);
            useMockData();
        });
}

function renderTable() {
    const tableBody = document.getElementById('index-entries');
    tableBody.innerHTML = '';
    
    sortData();
    
    if (collectionData.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = 'No entries found. Be the first to submit!';
        td.style.textAlign = 'center';
        td.style.padding = '20px';
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }
    
    collectionData.forEach(entry => {
        const tr = document.createElement('tr');
        
        const metadataCell = document.createElement('td');
        
        const dateTimeDiv = document.createElement('div');
        dateTimeDiv.className = 'date-time';
        dateTimeDiv.textContent = `${entry.dateFormatted}, ${entry.timeFormatted}`;
        metadataCell.appendChild(dateTimeDiv);
        
        const locationDiv = document.createElement('div');
        locationDiv.className = 'location';
        locationDiv.textContent = entry.location;
        metadataCell.appendChild(locationDiv);
        
        tr.appendChild(metadataCell);
        
        const bestCell = document.createElement('td');
        if (entry.bestMoment.trim() !== '') {
            const bestDiv = document.createElement('div');
            bestDiv.className = 'best-moment';
            bestDiv.setAttribute('data-rating', entry.bestRating);
            
            const ratingBadge = document.createElement('span');
            ratingBadge.className = 'rating-badge rating-badge-front';
            ratingBadge.textContent = `${entry.bestRating}/5`;
            bestDiv.appendChild(ratingBadge);
            
            const textNode = document.createTextNode(entry.bestMoment);
            bestDiv.appendChild(textNode);
            
            bestCell.appendChild(bestDiv);
        }
        tr.appendChild(bestCell);
        
        const worstCell = document.createElement('td');
        if (entry.worstMoment.trim() !== '') {
            const worstDiv = document.createElement('div');
            worstDiv.className = 'worst-moment';
            worstDiv.setAttribute('data-rating', entry.worstRating);
            
            const ratingBadge = document.createElement('span');
            ratingBadge.className = 'rating-badge rating-badge-front';
            ratingBadge.textContent = `${entry.worstRating}/5`;
            worstDiv.appendChild(ratingBadge);
            
            const textNode = document.createTextNode(entry.worstMoment);
            worstDiv.appendChild(textNode);
            
            worstCell.appendChild(worstDiv);
        }
        tr.appendChild(worstCell);
        
        tableBody.appendChild(tr);
    });
}

function sortData() {
    if (sortState.date !== 'none') {
        collectionData.sort((a, b) => {
            if (sortState.date === 'newest') {
                return b.dateObj - a.dateObj;
            } else {
                return a.dateObj - b.dateObj;
            }
        });
    }
    
    if (sortState.bestRating !== 'none') {
        collectionData.sort((a, b) => {
            if (sortState.bestRating === 'highest') {
                return b.bestRating - a.bestRating;
            } else {
                return a.bestRating - b.bestRating;
            }
        });
    }
    
    if (sortState.worstRating !== 'none') {
        collectionData.sort((a, b) => {
            if (sortState.worstRating === 'highest') {
                return b.worstRating - a.worstRating;
            } else {
                return a.worstRating - b.worstRating;
            }
        });
    }
}

function toggleSort(sortType) {
    if (sortType !== 'date') sortState.date = 'none';
    if (sortType !== 'bestRating') sortState.bestRating = 'none';
    if (sortType !== 'worstRating') sortState.worstRating = 'none';
    
    if (sortType === 'date') {
        if (sortState.date === 'none' || sortState.date === 'oldest') {
            sortState.date = 'newest';
        } else {
            sortState.date = 'oldest';
        }
    } else if (sortType === 'bestRating') {
        if (sortState.bestRating === 'none' || sortState.bestRating === 'lowest') {
            sortState.bestRating = 'highest';
        } else {
            sortState.bestRating = 'lowest';
        }
    } else if (sortType === 'worstRating') {
        if (sortState.worstRating === 'none' || sortState.worstRating === 'lowest') {
            sortState.worstRating = 'highest';
        } else {
            sortState.worstRating = 'lowest';
        }
    }
    
    updateSortUI();
    renderTable();
}

function updateSortUI() {
    document.querySelectorAll('.sort-button').forEach(button => {
        button.classList.remove('sort-active', 'sort-asc', 'sort-desc');
    });
    
    if (sortState.date !== 'none') {
        const dateButton = document.querySelector('[data-sort="date"]');
        dateButton.classList.add('sort-active');
        if (sortState.date === 'newest') {
            dateButton.classList.add('sort-desc');
            dateButton.setAttribute('title', 'Sorted by Date (Newest First)');
        } else {
            dateButton.classList.add('sort-asc');
            dateButton.setAttribute('title', 'Sorted by Date (Oldest First)');
        }
    }
    
    if (sortState.bestRating !== 'none') {
        const bestButton = document.querySelector('[data-sort="bestRating"]');
        bestButton.classList.add('sort-active');
        if (sortState.bestRating === 'highest') {
            bestButton.classList.add('sort-desc');
            bestButton.setAttribute('title', 'Sorted by Best Rating (Highest First)');
        } else {
            bestButton.classList.add('sort-asc');
            bestButton.setAttribute('title', 'Sorted by Best Rating (Lowest First)');
        }
    }
    
    if (sortState.worstRating !== 'none') {
        const worstButton = document.querySelector('[data-sort="worstRating"]');
        worstButton.classList.add('sort-active');
        if (sortState.worstRating === 'highest') {
            worstButton.classList.add('sort-desc');
            worstButton.setAttribute('title', 'Sorted by Worst Rating (Highest First)');
        } else {
            worstButton.classList.add('sort-asc');
            worstButton.setAttribute('title', 'Sorted by Worst Rating (Lowest First)');
        }
    }
}

function useMockData() {
    const mockData = [
        {
            date: "04/16/2025",
            time: "07:16:23",
            location: "SCHOOL",
            bestMoment: "my english teacher canceled class",
            bestRating: 5,
            worstMoment: "i now can't fall back asleep. woke up for nothing and don't have another class until 12:30 (it's currently 9:10 here).",
            worstRating: 2
        },
        {
            date: "04/16/2025",
            time: "15:22:10",
            location: "HOME",
            bestMoment: "finally finished that assignment I've been procrastinating",
            bestRating: 4,
            worstMoment: "spilled coffee on my notes right before class",
            worstRating: 3
        },
        {
            date: "04/16/2025",
            time: "12:05:33",
            location: "CAFE",
            bestMoment: "had a really good sandwich for lunch",
            bestRating: 3,
            worstMoment: "missed the bus and had to walk in the rain",
            worstRating: 4
        },
        {
            date: "04/16/2025",
            time: "09:12:23",
            location: "UNKNOWN",
            bestMoment: "went for a walk with my sister",
            bestRating: 4,
            worstMoment: "got a papercut on my hand",
            worstRating: 2
        },
        {
            date: "04/16/2025",
            time: "09:12:23",
            location: "UNKNOWN",
            bestMoment: "quit my job!",
            bestRating: 5,
            worstMoment: "don't have any income!",
            worstRating: 5
        },
        {
            date: "04/07/2025",
            time: "12:12:23",
            location: "UNKNOWN",
            bestMoment: "went to breakfast and caught up with an old friend",
            bestRating: 4,
            worstMoment: "my favorite sweater got a hole in it",
            worstRating: 3
        }
    ];
    
    collectionData = mockData.map(entry => {
        return {
            dateString: `${entry.date} ${entry.time}`,
            dateObj: new Date(entry.date + ' ' + entry.time),
            dateFormatted: entry.date,
            timeFormatted: entry.time,
            location: entry.location,
            bestMoment: entry.bestMoment,
            bestRating: entry.bestRating,
            worstMoment: entry.worstMoment,
            worstRating: entry.worstRating
        };
    });
    
    renderTable();
}

function setupStickyHeader() {
    function updatePill() {
        const $activeItem = $('.nav-item.active');
        const position = $activeItem.position();
        const width = $activeItem.outerWidth();
        
        $('.pill').css({
            left: position.left,
            width: width
        });
    }
    
    updatePill();
    
    $('.nav-item').click(function() {
        const page = $(this).data('page');
        
        $('.nav-item').removeClass('active');
        $(this).addClass('active');
        
        updatePill();
        
        switch(page) {
            case 'paired':
                window.location.href = 'index.html';
                break;
            case 'index':
                window.location.href = 'collection.html';
                break;
            case 'visualized':
                window.location.href = 'dataviz.html';
                break;
        }
    });
    
    $('.action-button').click(function() {
        const action = $(this).data('action');
        
        switch(action) {
            case 'about':
                alert('It\'s Been A Day is a website that collects and displays the best and worst moments of people\'s days. Share your day via the submit button! :)');
                break;
            case 'submit':
                window.location.href = 'form.html';
                break;
        }
    });
    
    $('.sort-button').click(function() {
        const sortType = $(this).data('sort');
        toggleSort(sortType);
    });
}

$(document).ready(function() {
    setupStickyHeader();
    updateSortUI();
    loadIndexData();
});