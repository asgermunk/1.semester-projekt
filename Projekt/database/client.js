// Specify the API endpoint for Solar Energy data
const apiUrl = 'https://solarenergy-xkhs.onrender.com/Alldata';

// Make a GET request to the specified API URL using the fetch API
// The fetch() promise resolves with the Response object.
fetch(apiUrl)
.then(response => {
    // Check of the request was successful. If the response was not ok, throw an error
    if (!response.ok) {
    throw new Error('Network response was not ok');
}
// If the response was ok, return the response as JSON
return response.json();
})
// If there was an error, log the error to the console
.catch(error => {
console.error('Error:', error);
});