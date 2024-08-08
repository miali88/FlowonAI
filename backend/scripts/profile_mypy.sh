#!/bin/bash

# Determine the script's directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

# Set the path to the existing virtual environment
VENV_PATH="/Users/michaelali/Library/CloudStorage/OneDrive-Personal/Softwares/FlowonAI/venv"

# Check if the virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    echo "Error: Virtual environment not found at $VENV_PATH"
    exit 1
fi

# Activate the virtual environment
source "$VENV_PATH/bin/activate"

# Change to the project root directory
cd "$PROJECT_ROOT"

# Install required packages
pip install mypy memory_profiler matplotlib

# Run mypy with profiling
echo "Running mypy with memory profiling..."
mprof run --include-children mypy app --explicit-package-bases --config-file "$PROJECT_ROOT/pyproject.toml"

# Generate the plot
echo "Generating memory usage plot..."
mprof plot -o "$SCRIPT_DIR/mypy_memory_profile.png"

echo "Memory profile has been saved to $SCRIPT_DIR/mypy_memory_profile.png"

# Deactivate the virtual environment
deactivate