#!/bin/bash

echo "========================================"
echo "   ZELL - File Converter & Editor"
echo "   Installation and Setup Script"
echo "========================================"
echo

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Then run this script again."
    exit 1
fi

echo "Node.js found: $(node --version)"
echo

# Check if npm is installed
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    echo "Please install npm (comes with Node.js)"
    exit 1
fi

echo "npm found: $(npm --version)"
echo

# Install dependencies
echo "Installing ZELL dependencies..."
echo "This may take a few minutes..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    echo "Please check your internet connection and try again."
    exit 1
fi

echo
echo "========================================"
echo "   Installation Complete!"
echo "========================================"
echo

# Menu for running options
echo "Choose how to run ZELL:"
echo
echo "1. Web Version (Recommended for testing)"
echo "2. Desktop App (Electron)"
echo "3. Exit"
echo

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo
        echo "Starting ZELL Web Version..."
        echo "The app will open in your default browser."
        echo "Press Ctrl+C to stop the server."
        echo
        npm run web
        ;;
    2)
        echo
        echo "Installing Electron for desktop app..."
        npm install electron --save-dev
        echo
        echo "Starting ZELL Desktop App..."
        npm run build:desktop
        ;;
    3)
        echo
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo
echo "Thank you for using ZELL!"

