
document.addEventListener('DOMContentLoaded', () => {
    const timeElement = document.getElementById('time');
    const amPmElement = document.getElementById('am-pm');
    const dateElement = document.getElementById('date');
    const weatherTypeElement = document.getElementById('weather-type');
    const weatherIconElement = document.getElementById('weather-icon');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchSuggestions = document.getElementById('search-suggestions');
    const todoInput = document.getElementById('todo-input');
    const addTodoButton = document.getElementById('add-todo-button');
    const todoList = document.getElementById('todo-list');
    const newsContent = document.getElementById('news-content');
    const favoritesContainer = document.getElementById('favorites-container');
    const addFavoriteBtn = document.getElementById('add-favorite');
    const favoriteModal = document.getElementById('favorite-modal');
    const favoriteNameInput = document.getElementById('favorite-name');
    const favoriteUrlInput = document.getElementById('favorite-url');
    const saveFavoriteBtn = document.getElementById('save-favorite');
    const cancelFavoriteBtn = document.getElementById('cancel-favorite');
    const recentSites = document.getElementById('recent-sites');

    // --- Date and Time Logic ---
    const updateTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        timeElement.textContent = `${hours}:${minutes}`;
        amPmElement.textContent = ampm;

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString(undefined, options);
    };
    setInterval(updateTime, 1000);
    updateTime();

    // --- Weather Functionality ---
    const fetchWeather = async () => {
        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current_weather=true');
            const data = await response.json();

            const temp = Math.round(data.current_weather.temperature);
            const weatherCode = data.current_weather.weathercode;

            let description, iconClass;
            if (weatherCode === 0) {
                description = 'Clear';
                iconClass = 'bx-sun';
            } else if (weatherCode <= 3) {
                description = 'Cloudy';
                iconClass = 'bx-cloud';
            } else if (weatherCode <= 67) {
                description = 'Rainy';
                iconClass = 'bx-cloud-rain';
            } else if (weatherCode <= 77) {
                description = 'Snow';
                iconClass = 'bx-cloud-snow';
            } else {
                description = 'Stormy';
                iconClass = 'bx-cloud-lightning';
            }

            weatherTypeElement.textContent = `${temp}°C`;
            weatherIconElement.className = `bx ${iconClass}`;
        } catch (error) {
            console.error('Error fetching weather:', error);
            weatherTypeElement.textContent = 'Weather N/A';
            weatherIconElement.className = 'bx bx-error';
        }
    };
    fetchWeather();

    // --- Search Functionality with Suggestions ---
    const searchSuggestionsData = [
        'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
        'linkedin.com', 'github.com', 'stackoverflow.com', 'reddit.com', 'wikipedia.org',
        'amazon.com', 'netflix.com', 'spotify.com', 'gmail.com', 'yahoo.com'
    ];

    const showSuggestions = (query) => {
        if (!query.trim()) {
            searchSuggestions.style.display = 'none';
            return;
        }

        const filtered = searchSuggestionsData.filter(item =>
            item.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        if (filtered.length > 0) {
            searchSuggestions.innerHTML = filtered.map(item =>
                `<div class="search-suggestion" data-suggestion="${item}">${item}</div>`
            ).join('');
            searchSuggestions.style.display = 'block';
        } else {
            searchSuggestions.style.display = 'none';
        }
    };

    searchInput.addEventListener('input', (e) => {
        showSuggestions(e.target.value);
    });

    searchInput.addEventListener('focus', (e) => {
        showSuggestions(e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchSuggestions.style.display = 'none';
        }
    });

    searchSuggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('search-suggestion')) {
            const suggestion = e.target.dataset.suggestion;
            searchInput.value = suggestion;
            searchSuggestions.style.display = 'none';
            performSearch(suggestion);
        }
    });

    const performSearch = (query) => {
        if (!query.trim()) return;

        addToRecent(query);

        const isUrl = query.includes('.') && !query.includes(' ');
        let url;

        if (isUrl) {
            url = query.startsWith('http') ? query : `https://${query}`;
        } else {
            url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }

        window.open(url, '_blank');
        searchInput.value = '';
    };

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    // --- To-Do List Functionality ---
    let todos = JSON.parse(localStorage.getItem('berserkTodos')) || [];

    const saveTodos = () => {
        localStorage.setItem('berserkTodos', JSON.stringify(todos));
    };

    const renderTodos = () => {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            li.innerHTML = `
                        <span class="todo-text">${todo.text}</span>
                        <div class="todo-buttons">
                            <button class="complete-btn" data-index="${index}" title="${todo.completed ? 'Mark incomplete' : 'Mark complete'}">
                                ${todo.completed ? '↶' : '✓'}
                            </button>
                            <button class="delete-btn" data-index="${index}" title="Delete task">×</button>
                        </div>
                    `;

            todoList.appendChild(li);
        });
    };

    const addTodo = () => {
        const text = todoInput.value.trim();
        if (text) {
            todos.push({ text, completed: false });
            todoInput.value = '';
            saveTodos();
            renderTodos();
        }
    };

    addTodoButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    todoList.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);

        if (e.target.classList.contains('complete-btn')) {
            todos[index].completed = !todos[index].completed;
            saveTodos();
            renderTodos();
        } else if (e.target.classList.contains('delete-btn')) {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        }
    });

    renderTodos();

    // --- News Functionality ---
    const fetchNews = async () => {
        try {
            const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_NEWS_API_KEY');

            if (!response.ok) {
                throw new Error('API Error');
            }

            const data = await response.json();
            displayNews(data.articles.slice(0, 6));
        } catch (error) {
            const mockNews = [
                { title: 'Technology Advances in 2025', url: 'https://google.com/search?q=technology+news' },
                { title: 'Climate Change Updates', url: 'https://google.com/search?q=climate+change+news' },
                { title: 'Space Exploration Milestones', url: 'https://google.com/search?q=space+news' },
                { title: 'Economic Market Analysis', url: 'https://google.com/search?q=market+news' },
                { title: 'Health and Wellness Trends', url: 'https://google.com/search?q=health+news' },
                { title: 'Sports Championship Results', url: 'https://google.com/search?q=sports+news' }
            ];
            displayNews(mockNews);
        }
    };

    const displayNews = (articles) => {
        newsContent.innerHTML = articles.map(article =>
            `<div class="news-item">
                        <a href="${article.url}" target="_blank">${article.title}</a>
                    </div>`
        ).join('');
    };

    fetchNews();

    // --- Favorites Management ---
    let favorites = JSON.parse(localStorage.getItem('berserkFavorites')) || [];

    const saveFavorites = () => {
        localStorage.setItem('berserkFavorites', JSON.stringify(favorites));
    };

    const getFavicon = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0VBMkUwMCIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0Ij5XPC90ZXh0Pgo8L3N2Zz4=';
        }
    };

    const renderFavorites = () => {
        const existingFavorites = favoritesContainer.querySelectorAll('.favouriteweblink:not(#add-favorite)');
        existingFavorites.forEach(el => el.remove());

        favorites.slice(0, 3).forEach(favorite => {
            const link = document.createElement('a');
            link.className = 'favouriteweblink';
            link.href = '';
            link.innerHTML = `<img src="${getFavicon(favorite.url)}" alt="${favorite.name}">`;
            link.title = favorite.name;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                addToRecent(favorite.url, favorite.name);
                window.open(favorite.url, '_blank');
            });

            favoritesContainer.appendChild(link);
        });
    };

    addFavoriteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        favoriteModal.style.display = 'block';
        favoriteNameInput.focus();
    });

    cancelFavoriteBtn.addEventListener('click', () => {
        favoriteModal.style.display = 'none';
        favoriteNameInput.value = '';
        favoriteUrlInput.value = '';
    });

    saveFavoriteBtn.addEventListener('click', () => {
        const name = favoriteNameInput.value.trim();
        const url = favoriteUrlInput.value.trim();

        if (name && url) {
            let finalUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                finalUrl = 'https://' + url;
            }

            favorites.push({ name, url: finalUrl });
            saveFavorites();
            renderFavorites();
            favoriteModal.style.display = 'none';
            favoriteNameInput.value = '';
            favoriteUrlInput.value = '';
        }
    });

    favoriteModal.addEventListener('click', (e) => {
        if (e.target === favoriteModal) {
            cancelFavoriteBtn.click();
        }
    });

    favoriteNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            favoriteUrlInput.focus();
        }
    });

    favoriteUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveFavoriteBtn.click();
        }
    });

    renderFavorites();

    // --- Recent Sites Management ---
    let recentSitesData = JSON.parse(localStorage.getItem('berserkRecentSites')) || [];

    const saveRecentSites = () => {
        localStorage.setItem('berserkRecentSites', JSON.stringify(recentSitesData));
    };

    const addToRecent = (url, name = null) => {
        let finalUrl = url;
        let siteName = name;

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.')) {
                finalUrl = 'https://' + url;
            } else {
                return;
            }
        }

        if (!siteName) {
            try {
                siteName = new URL(finalUrl).hostname;
            } catch {
                siteName = url;
            }
        }

        recentSitesData = recentSitesData.filter(site => site.url !== finalUrl);
        recentSitesData.unshift({ name: siteName, url: finalUrl, timestamp: Date.now() });
        recentSitesData = recentSitesData.slice(0, 7);

        saveRecentSites();
        renderRecentSites();
    };

    const renderRecentSites = () => {
        recentSites.innerHTML = '';

        if (recentSitesData.length === 0) {
            recentSites.innerHTML = '<div style="color: #F0E7D6; font-family: Poppins, sans-serif; text-align: center; width: 100%;">No recent sites</div>';
            return;
        }

        recentSitesData.slice(0, 7).forEach(site => {
            const link = document.createElement('a');
            link.className = 'recentlink';
            link.href = '';
            link.innerHTML = `<img src="${getFavicon(site.url)}" alt="${site.name}">`;
            link.title = site.name;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(site.url, '_blank');
                addToRecent(site.url, site.name);
            });

            recentSites.appendChild(link);
        });
    };

    renderRecentSites();

    // --- Initialize with default favorites if none exist ---
    if (favorites.length === 0) {
        const defaultFavorites = [
            { name: 'Google', url: 'https://google.com' },
            { name: 'YouTube', url: 'https://youtube.com' },
            { name: 'GitHub', url: 'https://github.com' }
        ];
        favorites = defaultFavorites;
        saveFavorites();
        renderFavorites();
    }

    // --- Keyboard Shortcuts ---
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }

        if (e.key === 'Escape') {
            searchInput.blur();
            searchSuggestions.style.display = 'none';
            favoriteModal.style.display = 'none';
        }
    });

    // --- Auto-refresh intervals ---
    setInterval(fetchNews, 30 * 60 * 1000);
    setInterval(fetchWeather, 60 * 60 * 1000);

    console.log('Berserk Homepage loaded successfully!');
});
