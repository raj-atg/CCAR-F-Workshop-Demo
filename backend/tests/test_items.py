def test_create_and_get_item(client, supplier_id):
    resp = client.post(
        "/api/items",
        json={
            "sku": "TEST-001",
            "name": "Test Widget",
            "category": "sensor",
            "quantity": 10,
            "reorder_level": 5,
            "unit_cost": 1.50,
            "supplier_id": supplier_id,
        },
    )
    assert resp.status_code == 201
    item_id = resp.json()["id"]

    resp = client.get(f"/api/items/{item_id}")
    assert resp.status_code == 200
    assert resp.json()["sku"] == "TEST-001"


def test_list_items(client, supplier_id):
    client.post(
        "/api/items",
        json={
            "sku": "TEST-002",
            "name": "Widget Two",
            "category": "actuator",
            "quantity": 3,
            "reorder_level": 5,
            "unit_cost": 2.00,
            "supplier_id": supplier_id,
        },
    )
    resp = client.get("/api/items")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_update_item(client, supplier_id):
    resp = client.post(
        "/api/items",
        json={
            "sku": "TEST-003",
            "name": "Widget Three",
            "category": "controller",
            "quantity": 10,
            "reorder_level": 5,
            "unit_cost": 3.00,
            "supplier_id": supplier_id,
        },
    )
    item_id = resp.json()["id"]

    resp = client.patch(f"/api/items/{item_id}", json={"quantity": 99})
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 99


def test_delete_item(client, supplier_id):
    resp = client.post(
        "/api/items",
        json={
            "sku": "TEST-004",
            "name": "Widget Four",
            "category": "circuit_board",
            "quantity": 10,
            "reorder_level": 5,
            "unit_cost": 4.00,
            "supplier_id": supplier_id,
        },
    )
    item_id = resp.json()["id"]

    resp = client.delete(f"/api/items/{item_id}")
    assert resp.status_code == 204

    resp = client.get(f"/api/items/{item_id}")
    assert resp.status_code == 404


def test_low_stock(client, supplier_id):
    client.post(
        "/api/items",
        json={
            "sku": "TEST-005",
            "name": "Low Stock Widget",
            "category": "sensor",
            "quantity": 2,
            "reorder_level": 10,
            "unit_cost": 1.00,
            "supplier_id": supplier_id,
        },
    )
    client.post(
        "/api/items",
        json={
            "sku": "TEST-006",
            "name": "Well Stocked Widget",
            "category": "sensor",
            "quantity": 100,
            "reorder_level": 10,
            "unit_cost": 1.00,
            "supplier_id": supplier_id,
        },
    )
    resp = client.get("/api/items/low-stock")
    assert resp.status_code == 200
    skus = [item["sku"] for item in resp.json()]
    assert "TEST-005" in skus
    assert "TEST-006" not in skus
