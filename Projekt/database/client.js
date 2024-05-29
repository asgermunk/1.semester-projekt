// Specify the API endpoint for food
const apiUrl = 'http://localhost:4000/Alldata';

// Make a GET request using the Fetch API
fetch(apiUrl)
.then(response => {
    if (!response.ok) {
    throw new Error('Network response was not ok');
}
return response.json();
})

.catch(error => {
console.error('Error:', error);
});