from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrderBase(BaseModel):
    item_id: int
    quantity: int
    status: str = "pending"


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    item_id: int | None = None
    quantity: int | None = None
    status: str | None = None


class OrderOut(OrderBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    placed_at: datetime
