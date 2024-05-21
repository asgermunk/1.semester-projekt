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
.then(Alldata => {
// Process the retrieved data
let html = '<table>';


//opretter overskrifter for tabellen
html += '<tr><th>Country Id</th><th>Country</th><th>Country Area Km2</th><th>Sunpotential Kwh Year M2</th><th>Energy Production Kwh Year</th><th>Energy Sunproduction Year PJ<th></tr>'; 
//kører gennem hver mad og opretter en række i tabellen for hver mad
Alldata.forEach(Country  => {
    html += `<tr><td>${Country.countryid}</td>
            <t>${Country.country}</td>
            <td>${Country.countryareakm2}</td>
            <td>${Country.sunpotentialkwhyearm2}</td>
            <td>${Country.energyproductionkwhyear}</td>
            <td>${Country.energysunproductionyearpj}</td></tr>`;
    console.log(Alldata);
});
html += '</table>'; 

//centrer tekst i alle <td> elementer
html = html.replace(/<td>/g, '<td style="text-align:center;">'); 

document.getElementById("test").innerHTML = html; 
})
.catch(error => {
console.error('Error:', error);
});