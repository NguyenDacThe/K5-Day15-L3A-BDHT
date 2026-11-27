from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from src.d1.contracts import ComplaintRequest, ComplaintResponse
from src.d1.service import complaint_response


app = FastAPI(title="BDHT · Khiếu nại đơn giao đồ ăn")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/complaints")
def submit_complaint(request: ComplaintRequest) -> ComplaintResponse:
    return complaint_response(request)


web_dir = Path(__file__).resolve().parent / "web"
if (web_dir / "index.html").is_file():
    app.mount("/", StaticFiles(directory=web_dir, html=True), name="web")
