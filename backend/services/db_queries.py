import pandas as pd
import os 


# Database import and into a dataframe
current_dir = os.path.dirname(__file__)
# Define the path to the CSV file
csv_path = os.path.join(current_dir, 'insolv_data.csv')
df = pd.read_csv(csv_path)
cases = df['Company Name:'].tolist()

async def get_admin_tel_number(admin_name):
    result = df[df["Administrator Names:"] == admin_name]["Administrator's Tel Number:"]
    if not result.empty:
        return str(result.values[0])
    else:
        return "Administrator not found."
