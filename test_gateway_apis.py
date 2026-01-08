#!/usr/bin/env python3
"""
Gateway API Test Script - Tests APIs through the gateway with proper error handling
"""

import requests
import json
import time
import tempfile
import os
from datetime import datetime, timedelta
import uuid

class GatewayAPITester:
    def __init__(self, gateway_url: str = "http://localhost:8000"):
        self.gateway_url = gateway_url
        self.session = requests.Session()
        self.auth_token = None
        self.results = {"passed": 0, "failed": 0, "errors": []}
        
        # Hard-coded admin credentials
        self.admin_creds = {
            "email": "admin@example.com",
            "password": "SuperSecret123"
        }
        
    def log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_result(self, test_name: str, success: bool, message: str = ""):
        if success:
            self.results["passed"] += 1
            self.log(f"✅ {test_name} {message}")
        else:
            self.results["failed"] += 1
            error_msg = f"❌ {test_name} {message}"
            self.log(error_msg, "ERROR")
            self.results["errors"].append(error_msg)
            
    def create_test_file(self, filename: str = "test.jpg") -> str:
        """Create a temporary test file"""
        temp_dir = tempfile.gettempdir()
        filepath = os.path.join(temp_dir, filename)
        with open(filepath, 'wb') as f:
            f.write(b'fake_image_data_for_testing')
        return filepath
        
    # -------------------------------
    # Health & Public Endpoints
    # -------------------------------
    def test_health_checks(self):
        self.log("=== Testing Health Checks ===")
        try:
            response = self.session.get(f"{self.gateway_url}/health")
            self.test_result("Gateway Health", response.status_code == 200, f"({response.status_code})")
        except Exception as e:
            self.test_result("Gateway Health", False, f"Connection error: {e}")
            
    def test_public_endpoints(self):
        self.log("=== Testing Public Endpoints ===")
        login_data = {"email": "nonexistent@test.com", "password": "wrongpass"}
        try:
            response = self.session.post(f"{self.gateway_url}/auth/login", json=login_data)
            success = response.status_code in [401, 422]
            self.test_result("Login Invalid Credentials", success, f"({response.status_code})")
        except Exception as e:
            self.test_result("Login Invalid Credentials", False, f"Error: {e}")
            
    def test_user_signup(self):
        self.log("=== Testing User Signup ===")
        id_doc_path = self.create_test_file("id_doc.jpg")
        selfie_path = self.create_test_file("selfie.jpg")
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        signup_data = {
            "name": "Test User",
            "email": test_email,
            "phone": "+1234567890",
            "gender": "male",
            "dob": "1990-01-01",
            "password": "testpass123",
            "bio": "Test bio"
        }
        try:
            with open(id_doc_path, "rb") as id_file, open(selfie_path, "rb") as selfie_file:
                files = {
                    "id_document": ("id_doc.jpg", id_file, "image/jpeg"),
                    "selfie": ("selfie.jpg", selfie_file, "image/jpeg")
                }
                response = self.session.post(f"{self.gateway_url}/auth/signup", data=signup_data, files=files)
                if response.status_code == 200:
                    self.test_result("User Signup", True, f"User created successfully")
                    return response.json().get("user_id"), test_email
                else:
                    self.test_result("User Signup", False, f"({response.status_code}) {response.text[:100]}")
        except Exception as e:
            self.test_result("User Signup", False, f"Error: {e}")
        finally:
            try:
                os.unlink(id_doc_path)
                os.unlink(selfie_path)
            except:
                pass
        return None, None
        
    # -------------------------------
    # Chat & Venue
    # -------------------------------
    def test_chat_service_direct(self):
        self.log("=== Testing Chat Service Direct ===")
        chat_data = {
            "user1_id": "user1",
            "user2_id": "user2",
            "meeting_time": (datetime.now() + timedelta(hours=1)).isoformat(),
            "duration_minutes": 120
        }
        try:
            response = requests.post("http://localhost:8001/match", json=chat_data)
            self.test_result("Chat Service Direct", response.status_code == 200, f"({response.status_code})")
            
            response = self.session.post(f"{self.gateway_url}/chat/match", json=chat_data)
            if response.status_code == 401:
                self.test_result("Chat Service Gateway", False, "Gateway incorrectly requires auth for chat/match")
            else:
                self.test_result("Chat Service Gateway", response.status_code == 200, f"({response.status_code})")
        except Exception as e:
            self.test_result("Chat Service", False, f"Error: {e}")
            
    def test_venue_list_public(self):
        self.log("=== Testing Public Venue Access ===")
        try:
            response = requests.get("http://localhost:8004/venues/")
            self.test_result("Venue List Direct", response.status_code == 200, f"({response.status_code})")
            
            response = self.session.get(f"{self.gateway_url}/venues/")
            if response.status_code == 401:
                self.test_result("Venue List Gateway", False, "Gateway requires auth for venue listing")
            else:
                self.test_result("Venue List Gateway", response.status_code == 200, f"({response.status_code})")
        except Exception as e:
            self.test_result("Venue List", False, f"Error: {e}")
            
    # -------------------------------
    # Admin Endpoints
    # -------------------------------
    def test_admin_list_registrations(self):
        self.log("=== Testing Admin List Registrations ===")
        try:
            response = self.session.get(f"{self.gateway_url}/admin/registrations", json=self.admin_creds)
            self.test_result(
                "Admin List Registrations",
                response.status_code == 200,
                f"({response.status_code})"
            )
        except Exception as e:
            self.test_result("Admin List Registrations", False, f"Error: {e}")

    def test_admin_approve_invalid_user(self):
        self.log("=== Testing Admin Approve Invalid User ===")
        user_id = "invalid-user"
        try:
            response = self.session.post(f"{self.gateway_url}/admin/registrations/{user_id}/approve", json=self.admin_creds)
            success = response.status_code in [404, 200]
            self.test_result(
                "Admin Approve Invalid User",
                success,
                f"({response.status_code})"
            )
        except Exception as e:
            self.test_result("Admin Approve Invalid User", False, f"Error: {e}")

    def test_admin_reject_invalid_user(self):
        self.log("=== Testing Admin Reject Invalid User ===")
        user_id = "invalid-user"
        payload = {**self.admin_creds, "reason": "Testing rejection"}
        try:
            response = self.session.post(f"{self.gateway_url}/admin/registrations/{user_id}/reject", json=payload)
            success = response.status_code in [404, 200]
            self.test_result(
                "Admin Reject Invalid User",
                success,
                f"({response.status_code})"
            )
        except Exception as e:
            self.test_result("Admin Reject Invalid User", False, f"Error: {e}")

    # -------------------------------
    # Run All Tests
    # -------------------------------
    def run_diagnostic_tests(self):
        self.log("🔍 Running Gateway API Diagnostic Tests")
        start_time = time.time()
        
        try:
            self.test_health_checks()
            self.test_public_endpoints()
            self.test_user_signup()
            self.test_chat_service_direct()
            self.test_venue_list_public()
            
            # -------------------------------
            # Admin tests
            # -------------------------------
            self.test_admin_list_registrations()
            self.test_admin_approve_invalid_user()
            self.test_admin_reject_invalid_user()
            
        except KeyboardInterrupt:
            self.log("Tests interrupted by user", "WARNING")
        except Exception as e:
            self.log(f"Unexpected error: {e}", "ERROR")
            
        end_time = time.time()
        duration = end_time - start_time
        self.log("=" * 60)
        self.log("📊 DIAGNOSTIC SUMMARY")
        self.log(f"✅ Passed: {self.results['passed']}")
        self.log(f"❌ Failed: {self.results['failed']}")
        self.log(f"⏱️  Duration: {duration:.2f} seconds")
        
        if self.results["errors"]:
            self.log("\n🔍 ISSUES IDENTIFIED:")
            for error in self.results["errors"]:
                self.log(f"  • {error}")
                
        total_tests = self.results['passed'] + self.results['failed']
        if total_tests > 0:
            success_rate = (self.results['passed'] / total_tests) * 100
            self.log(f"\n🎯 Success Rate: {success_rate:.1f}%")
            
        return self.results

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Test Gateway APIs and diagnose issues")
    parser.add_argument("--gateway-url", default="http://localhost:8000", help="Gateway URL")
    args = parser.parse_args()
    
    tester = GatewayAPITester(args.gateway_url)
    results = tester.run_diagnostic_tests()
    
    exit_code = 0 if results["failed"] == 0 else 1
    exit(exit_code)

if __name__ == "__main__":
    main()
