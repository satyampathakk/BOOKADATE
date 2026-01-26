#!/usr/bin/env python3
"""
Test script for admin APIs
"""
import requests
import json

# Configuration
GATEWAY_URL = "http://localhost:8000"
ADMIN_CREDS = {
    "email": "admin@example.com",
    "password": "SuperSecret123"
}

def test_admin_auth():
    """Test admin authentication"""
    print("🔐 Testing Admin Authentication...")
    try:
        response = requests.post(f"{GATEWAY_URL}/admin/auth", json=ADMIN_CREDS)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_registrations():
    """Test getting registrations"""
    print("\n📋 Testing Get Registrations...")
    try:
        payload = {
            **ADMIN_CREDS,
            "status": None  # Get all registrations
        }
        response = requests.post(f"{GATEWAY_URL}/admin/registrations", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Found {len(data)} registrations")
        if data:
            print("Sample registration:")
            print(json.dumps(data[0], indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_pending_registrations():
    """Test getting pending registrations"""
    print("\n📋 Testing Get Pending Registrations...")
    try:
        payload = {
            **ADMIN_CREDS,
            "status": "pending"
        }
        response = requests.post(f"{GATEWAY_URL}/admin/registrations", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Found {len(data)} pending registrations")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_approve_registration():
    """Test approving a registration"""
    print("\n✅ Testing Approve Registration...")
    
    # First get registrations to find a pending one
    try:
        payload = {
            **ADMIN_CREDS,
            "status": "pending"
        }
        response = requests.post(f"{GATEWAY_URL}/admin/registrations", json=payload)
        registrations = response.json()
        
        pending_users = [r for r in registrations if r.get('registration_status') == 'pending']
        if not pending_users:
            print("No pending registrations found to approve")
            return True
        
        user_id = pending_users[0]['id']
        print(f"Approving user: {user_id}")
        
        response = requests.post(f"{GATEWAY_URL}/admin/registrations/{user_id}/approve", json=ADMIN_CREDS)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_reject_registration():
    """Test rejecting a registration"""
    print("\n❌ Testing Reject Registration...")
    
    # First get registrations to find a pending one
    try:
        payload = {
            **ADMIN_CREDS,
            "status": "pending"
        }
        response = requests.post(f"{GATEWAY_URL}/admin/registrations", json=payload)
        registrations = response.json()
        
        pending_users = [r for r in registrations if r.get('registration_status') == 'pending']
        if not pending_users:
            print("No pending registrations found to reject")
            return True
        
        user_id = pending_users[0]['id']
        print(f"Rejecting user: {user_id}")
        
        reject_payload = {
            **ADMIN_CREDS,
            "reason": "Test rejection from API test"
        }
        
        response = requests.post(f"{GATEWAY_URL}/admin/registrations/{user_id}/reject", json=reject_payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all admin API tests"""
    print("🧪 Testing Admin APIs")
    print("=" * 50)
    
    tests = [
        ("Admin Authentication", test_admin_auth),
        ("Get All Registrations", test_get_registrations),
        ("Get Pending Registrations", test_get_pending_registrations),
        ("Approve Registration", test_approve_registration),
        ("Reject Registration", test_reject_registration),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 {test_name}")
        print("-" * 30)
        success = test_func()
        results.append((test_name, success))
        print(f"Result: {'✅ PASS' if success else '❌ FAIL'}")
    
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All admin API tests passed!")
    else:
        print("⚠️  Some admin API tests failed!")

if __name__ == "__main__":
    main()