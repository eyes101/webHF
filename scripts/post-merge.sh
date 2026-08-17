#!/bin/bash
set -e

# Install frontend dependencies
cd frontend && npm install --prefer-offline 2>/dev/null || npm install
cd ..
