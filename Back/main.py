from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

app = FastAPI()

# Разрешенные источники
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://starosta-online",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем маршрутизатор
app.include_router(router)

