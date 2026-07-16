"""Drops and recreates the schema, then inserts fixed demo data.

Run with: python -m app.db.seed
Whenever a field is added to models.py, add matching values here in the
same change (see the schema-change procedure in this directory's CLAUDE.md).
"""

from datetime import datetime, timedelta, timezone

from app.db.models import Item, Order, Supplier
from app.db.session import Base, SessionLocal, engine


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        suppliers = [
            Supplier(
                name="Circuitworks Ltd",
                contact_email="orders@circuitworks.example",
                lead_time_days=7,
            ),
            Supplier(
                name="SensorTech Industries",
                contact_email="sales@sensortech.example",
                lead_time_days=14,
            ),
            Supplier(
                name="Precision Actuation Co",
                contact_email="procurement@precisionact.example",
                lead_time_days=21,
            ),
            Supplier(
                name="ControlLogic Supply",
                contact_email="support@controllogic.example",
                lead_time_days=10,
            ),
        ]
        db.add_all(suppliers)
        db.commit()
        for s in suppliers:
            db.refresh(s)

        now = datetime.now(timezone.utc)

        items = [
            Item(
                sku="CB-1001",
                name="Dual-Layer PCB 4x6",
                category="circuit_board",
                quantity=42,
                reorder_level=20,
                unit_cost=12.50,
                supplier_id=suppliers[0].id,
                updated_at=now - timedelta(days=2),
            ),
            Item(
                sku="CB-1002",
                name="Quad-Layer PCB 6x8",
                category="circuit_board",
                quantity=8,
                reorder_level=15,
                unit_cost=28.75,
                supplier_id=suppliers[0].id,
                updated_at=now - timedelta(days=1),
            ),
            Item(
                sku="CB-1003",
                name="Flex PCB Ribbon",
                category="circuit_board",
                quantity=5,
                reorder_level=10,
                unit_cost=9.20,
                supplier_id=suppliers[0].id,
                updated_at=now - timedelta(hours=6),
            ),
            Item(
                sku="SN-2001",
                name="Infrared Proximity Sensor",
                category="sensor",
                quantity=120,
                reorder_level=40,
                unit_cost=4.15,
                supplier_id=suppliers[1].id,
                updated_at=now - timedelta(days=5),
            ),
            Item(
                sku="SN-2002",
                name="Thermocouple Type-K",
                category="sensor",
                quantity=30,
                # Seeded with a null reorder level: /api/items/low-stock crashes
                # on this row today. Not covered by tests (see EXERCISES.md).
                reorder_level=None,
                unit_cost=6.80,
                supplier_id=suppliers[1].id,
                updated_at=now - timedelta(days=3),
            ),
            Item(
                sku="SN-2003",
                name="Pressure Transducer 0-100psi",
                category="sensor",
                quantity=35,
                reorder_level=25,
                unit_cost=22.00,
                supplier_id=suppliers[1].id,
                updated_at=now - timedelta(hours=12),
            ),
            Item(
                sku="AC-3001",
                name="Linear Actuator 12V 100mm",
                category="actuator",
                quantity=14,
                reorder_level=10,
                unit_cost=45.00,
                supplier_id=suppliers[2].id,
                updated_at=now - timedelta(days=4),
            ),
            Item(
                sku="AC-3002",
                name="Servo Motor MG996R",
                category="actuator",
                quantity=60,
                reorder_level=20,
                unit_cost=11.30,
                supplier_id=suppliers[2].id,
                updated_at=now - timedelta(days=7),
            ),
            Item(
                sku="CT-4001",
                name="PLC Module 16-Input",
                category="controller",
                quantity=15,
                reorder_level=12,
                unit_cost=110.00,
                supplier_id=suppliers[3].id,
                updated_at=now - timedelta(hours=20),
            ),
            Item(
                sku="CT-4002",
                name="Motor Speed Controller",
                category="controller",
                quantity=25,
                reorder_level=8,
                unit_cost=38.50,
                supplier_id=suppliers[3].id,
                updated_at=now - timedelta(days=10),
            ),
        ]
        db.add_all(items)
        db.commit()
        for i in items:
            db.refresh(i)

        orders = [
            Order(item_id=items[0].id, quantity=50, status="delivered", placed_at=now - timedelta(days=20)),
            Order(item_id=items[1].id, quantity=30, status="shipped", placed_at=now - timedelta(days=5)),
            Order(item_id=items[2].id, quantity=25, status="pending", placed_at=now - timedelta(days=1)),
            Order(item_id=items[3].id, quantity=100, status="delivered", placed_at=now - timedelta(days=30)),
            Order(item_id=items[4].id, quantity=40, status="backordered", placed_at=now - timedelta(days=3)),
            Order(item_id=items[5].id, quantity=20, status="pending", placed_at=now - timedelta(hours=8)),
            Order(item_id=items[6].id, quantity=15, status="shipped", placed_at=now - timedelta(days=2)),
            Order(item_id=items[7].id, quantity=45, status="delivered", placed_at=now - timedelta(days=15)),
            Order(item_id=items[8].id, quantity=12, status="backordered", placed_at=now - timedelta(hours=18)),
            Order(item_id=items[9].id, quantity=20, status="pending", placed_at=now - timedelta(hours=2)),
        ]
        db.add_all(orders)
        db.commit()

        print(
            f"Seeded {len(suppliers)} suppliers, {len(items)} items, {len(orders)} orders."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
