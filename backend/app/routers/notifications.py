from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session

from app.core.crud_utils import get_or_404, apply_updates
from app.core.database import get_db
from app.deps import get_current_active_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationUpdate, NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])

ROLE_ALIASES = {
    "reception": ["reception", "receptionist", "front_desk"],
    "receptionist": ["reception", "receptionist", "front_desk"],
    "doctor": ["doctor", "physician"],
    "nurse": ["nurse"],
    "pharmacy": ["pharmacy", "pharmacist"],
    "pharmacist": ["pharmacy", "pharmacist"],
    "store": ["store", "store_manager", "inventory"],
    "store_manager": ["store", "store_manager", "inventory"],
    "inventory": ["store", "store_manager", "inventory"],
    "lab": ["lab", "lab_technician", "laboratory"],
    "lab_technician": ["lab", "lab_technician", "laboratory"],
    "laboratory": ["lab", "lab_technician", "laboratory"],
    "admin": ["admin", "super_admin", "superadmin", "administrator"],
    "super_admin": ["admin", "super_admin", "superadmin", "administrator"],
    "superadmin": ["admin", "super_admin", "superadmin", "administrator"],
    "patient": ["patient"],
}


def _get_role_variants(user: User) -> list[str]:
    raw_role = (user.role.value if hasattr(user.role, "value") else str(user.role or "")).strip().lower()
    variants = {raw_role, raw_role.replace(" ", "_"), raw_role.replace("_", " ")}
    if raw_role in ROLE_ALIASES:
        for alias in ROLE_ALIASES[raw_role]:
            variants.add(alias.lower())
    return [v for v in variants if v]


def _build_user_notification_filter(current_user: User):
    role_variants = [r.lower() for r in _get_role_variants(current_user)]
    is_admin = any(r in ("admin", "super_admin", "superadmin") for r in role_variants)

    conditions = [
        Notification.user_id == current_user.id,
        func.lower(Notification.recipient_role).in_(role_variants),
    ]
    if is_admin:
        # Admins also see untargeted system broadcasts
        conditions.append(Notification.user_id.is_(None) & Notification.recipient_role.is_(None))

    return or_(*conditions)


def _notification_visible_to(notification: Notification, current_user: User) -> bool:
    """Ownership/visibility check for a single notification based strictly on user assignment or role allocation."""
    if notification.user_id == current_user.id:
        return True

    role_variants = [r.lower() for r in _get_role_variants(current_user)]
    if notification.recipient_role:
        recip = notification.recipient_role.lower().strip()
        if recip in role_variants:
            return True

    is_admin = any(r in ("admin", "super_admin", "superadmin") for r in role_variants)
    if is_admin and notification.user_id is None and notification.recipient_role is None:
        return True

    return False


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    stmt = select(Notification).where(_build_user_notification_filter(current_user))
    if unread_only:
        stmt = stmt.where(Notification.read.is_(False))
    stmt = stmt.order_by(Notification.created_at.desc())
    return db.scalars(stmt).all()


@router.get("/count")
def get_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    stmt = select(Notification).where(_build_user_notification_filter(current_user))
    all_notifs = db.scalars(stmt).all()
    unread_count = sum(1 for n in all_notifs if not n.read)
    return {"unread_count": unread_count, "total_count": len(all_notifs)}


@router.post("", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate, db: Session = Depends(get_db), _=Depends(get_current_active_user)
):
    data = payload.model_dump()
    data["time"] = data.get("time") or datetime.now().strftime("%Y-%m-%d %H:%M")
    notification = Notification(**data)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/mark-all-read", response_model=list[NotificationOut])
@router.post("/mark-all-read", response_model=list[NotificationOut])
@router.put("/read-all", response_model=list[NotificationOut])
@router.post("/read-all", response_model=list[NotificationOut])
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    stmt = select(Notification).where(
        _build_user_notification_filter(current_user),
        Notification.read.is_(False),
    )
    items = db.scalars(stmt).all()
    for item in items:
        item.read = True
        item.status = "read"
    db.commit()
    return items


@router.put("/{notification_id}", response_model=NotificationOut)
def update_notification(
    notification_id: str,
    payload: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    notification = get_or_404(db, Notification, notification_id, "Notification")
    if not _notification_visible_to(notification, current_user):
        raise HTTPException(status_code=404, detail="Notification not found")
    apply_updates(notification, payload)
    if payload.read is True:
        notification.status = "read"
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/{notification_id}/read", response_model=NotificationOut)
@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_single_notification_read(
    notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    notification = get_or_404(db, Notification, notification_id, "Notification")
    if not _notification_visible_to(notification, current_user):
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.read = True
    notification.status = "read"
    db.commit()
    db.refresh(notification)
    return notification


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    notification = get_or_404(db, Notification, notification_id, "Notification")
    if not _notification_visible_to(notification, current_user):
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notification)
    db.commit()
