from setuptools import setup, find_packages
import os

# Read requirements.txt but make versions flexible
def read_requirements(filename="requirements.txt"):
    with open(filename) as f:
        # Remove exact version pins (==) and make them minimum versions (>=)
        return [
            line.strip().replace('==', '>=') 
            for line in f 
            if line.strip() and not line.startswith("#")
        ]

# Get requirements
try:
    install_requires = read_requirements()
except FileNotFoundError:
    install_requires = []

setup(
    name="flowon_backend",
    version="0.1.0",
    packages=find_packages(exclude=["*.tests", "*.tests.*", "tests.*", "tests"]),
    install_requires=install_requires,
    python_requires='>=3.12',  # Specify your minimum Python version
    author="Your Name",
    author_email="your.email@example.com",
    description="A short description of your project",
    long_description=open('README.md').read() if os.path.exists('README.md') else '',
    long_description_content_type="text/markdown",
)