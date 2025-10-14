"""
WebSocket сервис для реального времени обновления данных
"""
from typing import Dict, Set
from fastapi import WebSocket
import json
import asyncio


class ConnectionManager:
    """Менеджер WebSocket соединений"""
    
    def __init__(self):
        # user_id -> Set[WebSocket]
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Подключить пользователя"""
        await websocket.accept()
        async with self._lock:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)
        print(f"✅ User {user_id} connected. Total connections: {sum(len(v) for v in self.active_connections.values())}")
    
    async def disconnect(self, websocket: WebSocket, user_id: int):
        """Отключить пользователя"""
        async with self._lock:
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
        print(f"❌ User {user_id} disconnected. Total connections: {sum(len(v) for v in self.active_connections.values())}")
    
    async def send_personal_message(self, message: dict, user_id: int):
        """Отправить сообщение конкретному пользователю"""
        async with self._lock:
            connections = self.active_connections.get(user_id, set()).copy()
        
        if connections:
            message_json = json.dumps(message)
            dead_connections = set()
            
            for connection in connections:
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    print(f"Error sending to user {user_id}: {e}")
                    dead_connections.add(connection)
            
            # Убираем мертвые соединения
            if dead_connections:
                async with self._lock:
                    if user_id in self.active_connections:
                        self.active_connections[user_id] -= dead_connections
                        if not self.active_connections[user_id]:
                            del self.active_connections[user_id]
    
    async def broadcast(self, message: dict):
        """Broadcast всем подключенным"""
        async with self._lock:
            all_connections = []
            for connections in self.active_connections.values():
                all_connections.extend(connections)
        
        if all_connections:
            message_json = json.dumps(message)
            for connection in all_connections:
                try:
                    await connection.send_text(message_json)
                except Exception:
                    pass  # Игнорируем ошибки при broadcast
    
    async def broadcast_to_users(self, message: dict, user_ids: list[int]):
        """Broadcast конкретным пользователям"""
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)


# Глобальный менеджер соединений
manager = ConnectionManager()


# Хелперы для отправки событий

async def notify_request_updated(request_id: int, user_ids: list[int] = None):
    """Уведомить об обновлении заявки"""
    message = {
        "type": "request_updated",
        "request_id": request_id,
        "timestamp": asyncio.get_event_loop().time()
    }
    
    if user_ids:
        await manager.broadcast_to_users(message, user_ids)
    else:
        await manager.broadcast(message)


async def notify_tour_created(tour_id: int, guide_id: int):
    """Уведомить о создании тура"""
    message = {
        "type": "tour_created",
        "tour_id": tour_id,
        "timestamp": asyncio.get_event_loop().time()
    }
    await manager.send_personal_message(message, guide_id)


async def notify_tour_updated(tour_id: int, guide_id: int):
    """Уведомить об обновлении тура"""
    message = {
        "type": "tour_updated",
        "tour_id": tour_id,
        "timestamp": asyncio.get_event_loop().time()
    }
    await manager.send_personal_message(message, guide_id)


async def notify_schedule_updated(guide_id: int, date: str):
    """Уведомить об обновлении расписания"""
    message = {
        "type": "schedule_updated",
        "date": date,
        "timestamp": asyncio.get_event_loop().time()
    }
    await manager.send_personal_message(message, guide_id)


async def notify_booking_created(booking_id: int, guide_id: int):
    """Уведомить о новом бронировании"""
    message = {
        "type": "booking_created",
        "booking_id": booking_id,
        "timestamp": asyncio.get_event_loop().time()
    }
    await manager.send_personal_message(message, guide_id)

