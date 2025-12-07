import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(name, resp):
    print(f"\n==== {name} ====")
    print("Status:", resp.status_code)
    try:
        print("Response:", json.dumps(resp.json(), indent=2))
    except:
        print("Raw Response:", resp.text)


def test_health():
    r = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", r)


def test_create_user():
    payload = {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9999999999",
        "gender": "male",
        "dob": "2000-01-01",
        "bio": "Hello I'm John."
    }

    r = requests.post(f"{BASE_URL}/users/", json=payload)
    print_response("Create User", r)

    if r.status_code == 200:
        return r.json()["id"]
    return None


def test_get_user(user_id):
    r = requests.get(f"{BASE_URL}/users/{user_id}")
    print_response("Get User", r)


def test_update_user(user_id):
    payload = {
        "bio": "Updated bio section"
    }
    r = requests.put(f"{BASE_URL}/users/{user_id}", json=payload)
    print_response("Update User", r)


def test_update_preferences(user_id):
    payload = {
        "min_age": 21,
        "max_age": 28,
        "distance_km": 20,
        "preferred_gender": "female"
    }
    r = requests.put(f"{BASE_URL}/users/{user_id}/preferences", json=payload)
    print_response("Update Preferences", r)


def test_get_preferences(user_id):
    r = requests.get(f"{BASE_URL}/users/{user_id}/preferences")
    print_response("Get Preferences", r)


def run_all():
    print("\nRunning All Tests...")

    test_health()

    user_id = test_create_user()
    if not user_id:
        print("❌ User creation failed. Stopping tests.")
        return

    test_get_user(user_id)
    test_update_user(user_id)
    test_update_preferences(user_id)
    test_get_preferences(user_id)


if __name__ == "__main__":
    run_all()
