import pandas as pd

# Read the CSV file with 'ISO-8859-1' encoding
df = pd.read_csv('total_solar_energy.csv', sep=';', encoding='ISO-8859-1')

# Select the first and third columns
selected_data = df.iloc[:, [0, 3]]

# Save the selected data to a new CSV file
selected_data.to_csv('cleaned_solar_energy.csv', index=False, sep=';')