def test_create_order(client, supplier_id):
    item_resp = client.post(
        "/api/items",
        json={
            "sku": "ORD-001",
            "name": "Order Widget",
            "category": "sensor",
            "quantity": 10,
            "reorder_level": 5,
            "unit_cost": 1.00,
            "supplier_id": supplier_id,
        },
    )
    item_id = item_resp.json()["id"]

    resp = client.post(
        "/api/orders", json={"item_id": item_id, "quantity": 20, "status": "pending"}
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["item_id"] == item_id
    assert isinstance(body["placed_at"], int)


def test_list_and_update_order(client, supplier_id):
    item_resp = client.post(
        "/api/items",
        json={
            "sku": "ORD-002",
            "name": "Order Widget Two",
            "category": "actuator",
            "quantity": 10,
            "reorder_level": 5,
            "unit_cost": 1.00,
            "supplier_id": supplier_id,
        },
    )
    item_id = item_resp.json()["id"]

    create_resp = client.post(
        "/api/orders", json={"item_id": item_id, "quantity": 5, "status": "pending"}
    )
    order_id = create_resp.json()["id"]

    resp = client.get("/api/orders")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    resp = client.patch(f"/api/orders/{order_id}", json={"status": "shipped"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "shipped"


def test_delete_order(client, supplier_id):
    item_resp = client.post(
        "/api/items",
        json={
            "sku": "ORD-003",
            "name": "Order Widget Three",
            "category": "controller",
            "quantity": 10,
            "reorder_level": 5,
            "unit_cost": 1.00,
            "supplier_id": supplier_id,
        },
    )
    item_id = item_resp.json()["id"]

    create_resp = client.post(
        "/api/orders", json={"item_id": item_id, "quantity": 5, "status": "pending"}
    )
    order_id = create_resp.json()["id"]

    resp = client.delete(f"/api/orders/{order_id}")
    assert resp.status_code == 204

    resp = client.get(f"/api/orders/{order_id}")
    assert resp.status_code == 404
