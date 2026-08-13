import os
import sys
from sqlalchemy import select

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Auto-create the database if it does not exist (Postgres only; no-op for SQLite).
try:
    import psycopg2
    from app.core.config import settings

    db_url = settings.DATABASE_URL
    if "postgresql" in db_url:
        cleaned = db_url.split("://")[1]
        auth, rest = cleaned.split("@")
        user, password = auth.split(":")
        host_port, dbname = rest.split("/")
        host = host_port.split(":")[0]
        port = host_port.split(":")[1] if ":" in host_port else "5432"

        conn = psycopg2.connect(dbname="postgres", user=user, password=password, host=host, port=port)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname='{dbname}'")
        if not cur.fetchone():
            cur.execute(f'CREATE DATABASE "{dbname}"')
            print(f"Database '{dbname}' created successfully.")
        cur.close()
        conn.close()
except Exception as e:
    print(f"Database creation check notice (might already exist or run on diff credentials): {e}")

from app.core.database import SessionLocal, engine, Base
import app.models  # noqa: F401 - ensures all models are registered
from app.models.superadmin import HospitalProfile, Branch
from app.models.doctor import Department
from app.models.pharmacy import MedicineCategory
from app.seed.super_admin import seed_super_admin


def seed_hospital_profile(db) -> None:
    profile_data = {
        "hospital_name": "Cauvery Care Multi Speciality Hospital",
        "hospital_code": "CCMH-TRY-001",
        "established_year": "2016",
        "establishment_year": "2016",
        "registration_number": "TNHSP/TRY/2016/01875",
        "license_number": "TN-DMS-2026-45781",
        "accreditation": "NABH Accredited, ISO 9001:2015",
        "email": "info@cauverycarehospital.in",
        "phone": "+91 431 402 4567",
        "website": "https://www.cauverycarehospital.in",
        "address": "No. 45, Bharathidasan Salai, Tennur",
        "city": "Tiruchirappalli",
        "state": "Tamil Nadu",
        "country": "India",
        "pincode": "620017",
        "timezone": "Asia/Kolkata",
        "currency": "INR",
        "total_bed_capacity": 250,
    }

    existing = db.scalar(select(HospitalProfile).limit(1))
    if existing:
        for key, val in profile_data.items():
            setattr(existing, key, val)
        print(f"Updated Hospital Master Profile: {existing.hospital_name} ({existing.hospital_code})")
    else:
        profile = HospitalProfile(**profile_data)
        db.add(profile)
        print(f"Seeded Hospital Master Profile: {profile_data['hospital_name']} ({profile_data['hospital_code']})")


def seed_branches(db) -> None:
    branches_data = [
        {
            "branch_name": "Cantonment Branch",
            "branch_code": "CCMH-CAN",
            "address": "No. 12, Collector Office Road, Cantonment",
            "city": "Tiruchirappalli",
            "state": "Tamil Nadu",
            "country": "India",
            "pincode": "620001",
            "phone": "+91 431 402 4567",
            "email": "cantonment@cauverycarehospital.in",
            "status": "Active",
            "is_main_branch": True,
            "total_staff": 165,
            "bed_capacity": 220,
        },
        {
            "branch_name": "Srirangam Branch",
            "branch_code": "CCMH-SRG",
            "address": "No. 88, Gandhi Road, Srirangam",
            "city": "Tiruchirappalli",
            "state": "Tamil Nadu",
            "country": "India",
            "pincode": "620006",
            "phone": "+91 431 402 4568",
            "email": "srirangam@cauverycarehospital.in",
            "status": "Active",
            "is_main_branch": False,
            "total_staff": 110,
            "bed_capacity": 150,
        },
        {
            "branch_name": "Thillai Nagar Branch",
            "branch_code": "CCMH-TN",
            "address": "No. 15, 10th Cross, Thillai Nagar",
            "city": "Tiruchirappalli",
            "state": "Tamil Nadu",
            "country": "India",
            "pincode": "620018",
            "phone": "+91 431 402 4569",
            "email": "thillainagar@cauverycarehospital.in",
            "status": "Active",
            "is_main_branch": False,
            "total_staff": 95,
            "bed_capacity": 120,
        },
    ]

    for bdata in branches_data:
        existing = db.scalar(select(Branch).where(Branch.branch_code == bdata["branch_code"]))
        if existing:
            for key, val in bdata.items():
                setattr(existing, key, val)
            print(f"Updated Branch: {existing.branch_name} ({existing.branch_code})")
        else:
            branch = Branch(**bdata)
            db.add(branch)
            print(f"Seeded Branch: {bdata['branch_name']} ({bdata['branch_code']})")


def seed_departments(db) -> None:
    departments_data = [
        {
            "code": "CARD",
            "name": "Cardiology",
            "head_of_department": "Dr. R. Balasubramanian",
            "floor_location": "2nd Floor",
            "doctor_count": 12,
            "bed_count": 40,
            "icon_name": "Heart",
            "description": "Comprehensive cardiac care, interventional cardiology, and heart surgeries.",
            "status": "Active",
        },
        {
            "code": "MED",
            "name": "General Medicine",
            "head_of_department": "Dr. S. Meenakshi",
            "floor_location": "Ground Floor",
            "doctor_count": 18,
            "bed_count": 50,
            "icon_name": "Stethoscope",
            "description": "Primary healthcare, diagnosis, and non-surgical treatment of internal diseases.",
            "status": "Active",
        },
        {
            "code": "PEDS",
            "name": "Pediatrics",
            "head_of_department": "Dr. A. Priyanka",
            "floor_location": "3rd Floor",
            "doctor_count": 10,
            "bed_count": 30,
            "icon_name": "Baby",
            "description": "Specialized medical care for infants, children, and adolescents.",
            "status": "Active",
        },
        {
            "code": "ORTH",
            "name": "Orthopedics",
            "head_of_department": "Dr. K. Senthil Kumar",
            "floor_location": "2nd Floor",
            "doctor_count": 9,
            "bed_count": 35,
            "icon_name": "Activity",
            "description": "Treatment of musculoskeletal conditions, joint replacements, and trauma care.",
            "status": "Active",
        },
        {
            "code": "DERM",
            "name": "Dermatology",
            "head_of_department": "Dr. M. Nivetha",
            "floor_location": "OPD Block - 1st Floor",
            "doctor_count": 5,
            "bed_count": 12,
            "icon_name": "Sparkles",
            "description": "Skin, hair, and nail healthcare, cosmetic dermatology, and dermatopathology.",
            "status": "Active",
        },
        {
            "code": "ENT",
            "name": "ENT",
            "head_of_department": "Dr. V. Prakash",
            "floor_location": "OPD Block - 1st Floor",
            "doctor_count": 6,
            "bed_count": 15,
            "icon_name": "Ear",
            "description": "Ear, Nose, and Throat diagnostic, medical, and surgical care.",
            "status": "Active",
        },
        {
            "code": "NEUR",
            "name": "Neurology",
            "head_of_department": "Dr. P. Aravind",
            "floor_location": "4th Floor",
            "doctor_count": 8,
            "bed_count": 25,
            "icon_name": "Brain",
            "description": "Advanced care for brain, spinal cord, and neuromuscular disorders.",
            "status": "Active",
        },
        {
            "code": "SURG",
            "name": "General Surgery",
            "head_of_department": "Dr. S. Karthikeyan",
            "floor_location": "3rd Floor",
            "doctor_count": 8,
            "bed_count": 20,
            "icon_name": "Scissors",
            "description": "Surgical procedures for abdominal organs, soft tissue, and trauma care.",
            "status": "Active",
        },
        {
            "code": "GYN",
            "name": "Obstetrics & Gynecology",
            "head_of_department": "Dr. R. Kavitha",
            "floor_location": "3rd Floor",
            "doctor_count": 7,
            "bed_count": 15,
            "icon_name": "Users",
            "description": "Comprehensive female reproductive health, maternity, and obstetrical care.",
            "status": "Active",
        },
        {
            "code": "RAD",
            "name": "Radiology",
            "head_of_department": "Dr. N. Dinesh",
            "floor_location": "Ground Floor",
            "doctor_count": 5,
            "bed_count": 8,
            "icon_name": "Scan",
            "description": "Diagnostic imaging including X-ray, CT, MRI, Ultrasound, and Mammography.",
            "status": "Active",
        },
    ]

    for ddata in departments_data:
        existing = db.scalar(select(Department).where(Department.code == ddata["code"]))
        if existing:
            for key, val in ddata.items():
                setattr(existing, key, val)
            print(f"Updated Department: {existing.name} ({existing.code})")
        else:
            dept = Department(**ddata)
            db.add(dept)
            print(f"Seeded Department: {ddata['name']} ({ddata['code']})")


def seed_pharmacy_categories(db) -> None:
    pharmacy_categories_data = [
        {"code": "ANL", "name": "Analgesics & Antipyretics", "description": "Pain and fever medicines"},
        {"code": "ANT", "name": "Antibiotics", "description": "Medicines for bacterial infections"},
        {"code": "AFG", "name": "Antifungals", "description": "Medicines for fungal infections"},
        {"code": "AVR", "name": "Antivirals", "description": "Medicines for viral infections"},
        {"code": "AHT", "name": "Antihistamines", "description": "Medicines for allergy symptoms"},
        {"code": "CVS", "name": "Cardiovascular", "description": "Heart and blood-vessel medicines"},
        {"code": "DIA", "name": "Antidiabetics", "description": "Blood-glucose control medicines"},
        {"code": "RES", "name": "Respiratory", "description": "Medicines for respiratory conditions"},
        {"code": "GIT", "name": "Gastrointestinal", "description": "Medicines for digestive conditions"},
        {"code": "CNS", "name": "Neurological / CNS", "description": "Medicines affecting the nervous system"},
        {"code": "VIT", "name": "Vitamins & Supplements", "description": "Vitamins, minerals and supplements"},
        {"code": "VAC", "name": "Vaccines", "description": "Immunization products"},
        {"code": "IV", "name": "IV Fluids", "description": "Intravenous fluids"},
        {"code": "TOP", "name": "Topical Medicines", "description": "Creams, ointments, gels etc."},
        {"code": "STE", "name": "Steroids", "description": "Corticosteroid medicines"},
        {"code": "EMG", "name": "Emergency Medicines", "description": "Emergency/critical-care medicines"},
    ]

    for cdata in pharmacy_categories_data:
        existing = db.scalar(select(MedicineCategory).where((MedicineCategory.code == cdata["code"]) | (MedicineCategory.name == cdata["name"])))
        if existing:
            existing.code = cdata["code"]
            existing.name = cdata["name"]
            existing.description = cdata["description"]
            print(f"Updated Pharmacy Category: {existing.name} ({existing.code})")
        else:
            cat = MedicineCategory(**cdata)
            db.add(cat)
            print(f"Seeded Pharmacy Category: {cdata['name']} ({cdata['code']})")


from app.models.user import User, UserRole
from app.models.doctor import Doctor, DoctorStatus
from app.models.store_item import ItemMaster, ItemCategory, ItemUnit, ItemStatus
from app.models.pharmacy import Medicine


def seed_item_master(db) -> None:
    """
    Seed overall item master data derived from the Doctor Tablet Dropdown list.
    Sets current_stock to 0 as required.
    """
    doctor_tablet_dropdown_items = [
        {
            "code": "ITM-MED-001",
            "name": "Aspirin 75mg",
            "generic_name": "Aspirin",
            "brand": "Ecosprin",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "75mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 5.0,
        },
        {
            "code": "ITM-MED-002",
            "name": "Aspirin 150mg",
            "generic_name": "Aspirin",
            "brand": "Ecosprin",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "150mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 8.0,
        },
        {
            "code": "ITM-MED-003",
            "name": "Clopidogrel 75mg",
            "generic_name": "Clopidogrel",
            "brand": "Plavix",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "75mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 12.0,
        },
        {
            "code": "ITM-MED-004",
            "name": "Atorvastatin 10mg",
            "generic_name": "Atorvastatin",
            "brand": "Lipitor",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "10mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 15.0,
        },
        {
            "code": "ITM-MED-005",
            "name": "Atorvastatin 20mg",
            "generic_name": "Atorvastatin",
            "brand": "Lipitor",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "20mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 22.0,
        },
        {
            "code": "ITM-MED-006",
            "name": "Atorvastatin 40mg",
            "generic_name": "Atorvastatin",
            "brand": "Lipitor",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "40mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 35.0,
        },
        {
            "code": "ITM-MED-007",
            "name": "Metoprolol 25mg",
            "generic_name": "Metoprolol Succinate",
            "brand": "Betaloc",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "25mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 10.0,
        },
        {
            "code": "ITM-MED-008",
            "name": "Metoprolol 50mg",
            "generic_name": "Metoprolol Succinate",
            "brand": "Betaloc",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "50mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 18.0,
        },
        {
            "code": "ITM-MED-009",
            "name": "Amlodipine 5mg",
            "generic_name": "Amlodipine Besylate",
            "brand": "Norvasc",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "5mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 6.0,
        },
        {
            "code": "ITM-MED-010",
            "name": "Ramipril 2.5mg",
            "generic_name": "Ramipril",
            "brand": "Altace",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "2.5mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 9.0,
        },
        {
            "code": "ITM-MED-011",
            "name": "Telmisartan 40mg",
            "generic_name": "Telmisartan",
            "brand": "Micardis",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Cardiovascular",
            "dosage_form": "Tablet",
            "strength": "40mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 14.0,
        },
        {
            "code": "ITM-MED-012",
            "name": "Metformin 500mg",
            "generic_name": "Metformin Hydrochloride",
            "brand": "Glucophage",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Antidiabetics",
            "dosage_form": "Tablet",
            "strength": "500mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 7.0,
        },
        {
            "code": "ITM-MED-013",
            "name": "Pantoprazole 40mg",
            "generic_name": "Pantoprazole Sodium",
            "brand": "Pan-40",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Gastrointestinal",
            "dosage_form": "Tablet",
            "strength": "40mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 11.0,
        },
        {
            "code": "ITM-MED-014",
            "name": "Paracetamol 500mg",
            "generic_name": "Paracetamol",
            "brand": "Crocin 500",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Analgesics & Antipyretics",
            "dosage_form": "Tablet",
            "strength": "500mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 3.0,
        },
        {
            "code": "ITM-MED-015",
            "name": "Paracetamol 650mg",
            "generic_name": "Paracetamol",
            "brand": "Dolo 650",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Analgesics & Antipyretics",
            "dosage_form": "Tablet",
            "strength": "650mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 4.0,
        },
        {
            "code": "ITM-MED-016",
            "name": "Amoxicillin 500mg",
            "generic_name": "Amoxicillin Trihydrate",
            "brand": "Mox 500",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Antibiotics",
            "dosage_form": "Capsule",
            "strength": "500mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 16.0,
        },
        {
            "code": "ITM-MED-017",
            "name": "Azithromycin 500mg",
            "generic_name": "Azithromycin Dihydrate",
            "brand": "Azithral 500",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Antibiotics",
            "dosage_form": "Tablet",
            "strength": "500mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 25.0,
        },
        {
            "code": "ITM-MED-018",
            "name": "Cetirizine 10mg",
            "generic_name": "Cetirizine Hydrochloride",
            "brand": "Zyrtec",
            "category_store": ItemCategory.Pharmaceuticals,
            "category_pharmacy": "Antihistamines",
            "dosage_form": "Tablet",
            "strength": "10mg",
            "unit_store": ItemUnit.Strip,
            "unit_pharmacy": "Strip",
            "unit_price": 4.5,
        },
    ]

    for item in doctor_tablet_dropdown_items:
        # 1. Seed Store ItemMaster
        existing_store = db.scalar(
            select(ItemMaster).where((ItemMaster.item_code == item["code"]) | (ItemMaster.item_name == item["name"]))
        )
        if existing_store:
            existing_store.item_code = item["code"]
            existing_store.item_name = item["name"]
            existing_store.category = item["category_store"]
            existing_store.generic_composition = item["generic_name"]
            existing_store.strength = item["strength"]
            existing_store.dosage_form = item["dosage_form"]
            existing_store.unit = item["unit_store"]
            existing_store.brand = item["brand"]
            existing_store.unit_price = item["unit_price"]
            existing_store.current_stock = 0
            existing_store.opening_stock = 0
            existing_store.status = ItemStatus.Active
            print(f"Updated Store Item Master: {existing_store.item_name} ({existing_store.item_code}) [Stock: 0]")
        else:
            new_store_item = ItemMaster(
                item_code=item["code"],
                item_name=item["name"],
                category=item["category_store"],
                sub_category="Tablets & Capsules",
                generic_composition=item["generic_name"],
                strength=item["strength"],
                dosage_form=item["dosage_form"],
                unit=item["unit_store"],
                pack_quantity=10,
                issue_unit="Piece",
                opening_stock=0,
                current_stock=0,
                brand=item["brand"],
                hsn_code="30049099",
                gst_percentage=12.0,
                min_stock=50,
                max_stock=500,
                reorder_level=100,
                storage_location="Pharmacy Rack A",
                description=f"Prescription tablet {item['name']} from doctor consultation dropdown",
                status=ItemStatus.Active,
                unit_price=item["unit_price"],
            )
            db.add(new_store_item)
            print(f"Seeded Store Item Master: {item['name']} ({item['code']}) [Stock: 0]")

        # 2. Seed Pharmacy Medicine
        existing_med = db.scalar(
            select(Medicine).where((Medicine.code == item["code"]) | (Medicine.name == item["name"]))
        )
        if existing_med:
            existing_med.code = item["code"]
            existing_med.name = item["name"]
            existing_med.generic_name = item["generic_name"]
            existing_med.brand = item["brand"]
            existing_med.category = item["category_pharmacy"]
            existing_med.dosage_form = item["dosage_form"]
            existing_med.strength = item["strength"]
            existing_med.unit = item["unit_pharmacy"]
            existing_med.selling_price = item["unit_price"]
            existing_med.purchase_price = round(item["unit_price"] * 0.8, 2)
            existing_med.current_stock = 0
            existing_med.status = "Active"
            print(f"Updated Pharmacy Medicine: {existing_med.name} ({existing_med.code}) [Stock: 0]")
        else:
            new_med = Medicine(
                code=item["code"],
                name=item["name"],
                generic_name=item["generic_name"],
                brand=item["brand"],
                category=item["category_pharmacy"],
                manufacturer=f"{item['brand']} Pharma",
                dosage_form=item["dosage_form"],
                strength=item["strength"],
                unit=item["unit_pharmacy"],
                purchase_price=round(item["unit_price"] * 0.8, 2),
                selling_price=item["unit_price"],
                gst=12.0,
                storage_condition="Store below 25°C",
                rack_location="Rack A",
                status="Active",
                current_stock=0,
                min_stock=50,
                max_stock=500,
                reorder_level=100,
            )
            db.add(new_med)
            print(f"Seeded Pharmacy Medicine: {item['name']} ({item['code']}) [Stock: 0]")


def seed_users(db) -> None:
    users_data = [
        {
            "id": "219d73d5-3790-4512-8abb-e558ccef7ea9",
            "name": "lab cantonment",
            "email": "labcon@hms.com",
            "hashed_password": "$2b$12$lEYwE5JaIG2UxJxJsBMvxe4ne3AHz06MDT0za7lwxttZ2VvjSNnKK",
            "role": UserRole.lab,
            "department": "N/A",
            "is_active": True,
            "status": "Active",
            "username": "USR-LAB-114",
            "employee_id": "EMP-LAB-83",
            "phone": "8877455662",
            "branch": "Cauvery Care Hospital - Cantonment Branch",
            "last_login": "2026-08-12 13:15:28",
        },
        {
            "id": "34fcaa6f-1cb5-40ba-b176-b308e47a9728",
            "name": "mani",
            "email": "mani@hms.com",
            "hashed_password": "$2b$12$KpxC7R0NSV4wGBLJbQ7OAONvSsV7MvJpH87ynnhrIswmlPGlvmWKS",
            "role": UserRole.doctor,
            "department": "Cardiology",
            "is_active": True,
            "status": "Active",
            "username": "USR-DOC-117",
            "employee_id": "EMP-DOC-86",
            "phone": "7844566998",
            "branch": "Cauvery Care Hospital - Cantonment Branch",
            "last_login": "2026-08-12 16:50:45",
        },
        {
            "id": "64992a17-36ac-497e-baa1-ccb525569250",
            "name": "jeeva",
            "email": "jeeva@hms.com",
            "hashed_password": "$2b$12$dO/31pHXKRxMqHXfGcQucOtP8DqcK35C1Y/pI7Bw0aDpXJKibXJLO",
            "role": UserRole.doctor,
            "department": "Cardiology",
            "is_active": True,
            "status": "Active",
            "username": "USR-DOC-112",
            "employee_id": "EMP-DOC-80",
            "phone": "7744444112",
            "branch": "Cauvery Care Hospital - Cantonment Branch",
            "last_login": "2026-08-12 16:50:21",
        },
        {
            "id": "abac6e9e-fb75-400a-b7a9-7200d61f6825",
            "name": "pharmacy Cantonement",
            "email": "pharmacycon@hms.com",
            "hashed_password": "$2b$12$1RoWX2Ig6mJ6YxtCS0dFJ.eaUx3ogMitrQgaF5RxQ/nNBgl7J5ko.",
            "role": UserRole.pharmacy,
            "department": "Cardiology",
            "is_active": True,
            "status": "Active",
            "username": "USR-DOC-115",
            "employee_id": "EMP-DOC-84",
            "phone": "9988655442",
            "branch": "Cauvery Care Hospital - Cantonment Branch",
            "last_login": "2026-08-11 23:26:56",
        },
        {
            "id": "c765455e-0dd2-4f40-9121-3459db90e59b",
            "name": "store cantonement",
            "email": "storecon@hms.com",
            "hashed_password": "$2b$12$U4h1EK/orkevIeLHBFun2.Hw.GTgebiaEp.qWM216BdmRZQPBdJLa",
            "role": UserRole.store,
            "department": "N/A",
            "is_active": True,
            "status": "Active",
            "username": "USR-STO-116",
            "employee_id": "EMP-STR-85",
            "phone": "9987744445",
            "branch": "Cauvery Care Hospital - Cantonment Branch",
            "last_login": "2026-08-12 14:45:27",
        },
        {
            "id": "d119350d-cfe9-4814-a585-b4cd527d8c1d",
            "name": "Nandy",
            "email": "nandy@hms.com",
            "hashed_password": "$2b$12$mC.6Kg469zaI5PcNhPgeaORZ8saZxiZCbzmrp8A0p0ob5Bv5OwS9S",
            "role": UserRole.nurse,
            "department": "N/A",
            "assigned_ward": "ICU",
            "is_active": True,
            "status": "Active",
            "username": "USR-NUR-113",
            "employee_id": "EMP-NUR-82",
            "phone": "7744544778",
            "branch": "Cauvery Care Hospital - Cantonment Branch",
            "last_login": "2026-08-12 13:08:41",
        },
        {
            "id": "fccab819-cfe8-49b6-9a8e-d8187a957ca6",
            "name": "Martin C",
            "email": "martinc@hms.com",
            "hashed_password": "$2b$12$CWvPLyEqiqOqUU8eGtMFN.9epeuIwYJVT6KBikApsv7vPmYqjnjCm",
            "role": UserRole.doctor,
            "department": "Cardiology",
            "is_active": True,
            "status": "Active",
            "username": "USR-DOC-103",
            "employee_id": "EMP-DOC-71",
            "phone": "7788555445",
            "branch": "Cauvery Care Hospital - Cantonment Branch",
            "last_login": "2026-08-09 23:53:25",
        },
        {
            "id": "fdc2a192-a3e6-46a4-8217-53a877488774",
            "name": "Reception cantonment",
            "email": "receptioncon@hms.com",
            "hashed_password": "$2b$12$78g1WJ49CnoEk5uHA/4xfeW/60UDQCkwLw2aJzXsiOnnEk1iLjMSG",
            "role": UserRole.reception,
            "department": "N/A",
            "is_active": True,
            "status": "Active",
            "username": "USR-REC-113",
            "employee_id": "EMP-REC-81",
            "phone": "77445566332",
            "branch": "Cauvery Care Hospital - Cantonment Branch",
            "last_login": "2026-08-12 13:38:57",
        },
    ]

    for udata in users_data:
        existing = db.scalar(select(User).where(User.email == udata["email"]))
        if existing:
            for key, val in udata.items():
                setattr(existing, key, val)
            print(f"Updated User: {existing.name} ({existing.email})")
        else:
            user = User(**udata)
            db.add(user)
            print(f"Seeded User: {udata['name']} ({udata['email']})")

        # Sync doctor table if user is a doctor
        if udata["role"] in (UserRole.doctor, "doctor"):
            doc_name = udata["name"] if udata["name"].startswith("Dr.") else f"Dr. {udata['name']}"
            existing_doc = db.scalar(select(Doctor).where(Doctor.email == udata["email"]))
            if existing_doc:
                existing_doc.name = doc_name
                existing_doc.department = udata.get("department") or "Cardiology"
                existing_doc.branch = udata.get("branch")
            else:
                doc = Doctor(
                    name=doc_name,
                    email=udata["email"],
                    department=udata.get("department") or "Cardiology",
                    specialization="Cardiologist" if udata.get("department") == "Cardiology" else "General Physician",
                    room_no="OPD-201",
                    consultation_fee=500.0,
                    available_days=["Mon", "Tue", "Wed", "Thu", "Fri"],
                    slots=["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
                    status=DoctorStatus.Available,
                    branch=udata.get("branch"),
                )
                db.add(doc)


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)
    seed_super_admin()

    db = SessionLocal()
    try:
        seed_hospital_profile(db)
        seed_branches(db)
        seed_departments(db)
        seed_pharmacy_categories(db)
        seed_users(db)
        seed_item_master(db)
        db.commit()
        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()


