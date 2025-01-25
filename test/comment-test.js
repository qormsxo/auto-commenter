const axios = require('axios');

function add(a, b) {
    return a + b;
}

const multiply = function(a, b) {
    return a * b;
};

const divide = (a, b) => a / b;

async function fetchDataWithFetch(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Data fetched with fetch:", data);
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
    }
}


let fetchDataWithAxios = async (url) =>  {
    try {
        const response = await axios.get(url);
        console.log("Data fetched with axios:", response.data);
        return response.data;
    } catch (error) {
        console.error("Axios error:", error);
    }
}