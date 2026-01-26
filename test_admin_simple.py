#!/usr/bin/env python3
"""
Simple test for admin APIs
"""
import requests
import json

# Test admin authentication
def test_admin():
    url = "http://localhost:8000/admin/auth"
    payload = {
        "email": "admin@example.com",
        "password": "SuperSecret123"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

# Test get registrations
def test_registrations():
    url = "http://localhost:8000/admin/registrations"
    payload = {
        "email": "admin@example.com",
        "password": "SuperSecret123"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Found {len(data)} registrations")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Admin Auth...")
    test_admin()
    
    print("\nTesting Get Registrations...")
    test_registrations()