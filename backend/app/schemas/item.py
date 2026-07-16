from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ItemBase(BaseModel):
    sku: str
    name: str
    category: str
    quantity: int
    reorder_level: int | None = None
    unit_cost: float
    supplier_id: int


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    sku: str | None = None
    name: str | None = None
    category: str | None = None
    quantity: int | None = None
    reorder_level: int | None = None
    unit_cost: float | None = None
    supplier_id: int | None = None


class ItemOut(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    updated_at: datetime
