#!/usr/bin/env python3
import json
import csv
import os
import logging
import argparse
from datetime import datetime
import glob
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('json_to_csv_converter')

def clean_data(data):
    """
    Clean the data by removing newlines and extra whitespace from string values
    
    Args:
        data (list): List of dictionaries containing the data
        
    Returns:
        list: Cleaned data
    """
    cleaned_data = []
    for record in data:
        cleaned_record = {}
        for key, value in record.items():
            if isinstance(value, str):
                # Special handling for phone numbers
                if key == 'phone':
                    # Strip all non-alphanumeric characters except for +, -, and spaces
                    # First remove any potential control characters or weird encoding
                    cleaned_value = ''.join(c for c in value if ord(c) < 128)  # Remove non-ASCII chars
                    # Extract just the phone number pattern
                    phone_match = re.search(r'(\+\d[\d\s\-]+)', cleaned_value)
                    if phone_match:
                        cleaned_value = phone_match.group(1)
                    else:
                        # If no match found, just clean it as best we can
                        cleaned_value = re.sub(r'[^\+\d\s\-]', '', cleaned_value)
                        cleaned_value = cleaned_value.strip()
                # Special handling for address
                elif key == 'address':
                    # Remove control characters and normalize whitespace
                    cleaned_value = ' '.join(value.split())
                    cleaned_value = cleaned_value.strip()
                else:
                    # Remove leading/trailing newlines and whitespace
                    cleaned_value = value.strip()
                    # Replace any remaining newlines within the text with spaces
                    cleaned_value = cleaned_value.replace('\n', ' ')
                    # Normalize whitespace (remove multiple spaces)
                    cleaned_value = ' '.join(cleaned_value.split())
            else:
                cleaned_value = value
            cleaned_record[key] = cleaned_value
        
        # Log the cleaning for debugging
        if 'phone' in record:
            logger.debug(f"Cleaned phone: '{record['phone']}' -> '{cleaned_record['phone']}'")
            
        cleaned_data.append(cleaned_record)
    
    return cleaned_data

def json_to_csv(json_file_path, output_dir=None):
    """
    Convert JSON file to CSV format
    
    Args:
        json_file_path (str): Path to the JSON file
        output_dir (str, optional): Directory to save the CSV file, defaults to same directory as JSON
    
    Returns:
        str: Path to the created CSV file
    """
    logger.info(f"Starting conversion of {json_file_path}")
    
    try:
        # Read JSON file
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            logger.info(f"Reading JSON data from {json_file_path}")
            data = json.load(json_file)
            logger.info(f"Successfully loaded JSON with {len(data)} records")
    except Exception as e:
        logger.error(f"Error reading JSON file: {e}")
        raise
    
    # Clean the data by removing newlines and extra whitespace
    logger.info("Cleaning data to remove newlines and extra whitespace")
    cleaned_data = clean_data(data)
    
    # Determine output directory and filename
    if output_dir is None:
        output_dir = os.path.dirname(json_file_path)
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate CSV filename from JSON filename
    json_filename = os.path.basename(json_file_path)
    csv_filename = os.path.splitext(json_filename)[0] + '.csv'
    csv_file_path = os.path.join(output_dir, csv_filename)
    
    logger.info(f"Will write CSV data to {csv_file_path}")
    
    try:
        # Get fieldnames (column headers) from the first record
        # Include all possible fields from all records
        fieldnames = set()
        for record in cleaned_data:
            fieldnames.update(record.keys())
        fieldnames = sorted(list(fieldnames))  # Sort for consistent ordering
        
        logger.info(f"Found {len(fieldnames)} fields: {', '.join(fieldnames)}")
        
        # Write data to CSV with explicit encoding
        with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(cleaned_data)
            
        logger.info(f"Successfully wrote {len(cleaned_data)} records to {csv_file_path}")
        return csv_file_path
    
    except Exception as e:
        logger.error(f"Error writing CSV file: {e}")
        raise

def process_directory(input_dir, output_dir=None, pattern="*.json"):
    """
    Process all JSON files in a directory
    
    Args:
        input_dir (str): Directory containing JSON files
        output_dir (str, optional): Directory to save CSV files
        pattern (str, optional): Glob pattern for JSON files
    
    Returns:
        list: Paths to created CSV files
    """
    logger.info(f"Processing JSON files in {input_dir} with pattern {pattern}")
    
    json_files = glob.glob(os.path.join(input_dir, pattern))
    logger.info(f"Found {len(json_files)} JSON files to process")
    
    csv_files = []
    for json_file in json_files:
        try:
            csv_file = json_to_csv(json_file, output_dir)
            csv_files.append(csv_file)
        except Exception as e:
            logger.error(f"Failed to process {json_file}: {e}")
    
    return csv_files

def main():
    # Hardcoded parameters - replace with your actual paths
    # Use relative paths from the project root
    input_path = "backend/data/roofers/roofers_data_20250226_051821.json"  # Processing just one file to ensure it works
    output_dir = "backend/data/roofers"  # Same directory for simplicity
    
    logger.info(f"Using hardcoded parameters - Input: {input_path}, Output: {output_dir}")
    
    if os.path.isdir(input_path):
        logger.info(f"Input is a directory: {input_path}")
        csv_files = process_directory(input_path, output_dir)
        logger.info(f"Created {len(csv_files)} CSV files")
    elif os.path.isfile(input_path):
        logger.info(f"Input is a file: {input_path}")
        csv_file = json_to_csv(input_path, output_dir)
        logger.info(f"Created CSV file: {csv_file}")
    else:
        logger.error(f"Input does not exist: {input_path}")
        raise FileNotFoundError(f"Input not found: {input_path}")

if __name__ == "__main__":
    start_time = datetime.now()
    logger.info(f"Script started at {start_time}")
    
    try:
        main()
    except Exception as e:
        logger.error(f"Script failed with error: {e}")
        raise
    finally:
        end_time = datetime.now()
        duration = end_time - start_time
        logger.info(f"Script completed at {end_time}")
        logger.info(f"Total runtime: {duration}")
