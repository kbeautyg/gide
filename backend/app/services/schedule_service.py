"""
Сервис для управления расписанием гидов
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date, timedelta
from typing import List

from app.models.guide_schedule import GuideSchedule
from app.models.request import Request


class ScheduleService:
    """Сервис для работы с расписанием гидов"""
    
    @staticmethod
    async def get_or_create_schedule(db: AsyncSession, guide_id: int, target_date: date) -> GuideSchedule:
        """Получить или создать запись расписания для гида на дату"""
        query = select(GuideSchedule).where(
            GuideSchedule.guide_id == guide_id,
            GuideSchedule.date == target_date
        )
        result = await db.execute(query)
        schedule = result.scalar_one_or_none()
        
        if not schedule:
            schedule = GuideSchedule(
                guide_id=guide_id,
                date=target_date,
                booked_hours=0
            )
            db.add(schedule)
            await db.commit()
            await db.refresh(schedule)
        
        return schedule
    
    @staticmethod
    async def check_availability(
        db: AsyncSession, 
        guide_id: int, 
        target_date: date, 
        required_hours: int
    ) -> bool:
        """Проверить, доступен ли гид на дату для N часов"""
        schedule = await ScheduleService.get_or_create_schedule(db, guide_id, target_date)
        return schedule.booked_hours + required_hours <= 8
    
    @staticmethod
    async def get_available_hours(db: AsyncSession, guide_id: int, target_date: date) -> int:
        """Получить количество свободных часов гида на дату"""
        schedule = await ScheduleService.get_or_create_schedule(db, guide_id, target_date)
        return schedule.available_hours
    
    @staticmethod
    async def get_fully_booked_dates(
        db: AsyncSession, 
        guide_id: int, 
        start_date: date, 
        end_date: date
    ) -> List[date]:
        """Получить список дат, где у гида уже занято 8 часов"""
        query = select(GuideSchedule).where(
            GuideSchedule.guide_id == guide_id,
            GuideSchedule.booked_hours >= 8,
            GuideSchedule.date.between(start_date, end_date)
        )
        result = await db.execute(query)
        schedules = result.scalars().all()
        return [schedule.date for schedule in schedules]
    
    @staticmethod
    async def book_hours(
        db: AsyncSession, 
        guide_id: int, 
        target_date: date, 
        hours: int
    ) -> GuideSchedule:
        """Забронировать часы для гида на дату"""
        schedule = await ScheduleService.get_or_create_schedule(db, guide_id, target_date)
        
        if schedule.booked_hours + hours > 8:
            raise ValueError(
                f"Недостаточно времени на {target_date}. "
                f"Занято: {schedule.booked_hours}/8ч, требуется: {hours}ч"
            )
        
        schedule.booked_hours += hours
        await db.commit()
        await db.refresh(schedule)
        return schedule
    
    @staticmethod
    async def free_hours(
        db: AsyncSession, 
        guide_id: int, 
        target_date: date, 
        hours: int
    ) -> GuideSchedule:
        """Освободить часы гида на дату"""
        schedule = await ScheduleService.get_or_create_schedule(db, guide_id, target_date)
        schedule.booked_hours = max(0, schedule.booked_hours - hours)
        await db.commit()
        await db.refresh(schedule)
        return schedule
    
    @staticmethod
    async def get_schedule_range(
        db: AsyncSession,
        guide_id: int,
        start_date: date,
        end_date: date
    ) -> List[GuideSchedule]:
        """Получить расписание гида за период"""
        query = select(GuideSchedule).where(
            GuideSchedule.guide_id == guide_id,
            GuideSchedule.date.between(start_date, end_date)
        ).order_by(GuideSchedule.date)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_requests_for_date_range(
        db: AsyncSession,
        guide_id: int,
        start_date: date,
        end_date: date
    ) -> List[Request]:
        """Получить заявки гида за период"""
        query = select(Request).where(
            Request.guide_id == guide_id,
            Request.assigned_date.between(start_date, end_date)
        ).order_by(Request.assigned_date)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def calculate_monthly_stats(db: AsyncSession, guide_id: int, year: int, month: int):
        """Рассчитать статистику за месяц"""
        # Первый и последний день месяца
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        schedules = await ScheduleService.get_schedule_range(db, guide_id, start_date, end_date)
        requests = await ScheduleService.get_requests_for_date_range(db, guide_id, start_date, end_date)
        
        total_booked_hours = sum(s.booked_hours for s in schedules)
        total_requests = len(requests)
        days_worked = len([s for s in schedules if s.booked_hours > 0])
        
        return {
            "total_hours": total_booked_hours,
            "total_requests": total_requests,
            "days_worked": days_worked,
            "avg_hours_per_day": total_booked_hours / max(days_worked, 1),
            "max_possible_hours": (end_date - start_date).days * 8,
            "utilization": (total_booked_hours / ((end_date - start_date).days * 8)) * 100
        }

