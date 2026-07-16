from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.models import Order
from app.db.session import get_db
from app.schemas.order import OrderCreate, OrderUpdate

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _serialize(order: Order) -> dict:
    return {
        "id": order.id,
        "item_id": order.item_id,
        "quantity": order.quantity,
        "status": order.status,
        # Unix timestamp, unlike Item.updated_at which is ISO-8601 (see api-conventions.md)
        "placed_at": int(order.placed_at.timestamp()),
    }


@router.get("")
def list_orders(db: Session = Depends(get_db)):
    return [_serialize(o) for o in db.query(Order).all()]


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _serialize(order)


@router.post("", status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    order = Order(**payload.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return _serialize(order)


@router.patch("/{order_id}")
def update_order(order_id: int, payload: OrderUpdate, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return _serialize(order)


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
