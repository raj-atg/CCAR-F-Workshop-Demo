from pydantic import BaseModel, ConfigDict


class SupplierBase(BaseModel):
    name: str
    contact_email: str
    lead_time_days: int


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: str | None = None
    contact_email: str | None = None
    lead_time_days: int | None = None


class SupplierOut(SupplierBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
