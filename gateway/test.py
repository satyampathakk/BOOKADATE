import requests
import json
import time
from typing import Optional, Tuple

# Gateway URL
GATEWAY_URL = "http://localhost:8080"

# Test data storage
test_data = {
    "user1": {
        "email": "testuser1@example.com",
        "password": "testpass123",
        "token": None,
        "user_id": None
    },
    "user2": {
        "email": "testuser2@example.com",
        "password": "testpass456",
        "token": None,
        "user_id": None
    }
}

class Colors:
    """ANSI color codes for pretty output"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text:^80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.END}\n")

def print_test(name: str):
    """Print test name"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}🧪 TEST: {name}{Colors.END}")
    print(f"{Colors.BLUE}{'-'*80}{Colors.END}")

def print_response(name: str, resp: requests.Response, show_body: bool = True):
    """Print formatted response"""
    status_color = Colors.GREEN if 200 <= resp.status_code < 300 else Colors.RED
    print(f"\n{Colors.BOLD}📡 {name}{Colors.END}")
    print(f"{status_color}Status: {resp.status_code}{Colors.END}")
    
    if show_body:
        try:
            body = resp.json()
            # Truncate token for display
            if isinstance(body, dict) and "access_token" in body:
                body_display = body.copy()
                body_display["access_token"] = body["access_token"][:30] + "..."
                print(f"Response: {json.dumps(body_display, indent=2)}")
            else:
                print(f"Response: {json.dumps(body, indent=2)}")
        except:
            print(f"Raw Response: {resp.text}")

def print_result(success: bool, message: str):
    """Print test result"""
    if success:
        print(f"{Colors.GREEN}✅ PASS: {message}{Colors.END}")
    else:
        print(f"{Colors.RED}❌ FAIL: {message}{Colors.END}")
    print(f"{Colors.BLUE}{'-'*80}{Colors.END}")

# ==================== TEST FUNCTIONS ====================

def test_gateway_health() -> bool:
    """Test gateway health endpoint"""
    print_test("Gateway Health Check")
    
    try:
        r = requests.get(f"{GATEWAY_URL}/health", timeout=5)
        print_response("Health Check", r)
        
        if r.status_code == 200:
            data = r.json()
            gateway_healthy = data.get("gateway") == "healthy"
            services = data.get("services", {})
            
            print(f"\n{Colors.BOLD}Service Status:{Colors.END}")
            for service, status in services.items():
                health = status.get("status", "unknown")
                color = Colors.GREEN if health == "healthy" else Colors.RED
                print(f"  {color}• {service}: {health}{Colors.END}")
            
            print_result(gateway_healthy, "Gateway is healthy")
            return gateway_healthy
        else:
            print_result(False, f"Gateway returned status {r.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Failed to connect to gateway: {e}")
        return False

def test_signup(email: str, password: str, name: str) -> Tuple[Optional[str], Optional[str]]:
    """Test user signup"""
    print_test(f"User Signup - {email}")
    
    payload = {
        "name": name,
        "email": email,
        "phone": "9876543210",
        "gender": "female",
        "dob": "1995-06-20",
        "password": password,
        "bio": "Test user for gateway testing"
    }
    
    try:
        r = requests.post(f"{GATEWAY_URL}/auth/signup", json=payload)
        print_response("Signup", r)
        
        if r.status_code == 201:
            data = r.json()
            token = data.get("access_token")
            user_id = data.get("user", {}).get("id")
            print_result(True, f"Signup successful - User ID: {user_id}")
            return token, user_id
        else:
            print_result(False, f"Signup failed with status {r.status_code}")
            return None, None
    except Exception as e:
        print_result(False, f"Signup request failed: {e}")
        return None, None

def test_login(email: str, password: str) -> Optional[str]:
    """Test user login"""
    print_test(f"User Login - {email}")
    
    payload = {
        "email": email,
        "password": password
    }
    
    try:
        r = requests.post(f"{GATEWAY_URL}/auth/login", json=payload)
        print_response("Login", r)
        
        if r.status_code == 200:
            data = r.json()
            token = data.get("access_token")
            print_result(True, "Login successful")
            return token
        else:
            print_result(False, f"Login failed with status {r.status_code}")
            return None
    except Exception as e:
        print_result(False, f"Login request failed: {e}")
        return None

def test_login_invalid_credentials() -> bool:
    """Test login with invalid credentials"""
    print_test("Login with Invalid Credentials (Should Fail)")
    
    payload = {
        "email": "wrong@example.com",
        "password": "wrongpassword"
    }
    
    try:
        r = requests.post(f"{GATEWAY_URL}/auth/login", json=payload)
        print_response("Login with Invalid Credentials", r)
        
        success = r.status_code == 401
        print_result(success, "Invalid credentials properly rejected" if success else "Failed to reject invalid credentials")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

def test_protected_route_without_token(user_id: str) -> bool:
    """Test accessing protected route without authentication"""
    print_test("Access Protected Route WITHOUT Token (Should Fail)")
    
    try:
        r = requests.get(f"{GATEWAY_URL}/users/{user_id}")
        print_response("Get User Without Token", r)
        
        success = r.status_code == 401
        print_result(success, "Unauthorized access properly blocked" if success else "Failed to block unauthorized access")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

def test_protected_route_with_invalid_token(user_id: str) -> bool:
    """Test accessing protected route with invalid token"""
    print_test("Access Protected Route with INVALID Token (Should Fail)")
    
    headers = {"Authorization": "Bearer invalid_token_12345"}
    
    try:
        r = requests.get(f"{GATEWAY_URL}/users/{user_id}", headers=headers)
        print_response("Get User With Invalid Token", r)
        
        success = r.status_code == 401
        print_result(success, "Invalid token properly rejected" if success else "Failed to reject invalid token")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

def test_get_user(user_id: str, token: str) -> bool:
    """Test getting user details with valid token"""
    print_test("Get User Details with Valid Token")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        r = requests.get(f"{GATEWAY_URL}/users/{user_id}", headers=headers)
        print_response("Get User", r)
        
        success = r.status_code == 200
        if success:
            data = r.json()
            print(f"\n{Colors.BOLD}User Info:{Colors.END}")
            print(f"  Name: {data.get('name')}")
            print(f"  Email: {data.get('email')}")
            print(f"  ID: {data.get('id')}")
        
        print_result(success, "Successfully retrieved user" if success else "Failed to retrieve user")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

def test_get_current_user(token: str) -> bool:
    """Test getting current authenticated user"""
    print_test("Get Current User (Me Endpoint)")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        r = requests.get(f"{GATEWAY_URL}/auth/me", headers=headers)
        print_response("Get Current User", r)
        
        success = r.status_code == 200
        print_result(success, "Successfully retrieved current user" if success else "Failed to retrieve current user")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

def test_update_user(user_id: str, token: str) -> bool:
    """Test updating user information"""
    print_test("Update User Information")
    
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Updated Test User",
        "bio": "Bio updated through gateway test"
    }
    
    try:
        r = requests.put(f"{GATEWAY_URL}/users/{user_id}", json=payload, headers=headers)
        print_response("Update User", r)
        
        success = r.status_code == 200
        print_result(success, "Successfully updated user" if success else "Failed to update user")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

def test_update_preferences(user_id: str, token: str) -> bool:
    """Test updating user preferences"""
    print_test("Update User Preferences")
    
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "min_age": 25,
        "max_age": 35,
        "distance_km": 50,
        "preferred_gender": "male"
    }
    
    try:
        r = requests.put(f"{GATEWAY_URL}/users/{user_id}/preferences", json=payload, headers=headers)
        print_response("Update Preferences", r)
        
        success = r.status_code == 200
        print_result(success, "Successfully updated preferences" if success else "Failed to update preferences")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

def test_get_preferences(user_id: str, token: str) -> bool:
    """Test getting user preferences"""
    print_test("Get User Preferences")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        r = requests.get(f"{GATEWAY_URL}/users/{user_id}/preferences", headers=headers)
        print_response("Get Preferences", r)
        
        success = r.status_code == 200
        print_result(success, "Successfully retrieved preferences" if success else "Failed to retrieve preferences")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

def test_token_reuse(user_id: str, token: str) -> bool:
    """Test that the same token can be reused multiple times"""
    print_test("Token Reuse (Multiple Requests with Same Token)")
    
    headers = {"Authorization": f"Bearer {token}"}
    success_count = 0
    
    for i in range(3):
        try:
            r = requests.get(f"{GATEWAY_URL}/users/{user_id}", headers=headers)
            if r.status_code == 200:
                success_count += 1
            print(f"  Request {i+1}: Status {r.status_code}")
            time.sleep(0.5)
        except Exception as e:
            print(f"  Request {i+1}: Failed - {e}")
    
    success = success_count == 3
    print_result(success, f"Token reused successfully {success_count}/3 times" if success else f"Token reuse failed ({success_count}/3)")
    return success

def test_cross_user_access(user1_id: str, user2_token: str) -> bool:
    """Test that User 2 can access User 1's profile (authenticated access)"""
    print_test("Cross-User Access (User 2 accessing User 1's profile)")
    
    headers = {"Authorization": f"Bearer {user2_token}"}
    
    try:
        r = requests.get(f"{GATEWAY_URL}/users/{user1_id}", headers=headers)
        print_response("Cross-User Access", r)
        
        # This should succeed as long as the token is valid
        # (Authorization, not ownership validation)
        success = r.status_code == 200
        print_result(success, "Authenticated user can access other profiles" if success else "Failed to access other user profile")
        return success
    except Exception as e:
        print_result(False, f"Request failed: {e}")
        return False

# ==================== MAIN TEST RUNNER ====================

def run_all_tests():
    """Run complete test suite"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("╔════════════════════════════════════════════════════════════════════════════════╗")
    print("║                          API GATEWAY TEST SUITE                               ║")
    print("║                                                                                ║")
    print("║  Testing authentication, authorization, and request routing                   ║")
    print("╚════════════════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}\n")
    
    results = []
    
    # Phase 1: Gateway Health
    print_header("PHASE 1: GATEWAY HEALTH")
    results.append(("Gateway Health", test_gateway_health()))
    
    # Phase 2: Authentication Tests
    print_header("PHASE 2: AUTHENTICATION")
    
    # Signup User 1
    token1, user_id1 = test_signup(
        test_data["user1"]["email"],
        test_data["user1"]["password"],
        "Test User One"
    )
    results.append(("User 1 Signup", token1 is not None))
    
    if token1 and user_id1:
        test_data["user1"]["token"] = token1
        test_data["user1"]["user_id"] = user_id1
    else:
        print(f"\n{Colors.RED}❌ User 1 signup failed. Cannot continue tests.{Colors.END}\n")
        return
    
    # Signup User 2
    token2, user_id2 = test_signup(
        test_data["user2"]["email"],
        test_data["user2"]["password"],
        "Test User Two"
    )
    results.append(("User 2 Signup", token2 is not None))
    
    if token2 and user_id2:
        test_data["user2"]["token"] = token2
        test_data["user2"]["user_id"] = user_id2
    
    # Test login
    new_token = test_login(test_data["user1"]["email"], test_data["user1"]["password"])
    results.append(("User Login", new_token is not None))
    
    # Test invalid login
    results.append(("Invalid Login Rejection", test_login_invalid_credentials()))
    
    # Phase 3: Authorization Tests
    print_header("PHASE 3: AUTHORIZATION")
    
    results.append(("Block No Token", test_protected_route_without_token(user_id1)))
    results.append(("Block Invalid Token", test_protected_route_with_invalid_token(user_id1)))
    
    # Phase 4: Authenticated Requests
    print_header("PHASE 4: AUTHENTICATED REQUESTS")
    
    results.append(("Get User", test_get_user(user_id1, token1)))
    results.append(("Get Current User", test_get_current_user(token1)))
    results.append(("Update User", test_update_user(user_id1, token1)))
    results.append(("Update Preferences", test_update_preferences(user_id1, token1)))
    results.append(("Get Preferences", test_get_preferences(user_id1, token1)))
    
    # Phase 5: Token Management
    print_header("PHASE 5: TOKEN MANAGEMENT")
    
    results.append(("Token Reuse", test_token_reuse(user_id1, token1)))
    
    if user_id2 and token2:
        results.append(("Cross-User Access", test_cross_user_access(user_id1, token2)))
    
    # Final Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    pass_rate = (passed / total * 100) if total > 0 else 0
    
    print(f"\n{Colors.BOLD}Results:{Colors.END}\n")
    
    for test_name, success in results:
        status = f"{Colors.GREEN}✅ PASS{Colors.END}" if success else f"{Colors.RED}❌ FAIL{Colors.END}"
        print(f"  {status}  {test_name}")
    
    print(f"\n{Colors.BOLD}{'─'*80}{Colors.END}\n")
    
    color = Colors.GREEN if pass_rate == 100 else Colors.YELLOW if pass_rate >= 70 else Colors.RED
    print(f"{color}{Colors.BOLD}Total: {passed}/{total} tests passed ({pass_rate:.1f}%){Colors.END}\n")
    
    if pass_rate == 100:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Gateway is working perfectly!{Colors.END}\n")
    elif pass_rate >= 70:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠️  Most tests passed, but some issues detected.{Colors.END}\n")
    else:
        print(f"{Colors.RED}{Colors.BOLD}❌ Multiple tests failed. Please check the gateway configuration.{Colors.END}\n")
    
    print(f"{Colors.BOLD}Test Data Summary:{Colors.END}")
    print(f"  User 1 ID: {test_data['user1']['user_id']}")
    print(f"  User 1 Token: {test_data['user1']['token'][:30] if test_data['user1']['token'] else 'None'}...")
    print(f"  User 2 ID: {test_data['user2']['user_id']}")
    print(f"  User 2 Token: {test_data['user2']['token'][:30] if test_data['user2']['token'] else 'None'}...\n")

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Tests interrupted by user.{Colors.END}\n")
    except Exception as e:
        print(f"\n\n{Colors.RED}Test suite failed with error: {e}{Colors.END}\n")