from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import items, orders, suppliers

app = FastAPI(title="Inventory Workshop API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(suppliers.router)
app.include_router(items.router)
app.include_router(orders.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
