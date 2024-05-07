# import pandas as pd

# # Read the CSV file with 'ISO-8859-1' encoding
# df = pd.read_csv('total_solar_energy.csv', sep=';', encoding='ISO-8859-1')

# # Select the first and third columns
# selected_data = df.iloc[:, [0, 3]]

# # Save the selected data to a new CSV file
# selected_data.to_csv('cleaned_solar_energy.csv', index=False, sep=';')

import pandas as pd
from countryinfo import countries

# Read the CSV into a DataFrame
df = pd.read_csv("land_area.csv", sep=';')

# Define a function to get continent from country name
def get_continent(country_name):
    try:
        country_info = countries.get_info(country_name)
        return country_info['continent']
    except KeyError:
        return "Unknown"

# Add a new column 'Continent' using the get_continent function
df['Continent'] = df['Country'].apply(get_continent)

# Save the DataFrame back to a CSV file
df.to_csv("output_file.csv", index=False)