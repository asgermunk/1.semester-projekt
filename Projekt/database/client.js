// Specify the API endpoint for Alldata
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

Alldata.forEach(Country  => {
    html += `<tr><td>${Country.countryid}</td>
            <t>${Country.country}</td>
            <td>${Country.countryareakm2}</td>
            <td>${Country.sunpotentialkwhyearm2}</td>
            <td>${Country.energyproductionkwhyear}</td>
            <td>${Country.energysunproductionyearpj}</td></tr>`;
    console.log(Alldata);
});

document.getElementById("test").innerHTML = html; 
})
.catch(error => {
console.error('Error:', error);
});