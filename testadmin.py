#!/usr/bin/env python3
"""
Comprehensive Admin API Test Script for User Service
Tests all admin endpoints with proper authentication
"""

import requests
import json
from typing import Optional, Dict, Any, List

# Configuration
BASE_URL = "http://localhost:8006"  # User service port
ADMIN_PREFIX = "/admin"

# Admin credentials (hard-coded in the API)
ADMIN_CREDENTIALS = {
    "email": "admin@example.com",
    "password": "SuperSecret123"
}

def print_response(name: str, resp: requests.Response):
    """Helper function to print formatted response"""
    print(f"\n{'='*50}")
    print(f"🧪 {name}")
    print(f"{'='*50}")
    print(f"Status Code: {resp.status_code}")
    print(f"URL: {resp.url}")
    
    try:
        response_data = resp.json()
        print("Response:")
        print(json.dumps(response_data, indent=2, default=str))
    except:
        print("Raw Response:")
        print(resp.text)
    
    # Status indicator
    if 200 <= resp.status_code < 300:
        print("✅ SUCCESS")
    else:
        print("❌ FAILED")


def test_health():
    """Test if the user service is running"""
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=5)
        print_response("Health Check", resp)
        return resp.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"❌ Service not reachable: {e}")
        return False


def create_test_user() -> Optional[str]:
    """Create a test user for admin operations"""
    payload = {
        "name": "Test Admin User",
        "email": "testadmin@example.com",
        "phone": "1234567890",
        "gender": "male",
        "dob": "1995-01-01",
        "password": "testpassword123",
        "bio": "Test user for admin operations"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/users/", json=payload)
        print_response("Create Test User", resp)
        
        if resp.status_code == 200:
            return resp.json().get("id")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to create test user: {e}")
        return None


def test_list_all_registrations():
    """Test GET /admin/registrations - List all registrations"""
    try:
        # Send credentials in request body as required by the API
        resp = requests.get(f"{BASE_URL}{ADMIN_PREFIX}/registrations", json=ADMIN_CREDENTIALS)
        print_response("List All Registrations", resp)
        return resp.json() if resp.status_code == 200 else []
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to list registrations: {e}")
        return []


def test_list_registrations_by_status(status: str):
    """Test GET /admin/registrations?status={status} - List registrations by status"""
    try:
        # Send credentials in request body and status as query parameter
        resp = requests.get(
            f"{BASE_URL}{ADMIN_PREFIX}/registrations", 
            params={"status": status},
            json=ADMIN_CREDENTIALS
        )
        print_response(f"List Registrations (Status: {status})", resp)
        return resp.json() if resp.status_code == 200 else []
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to list registrations by status: {e}")
        return []


def test_get_registration(user_id: str):
    """Test GET /admin/registrations/{user_id} - Get specific registration"""
    try:
        # Send credentials in request body
        resp = requests.get(f"{BASE_URL}{ADMIN_PREFIX}/registrations/{user_id}", json=ADMIN_CREDENTIALS)
        print_response(f"Get Registration (ID: {user_id})", resp)
        return resp.json() if resp.status_code == 200 else None
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to get registration: {e}")
        return None


def test_approve_registration(user_id: str):
    """Test POST /admin/registrations/{user_id}/approve - Approve registration"""
    try:
        # Send credentials in request body
        resp = requests.post(f"{BASE_URL}{ADMIN_PREFIX}/registrations/{user_id}/approve", json=ADMIN_CREDENTIALS)
        print_response(f"Approve Registration (ID: {user_id})", resp)
        return resp.json() if resp.status_code == 200 else None
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to approve registration: {e}")
        return None


def test_reject_registration(user_id: str, reason: str = "Test rejection"):
    """Test POST /admin/registrations/{user_id}/reject - Reject registration"""
    # Include admin credentials and rejection reason in payload
    payload = {
        **ADMIN_CREDENTIALS,
        "reason": reason
    }
    
    try:
        resp = requests.post(f"{BASE_URL}{ADMIN_PREFIX}/registrations/{user_id}/reject", json=payload)
        print_response(f"Reject Registration (ID: {user_id})", resp)
        return resp.json() if resp.status_code == 200 else None
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to reject registration: {e}")
        return None


def test_invalid_admin_credentials():
    """Test admin operations with invalid credentials"""
    print(f"\n{'='*60}")
    print("🔍 TESTING INVALID ADMIN CREDENTIALS")
    print(f"{'='*60}")
    
    invalid_creds = {
        "email": "wrong@example.com",
        "password": "wrongpassword"
    }
    
    # Test list registrations with invalid credentials
    try:
        resp = requests.get(f"{BASE_URL}{ADMIN_PREFIX}/registrations", json=invalid_creds)
        print_response("List Registrations (Invalid Creds)", resp)
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed: {e}")
    
    # Test approve with invalid credentials
    try:
        resp = requests.post(f"{BASE_URL}{ADMIN_PREFIX}/registrations/test-id/approve", json=invalid_creds)
        print_response("Approve Registration (Invalid Creds)", resp)
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed: {e}")


def test_invalid_user_operations():
    """Test admin operations with invalid user IDs"""
    invalid_user_id = "invalid-user-id-12345"
    
    print(f"\n{'='*60}")
    print("🔍 TESTING INVALID USER OPERATIONS")
    print(f"{'='*60}")
    
    # Test get registration with invalid ID
    test_get_registration(invalid_user_id)
    
    # Test approve with invalid ID
    test_approve_registration(invalid_user_id)
    
    # Test reject with invalid ID
    test_reject_registration(invalid_user_id, "Invalid user test")


def test_edge_cases():
    """Test edge cases and error scenarios"""
    print(f"\n{'='*60}")
    print("🔍 TESTING EDGE CASES")
    print(f"{'='*60}")
    
    # Test with empty rejection reason
    print("\n--- Testing empty rejection reason ---")
    try:
        payload = {**ADMIN_CREDENTIALS, "reason": ""}
        resp = requests.post(f"{BASE_URL}{ADMIN_PREFIX}/registrations/test-id/reject", json=payload)
        print_response("Reject with Empty Reason", resp)
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed: {e}")
    
    # Test with missing rejection reason
    print("\n--- Testing missing rejection reason ---")
    try:
        payload = ADMIN_CREDENTIALS.copy()  # No reason field
        resp = requests.post(f"{BASE_URL}{ADMIN_PREFIX}/registrations/test-id/reject", json=payload)
        print_response("Reject with Missing Reason", resp)
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed: {e}")
    
    # Test with missing admin credentials
    print("\n--- Testing missing admin credentials ---")
    try:
        resp = requests.get(f"{BASE_URL}{ADMIN_PREFIX}/registrations")
        print_response("List Registrations (No Creds)", resp)
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed: {e}")


def run_comprehensive_admin_tests():
    """Run all admin API tests"""
    print("🚀 Starting Comprehensive Admin API Tests")
    print("=" * 80)
    
    # Check if service is running
    if not test_health():
        print("❌ User service is not running. Please start it first.")
        print("Run: python user_service/main.py")
        return
    
    # Create a test user for operations
    print(f"\n{'='*60}")
    print("📝 SETUP: Creating Test User")
    print(f"{'='*60}")
    
    test_user_id = create_test_user()
    if not test_user_id:
        print("❌ Could not create test user. Some tests may fail.")
    
    # Test all admin endpoints
    print(f"\n{'='*60}")
    print("📋 TESTING ADMIN REGISTRATION MANAGEMENT")
    print(f"{'='*60}")
    
    # 1. List all registrations
    all_registrations = test_list_all_registrations()
    
    # 2. List registrations by different statuses
    for status in ["pending", "approved", "rejected"]:
        test_list_registrations_by_status(status)
    
    # 3. Get specific registration (use test user if available, or first from list)
    target_user_id = test_user_id
    if not target_user_id and all_registrations:
        target_user_id = all_registrations[0].get("id")
    
    if target_user_id:
        # Get registration details
        registration = test_get_registration(target_user_id)
        
        if registration:
            current_status = registration.get("registration_status", "unknown")
            print(f"\n📊 Current registration status: {current_status}")
            
            # Test approval (if not already approved)
            if current_status != "approved":
                test_approve_registration(target_user_id)
                
                # Verify the approval worked
                updated_registration = test_get_registration(target_user_id)
                if updated_registration:
                    new_status = updated_registration.get("registration_status")
                    print(f"📊 Status after approval: {new_status}")
            
            # Test rejection (this will change the status)
            test_reject_registration(target_user_id, "Testing rejection functionality")
            
            # Verify the rejection worked
            final_registration = test_get_registration(target_user_id)
            if final_registration:
                final_status = final_registration.get("registration_status")
                rejection_reason = final_registration.get("rejection_reason")
                print(f"📊 Final status: {final_status}")
                print(f"📊 Rejection reason: {rejection_reason}")
    
    # Test error scenarios
    test_invalid_admin_credentials()
    test_invalid_user_operations()
    test_edge_cases()
    
    print(f"\n{'='*80}")
    print("🎉 Admin API Testing Complete!")
    print("=" * 80)
    print("\n📋 Summary of tested endpoints:")
    print("✅ GET /admin/registrations (with admin auth)")
    print("✅ GET /admin/registrations?status={status} (with admin auth)")
    print("✅ GET /admin/registrations/{user_id} (with admin auth)")
    print("✅ POST /admin/registrations/{user_id}/approve (with admin auth)")
    print("✅ POST /admin/registrations/{user_id}/reject (with admin auth)")
    print("\n🔍 Error scenarios tested:")
    print("✅ Invalid admin credentials")
    print("✅ Invalid user IDs")
    print("✅ Missing/empty rejection reasons")
    print("✅ Missing admin credentials")
    print("✅ Service connectivity")


if __name__ == "__main__":
    run_comprehensive_admin_tests()