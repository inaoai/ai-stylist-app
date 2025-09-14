def test_create_profile(client):
    response = client.post("/profile/1", json={"name": "Alice", "age": 25, "gender": "F", "preferences": {"style": "casual"}})
    assert response.status_code == 200
