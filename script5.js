console.log("NEW WEATHER API CODE LOADED");

const apiKey = "92ae405fd13f4a7b84d142404262106";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const loader = document.getElementById("loader");
const historyDropdown = document.getElementById("historyDropdown");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");

const forecastContainer = document.getElementById("forecastContainer");

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    getWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        getWeather(cityInput.value.trim());
    }
});

async function getWeather(city) {

    loader.classList.remove("hidden");

    try {

        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=no&alerts=no`
        );

        const data = await response.json();

        console.log("API Response:", data);

        if (data.error) {
            alert(data.error.message);
            loader.classList.add("hidden");
            return;
        }

        displayWeather(data);
        displayForecast(data);
        saveSearch(city);

    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Failed to fetch weather data.");
    }

    loader.classList.add("hidden");
}

function displayWeather(data) {

    cityName.innerText =
        `${data.location.name}, ${data.location.country}`;

    temperature.innerText =
        `${Math.round(data.current.temp_c)}°C`;

    weatherCondition.innerText =
        data.current.condition.text;

    humidity.innerText =
        `${data.current.humidity}%`;

    wind.innerText =
        `${data.current.wind_kph} km/h`;

    feelsLike.innerText =
        `${Math.round(data.current.feelslike_c)}°C`;

    weatherIcon.src =
        "https:" + data.current.condition.icon;

    changeBackground(data.current.condition.text);
}

function displayForecast(data) {

    forecastContainer.innerHTML = "";

    data.forecast.forecastday.forEach(day => {

        const card = document.createElement("div");
        card.classList.add("forecast-card");

        const date = new Date(day.date);

        card.innerHTML = `
            <h4>${date.toLocaleDateString("en-US",{weekday:"short"})}</h4>
            <img src="https:${day.day.condition.icon}">
            <p>${Math.round(day.day.avgtemp_c)}°C</p>
            <p>${day.day.condition.text}</p>
        `;

        forecastContainer.appendChild(card);
    });
}

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async(position) => {

            loader.classList.remove("hidden");

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {

                const response = await fetch(
                    `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=5&aqi=no&alerts=no`
                );

                const data = await response.json();

                displayWeather(data);
                displayForecast(data);

            } catch (error) {
                console.log(error);
            }

            loader.classList.add("hidden");
        },

        () => {
            alert("Location access denied.");
        }
    );
});

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeToggle.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

        localStorage.setItem("theme", "dark");

    } else {

        themeToggle.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

        localStorage.setItem("theme", "light");
    }
});

function saveSearch(city) {

    let searches =
        JSON.parse(localStorage.getItem("weatherHistory")) || [];

    if (!searches.includes(city)) {

        searches.unshift(city);

        if (searches.length > 5) {
            searches.pop();
        }

        localStorage.setItem(
            "weatherHistory",
            JSON.stringify(searches)
        );
    }

    loadSearchHistory();
}

function loadSearchHistory() {

    historyDropdown.innerHTML =
        '<option value="">Recent Searches</option>';

    const searches =
        JSON.parse(localStorage.getItem("weatherHistory")) || [];

    searches.forEach(city => {

        const option = document.createElement("option");

        option.value = city;
        option.textContent = city;

        historyDropdown.appendChild(option);
    });
}

historyDropdown.addEventListener("change", () => {

    if (historyDropdown.value !== "") {
        getWeather(historyDropdown.value);
    }
});

function changeBackground(condition) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "snowy"
    );

    const text = condition.toLowerCase();

    if (text.includes("sun") || text.includes("clear")) {
        document.body.classList.add("sunny");
    }
    else if (text.includes("cloud")) {
        document.body.classList.add("cloudy");
    }
    else if (
        text.includes("rain") ||
        text.includes("storm") ||
        text.includes("drizzle")
    ) {
        document.body.classList.add("rainy");
    }
    else if (text.includes("snow")) {
        document.body.classList.add("snowy");
    }
}

window.onload = () => {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        themeToggle.innerHTML =
            '<i class="fa-solid fa-sun"></i>';
    }

    loadSearchHistory();

    getWeather("Mumbai");
};