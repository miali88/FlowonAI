import pandas as pd
import os
from thefuzz import process
from services.in_memory_cache import in_memory_cache

# Database import and into a dataframe
current_dir = os.path.dirname(__file__)
# Define the path to the CSV file
csv_path = os.path.join(current_dir, 'insolv_data.csv')
df = pd.read_csv(csv_path)
cases = df['Company Name:'].tolist()

async def db_case_locator(event):
    print('_*_ DB CASE LOCATOR FUNCTION _*_')
    print(event)
    if 'case_name' in event['args']:
        query = event['args']['case_name']
        query_type = 'CaseName'
    elif 'AdministratorName' in event['args']:
        query = event['args']['AdministratorName']
        query_type = 'AdministratorName'
    else:
        print('No case found')
        return {"function_result": {"name": "CaseLocator"}, "result": {"error": "Invalid query type"}}    
    if query_type == 'CaseName':
        print(f'_*_ CASE QUERY NAME {query} _*_')
        best_match = process.extractOne(query, cases)
        print(f'_*_ {best_match} LOCATED _*_')
        admin_name = df['Administrator Names:'][df['Company Name:'] == best_match[0]].values[0]
        print(f'_*_ ADMIN NAME: {admin_name} LOCATED _*_')
    elif query_type == 'AdministratorName':
        print(f'_*_ Attempting to match Admin Name to Case Name Now {query} _*_')
        best_match = process.extractOne(query, cases)
        if best_match[1] >= 90:
            print(f'_*_ {best_match} LOCATED _*_')
            admin_name = df['Administrator Names:'][df['Company Name:'] == best_match[0]].values[0]
            print(f'_*_ ADMIN NAME: {admin_name} LOCATED _*_')
        else:
            return None, None
    else:
        return None, None
    in_memory_cache.set("AGENT_FIRST.case_locator", {'admin_name': admin_name, 'case': best_match[0]})
    return best_match[0], admin_name

async def get_admin_tel_number(admin_name):
    result = df[df["Administrator Names:"] == admin_name]["Administrator's Tel Number:"]
    if not result.empty:
        return str(result.values[0])
    else:
        return "Administrator not found."