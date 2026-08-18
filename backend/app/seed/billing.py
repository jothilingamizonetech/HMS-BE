from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import SessionLocal
from app.models.billing import (
    Bill, BillItem, PaymentCollection, DiscountRequest,
    RefundRequest, BillCancellation, SupplierPayable, BillingAuditLog
)
from app.models.user import User, UserRole
from app.core.security import hash_password


def seed_billing():
    db: Session = SessionLocal()
    try:
        # 1. Ensure Billing Staff User exists
        billing_user = db.query(User).filter(User.email == "billing@hms.com").first()
        if not billing_user:
            billing_user = User(
                name="Ramesh Finance",
                username="billing_officer",
                email="billing@hms.com",
                hashed_password=hash_password("billing123"),
                role=UserRole.billing_manager,
                department="Finance & Billing",
                employee_id="EMP-FIN-001",
                branch="Main Branch",
                phone="+91 98765 11223",
                is_active=True,
            )
            db.add(billing_user)
            db.flush()

        cashier_user = db.query(User).filter(User.email == "cashier@hms.com").first()
        if not cashier_user:
            cashier_user = User(
                name="Sunita Sharma",
                username="cashier_sunita",
                email="cashier@hms.com",
                hashed_password=hash_password("cashier123"),
                role=UserRole.billing,
                department="Front Desk Billing",
                employee_id="EMP-FIN-002",
                branch="Main Branch",
                phone="+91 98765 44556",
                is_active=True,
            )
            db.add(cashier_user)
            db.flush()

        # Check if bills already seeded
        if db.query(Bill).count() > 0:
            db.commit()
            return

        today_str = datetime.now().strftime("%Y-%m-%d")
        yesterday_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

        # 2. Seed Sample Financial Bills
        bills_data = [
            {
                "bill_number": "BILL-2026-00101",
                "patient_name": "Rajesh Kumar",
                "uhid": "UHID-2026-1001",
                "appointment_id": "APT-2026-001",
                "bill_type": "OPD",
                "department": "Cardiology",
                "doctor_name": "Dr. Aris Thorne",
                "gross_amount": 1500.0,
                "discount_amount": 100.0,
                "tax_amount": 0.0,
                "net_amount": 1400.0,
                "paid_amount": 1400.0,
                "pending_amount": 0.0,
                "payment_mode": "UPI",
                "payment_status": "Paid",
                "bill_date": today_str,
                "billing_staff": "Sunita Sharma",
                "items": [
                    {"service_name": "Senior Doctor Consultation", "category": "OPD", "quantity": 1, "unit_price": 1000.0, "gross_amount": 1000.0, "discount": 0.0, "tax": 0.0, "net_amount": 1000.0},
                    {"service_name": "ECG Screening Test", "category": "Procedure", "quantity": 1, "unit_price": 500.0, "gross_amount": 500.0, "discount": 100.0, "tax": 0.0, "net_amount": 400.0},
                ]
            },
            {
                "bill_number": "BILL-2026-00102",
                "patient_name": "Priya Sharma",
                "uhid": "UHID-2026-1002",
                "ipd_number": "IPD-2026-088",
                "bill_type": "IPD",
                "department": "Orthopedics",
                "doctor_name": "Dr. Sarah Jenkins",
                "gross_amount": 45000.0,
                "discount_amount": 2500.0,
                "tax_amount": 1500.0,
                "net_amount": 44000.0,
                "paid_amount": 30000.0,
                "pending_amount": 14000.0,
                "payment_mode": "Bank Transfer",
                "payment_status": "Partially Paid",
                "discharge_status": "Interim",
                "bill_date": today_str,
                "billing_staff": "Ramesh Finance",
                "items": [
                    {"service_name": "Private Deluxe Room Charge (3 Days)", "category": "IPD Room", "quantity": 3, "unit_price": 8000.0, "gross_amount": 24000.0, "discount": 1000.0, "tax": 0.0, "net_amount": 23000.0},
                    {"service_name": "Surgical ICU Nursing Care", "category": "Nursing", "quantity": 3, "unit_price": 4000.0, "gross_amount": 12000.0, "discount": 500.0, "tax": 0.0, "net_amount": 11500.0},
                    {"service_name": "Orthopedic Minor Procedure", "category": "Procedure", "quantity": 1, "unit_price": 9000.0, "gross_amount": 9000.0, "discount": 1000.0, "tax": 1500.0, "net_amount": 9500.0},
                ]
            },
            {
                "bill_number": "BILL-2026-00103",
                "patient_name": "Amitabh Patel",
                "uhid": "UHID-2026-1003",
                "bill_type": "Lab",
                "department": "Pathology",
                "doctor_name": "Dr. Elena Rostova",
                "gross_amount": 3200.0,
                "discount_amount": 200.0,
                "tax_amount": 0.0,
                "net_amount": 3000.0,
                "paid_amount": 3000.0,
                "pending_amount": 0.0,
                "payment_mode": "Card",
                "payment_status": "Paid",
                "bill_date": today_str,
                "billing_staff": "Sunita Sharma",
                "items": [
                    {"service_name": "Complete Blood Count (CBC)", "category": "Lab Test", "quantity": 1, "unit_price": 800.0, "gross_amount": 800.0, "discount": 0.0, "tax": 0.0, "net_amount": 800.0},
                    {"service_name": "Comprehensive Metabolic Profile", "category": "Lab Test", "quantity": 1, "unit_price": 2400.0, "gross_amount": 2400.0, "discount": 200.0, "tax": 0.0, "net_amount": 2200.0},
                ]
            },
            {
                "bill_number": "BILL-2026-00104",
                "patient_name": "Meena Iyer",
                "uhid": "UHID-2026-1004",
                "bill_type": "Pharmacy",
                "department": "Pharmacy",
                "doctor_name": "Dr. Aris Thorne",
                "gross_amount": 2800.0,
                "discount_amount": 150.0,
                "tax_amount": 100.0,
                "net_amount": 2750.0,
                "paid_amount": 2750.0,
                "pending_amount": 0.0,
                "payment_mode": "Cash",
                "payment_status": "Paid",
                "bill_date": today_str,
                "billing_staff": "Sunita Sharma",
                "items": [
                    {"service_name": "Amoxicillin 500mg (Strip of 10)", "category": "Medicine", "quantity": 2, "unit_price": 400.0, "gross_amount": 800.0, "discount": 50.0, "tax": 30.0, "net_amount": 780.0},
                    {"service_name": "Paracetamol 650mg & Pantoprazole 40mg", "category": "Medicine", "quantity": 5, "unit_price": 400.0, "gross_amount": 2000.0, "discount": 100.0, "tax": 70.0, "net_amount": 1970.0},
                ]
            },
            {
                "bill_number": "BILL-2026-00105",
                "patient_name": "Vikram Seth",
                "uhid": "UHID-2026-1005",
                "bill_type": "Procedure",
                "department": "Radiology",
                "doctor_name": "Dr. Vikramaditya",
                "gross_amount": 12000.0,
                "discount_amount": 1000.0,
                "tax_amount": 0.0,
                "net_amount": 11000.0,
                "paid_amount": 0.0,
                "pending_amount": 11000.0,
                "payment_mode": "Pending",
                "payment_status": "Pending",
                "bill_date": today_str,
                "billing_staff": "Ramesh Finance",
                "items": [
                    {"service_name": "Abdominal Ultrasound & CT Contrast Scan", "category": "Radiology", "quantity": 1, "unit_price": 12000.0, "gross_amount": 12000.0, "discount": 1000.0, "tax": 0.0, "net_amount": 11000.0},
                ]
            },
        ]

        for bdata in bills_data:
            items_data = bdata.pop("items")
            bill = Bill(**bdata)
            db.add(bill)
            db.flush()

            for idata in items_data:
                item = BillItem(bill_id=bill.id, **idata)
                db.add(item)

        # 3. Seed Payment Collections
        collections_data = [
            {
                "receipt_number": "REC-2026-0001",
                "bill_number": "BILL-2026-00101",
                "patient_name": "Rajesh Kumar",
                "uhid": "UHID-2026-1001",
                "service_type": "OPD",
                "total_bill": 1400.0,
                "previously_paid": 0.0,
                "current_payment": 1400.0,
                "remaining_due": 0.0,
                "payment_mode": "UPI",
                "transaction_ref": "UPI/98127391823/ICICI",
                "payment_date": f"{today_str} 09:30:00",
                "collected_by": "Sunita Sharma",
            },
            {
                "receipt_number": "REC-2026-0002",
                "bill_number": "BILL-2026-00102",
                "patient_name": "Priya Sharma",
                "uhid": "UHID-2026-1002",
                "service_type": "IPD Advance",
                "total_bill": 44000.0,
                "previously_paid": 0.0,
                "current_payment": 30000.0,
                "remaining_due": 14000.0,
                "payment_mode": "Bank Transfer",
                "transaction_ref": "NEFT-HDFC-99120",
                "payment_date": f"{today_str} 10:15:00",
                "collected_by": "Ramesh Finance",
            },
            {
                "receipt_number": "REC-2026-0003",
                "bill_number": "BILL-2026-00103",
                "patient_name": "Amitabh Patel",
                "uhid": "UHID-2026-1003",
                "service_type": "Lab Test",
                "total_bill": 3000.0,
                "previously_paid": 0.0,
                "current_payment": 3000.0,
                "remaining_due": 0.0,
                "payment_mode": "Card",
                "transaction_ref": "POS-CARD-5541",
                "payment_date": f"{today_str} 11:00:00",
                "collected_by": "Sunita Sharma",
            },
            {
                "receipt_number": "REC-2026-0004",
                "bill_number": "BILL-2026-00104",
                "patient_name": "Meena Iyer",
                "uhid": "UHID-2026-1004",
                "service_type": "Pharmacy",
                "total_bill": 2750.0,
                "previously_paid": 0.0,
                "current_payment": 2750.0,
                "remaining_due": 0.0,
                "payment_mode": "Cash",
                "transaction_ref": "CASH-DESK-01",
                "payment_date": f"{today_str} 11:45:00",
                "collected_by": "Sunita Sharma",
            },
        ]
        for cdata in collections_data:
            coll = PaymentCollection(**cdata)
            db.add(coll)

        # 4. Seed Discounts
        disc = DiscountRequest(
            discount_code="DISC-2026-001",
            bill_number="BILL-2026-00102",
            patient_name="Priya Sharma",
            uhid="UHID-2026-1002",
            original_amount=45000.0,
            discount_type="Fixed Amount",
            discount_value=2500.0,
            discount_amount=2500.0,
            reason="Senior Citizen Financial Concession Approved by CMO",
            requested_by="Ramesh Finance",
            approved_by="Dr. Aris Thorne",
            status="Approved",
            request_date=today_str,
        )
        db.add(disc)

        # 5. Seed Refunds
        ref = RefundRequest(
            refund_code="REF-2026-001",
            bill_number="BILL-2026-00099",
            patient_name="Sanjay Verma",
            uhid="UHID-2026-0999",
            original_amount=5000.0,
            paid_amount=5000.0,
            refund_amount=1500.0,
            refund_reason="Cancelled duplicate MRI booking request",
            refund_mode="UPI",
            requested_by="Sunita Sharma",
            approved_by="Ramesh Finance",
            refund_date=today_str,
            status="Processed",
        )
        db.add(ref)

        # 6. Seed Supplier Payables
        payables = [
            {
                "supplier_name": "Sun Pharma Distributors",
                "invoice_number": "PUR-2026-00125",
                "purchase_date": yesterday_str,
                "invoice_amount": 85000.0,
                "paid_amount": 60000.0,
                "outstanding_amount": 25000.0,
                "due_date": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
                "payment_status": "Partially Paid",
                "module_source": "Pharmacy",
            },
            {
                "supplier_name": "MedTech Surgical Supplies Ltd",
                "invoice_number": "PUR-2026-00128",
                "purchase_date": today_str,
                "invoice_amount": 42000.0,
                "paid_amount": 0.0,
                "outstanding_amount": 42000.0,
                "due_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                "payment_status": "Pending",
                "module_source": "Store",
            },
        ]
        for pdata in payables:
            sp = SupplierPayable(**pdata)
            db.add(sp)

        # 7. Seed Audit Logs
        audit = BillingAuditLog(
            transaction_id="AUD-2026-001",
            bill_number="BILL-2026-00101",
            entity_type="Bill",
            action="Created",
            previous_value=None,
            new_value="Created OPD Consultation & ECG bill for Rajesh Kumar (UHID-2026-1001)",
            user_name="Sunita Sharma",
            user_role="Cashier",
            timestamp=f"{today_str} 09:30:00",
            reason="OPD Registration Payment",
        )
        db.add(audit)

        db.commit()
        print("Successfully seeded Billing & Revenue Management module data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding billing data: {e}")
    finally:
        db.close()
