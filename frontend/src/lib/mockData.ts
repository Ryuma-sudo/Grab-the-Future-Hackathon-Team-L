export interface Station {
    id: string;
    name: string;
    address: string;
    distance: number; // meters from MOCK_USER_POSITION
    walkMinutes: number; // distance / 80 m·min⁻¹
    lat: number;
    lng: number;
    availableVehicles: number;
    totalVehicles: number;
    status: 'open' | 'full' | 'closed';
}

export interface Vehicle {
    id: string;
    stationId: string;
    type: 'scooter' | 'bike' | 'moped';
    model: string;
    batteryPercent: number;
    estimatedRangeKm: number;
    status: 'available' | 'busy' | 'charging' | 'maintenance';
    slotNumber: string;
    lastCharged: string;
}

// ── Pricing ───────────────────────────────────────────────────────────────────
export const TRIP_BASE_FEE = 7000;       // VND — flat fee for first 5 min
export const TRIP_BASE_MINUTES = 5;
export const TRIP_EXTRA_RATE = 1000;     // VND / min after base period

export function calculateTripCost(elapsedMinutes: number): number {
    if (elapsedMinutes <= TRIP_BASE_MINUTES) return TRIP_BASE_FEE;
    return Math.round(TRIP_BASE_FEE + (elapsedMinutes - TRIP_BASE_MINUTES) * TRIP_EXTRA_RATE);
}

// ── Mock user position (fallback when GPS unavailable) ────────────────────────
// Near Cổng Chính ĐHQG-HCM (Linh Trung, Thủ Đức)
export const MOCK_USER_POSITION: [number, number] = [10.8683, 106.8021];

// ── Stations — real GPS, distances from MOCK_USER_POSITION ───────────────────
export const MOCK_STATIONS: Station[] = [
    {
        id: 'station-001',
        name: 'Ga Metro Đại Học Quốc Gia',
        address: 'Xa Lộ Hà Nội, Linh Trung, Thủ Đức, TP.HCM',
        distance: 380,   walkMinutes: 5,
        lat: 10.8712, lng: 106.8054,
        availableVehicles: 6, totalVehicles: 10, status: 'open',
    },
    {
        id: 'station-002',
        name: 'Trạm ĐH Khoa học Tự nhiên',
        address: 'Cổng chính HCMUS, Linh Trung, Thủ Đức, TP.HCM',
        distance: 210,   walkMinutes: 3,
        lat: 10.8696, lng: 106.8030,
        availableVehicles: 4, totalVehicles: 8, status: 'open',
    },
    {
        id: 'station-003',
        name: 'Trạm ĐH Quốc Tế',
        address: 'Khu phố 6, Linh Trung, Thủ Đức, TP.HCM',
        distance: 440,   walkMinutes: 6,
        lat: 10.8674, lng: 106.8012,
        availableVehicles: 5, totalVehicles: 8, status: 'open',
    },
    {
        id: 'station-004',
        name: 'Trạm ĐH Bách Khoa (CS2)',
        address: 'Tô Vĩnh Diện, Linh Chiểu, Thủ Đức, TP.HCM',
        distance: 1120,  walkMinutes: 14,
        lat: 10.8803, lng: 106.8000,
        availableVehicles: 0, totalVehicles: 6, status: 'full',
    },
    {
        id: 'station-005',
        name: 'Trạm KTX Khu A, ĐHQG',
        address: 'Khu A Ký Túc Xá ĐHQG-HCM, Linh Trung, Thủ Đức',
        distance: 560,   walkMinutes: 7,
        lat: 10.8718, lng: 106.7992,
        availableVehicles: 7, totalVehicles: 10, status: 'open',
    },
    {
        id: 'station-006',
        name: 'Trạm Cổng Chính ĐHQG',
        address: 'Cổng chính ĐHQG-HCM, Linh Trung, Thủ Đức, TP.HCM',
        distance: 50,    walkMinutes: 1,
        lat: 10.8681, lng: 106.8021,
        availableVehicles: 2, totalVehicles: 6, status: 'open',
    },
    // ── Trạm xa — demo dải giá tiền phong phú ───────────────────────────────
    // ~2.4km → ước 9 phút đi xe → ~11.000đ
    {
        id: 'station-007',
        name: 'Trạm Khu Công Nghệ Cao TP.HCM',
        address: 'Đường D1, Khu CNC, Linh Trung, Thủ Đức, TP.HCM',
        distance: 2420,  walkMinutes: 30,
        lat: 10.8521, lng: 106.8162,
        availableVehicles: 5, totalVehicles: 8, status: 'open',
    },
    // ~3.8km → ước 15 phút → ~17.000đ
    {
        id: 'station-008',
        name: 'Trạm Bến Xe Suối Tiên',
        address: 'Xa lộ Hà Nội, Tăng Nhơn Phú B, Thủ Đức, TP.HCM',
        distance: 3800,  walkMinutes: 47,
        lat: 10.8945, lng: 106.8240,
        availableVehicles: 4, totalVehicles: 7, status: 'open',
    },
    // ~5.8km → ước 23 phút → ~25.000đ
    {
        id: 'station-009',
        name: 'Trạm Tam Bình - Thủ Đức',
        address: 'Ngã tư Bình Triệu, Tam Bình, Thủ Đức, TP.HCM',
        distance: 5800,  walkMinutes: 72,
        lat: 10.8350, lng: 106.7560,
        availableVehicles: 6, totalVehicles: 9, status: 'open',
    },
    // ~8.0km → ước 32 phút → ~34.000đ
    {
        id: 'station-010',
        name: 'Trạm Bến Xe Miền Đông (mới)',
        address: 'Đường Hoàng Hữu Nam, Long Bình, Thủ Đức, TP.HCM',
        distance: 8000,  walkMinutes: 100,
        lat: 10.7960, lng: 106.8021,
        availableVehicles: 3, totalVehicles: 6, status: 'open',
    },
];

// ── Vehicles — all Yadea, consistent with station available/total counts ──────
// Station 001: 6 available + 4 non-available = 10 total
// Station 002: 4 available + 4 non-available = 8 total
// Station 003: 5 available + 3 non-available = 8 total
// Station 004: 0 available + 6 non-available = 6 total (full)
// Station 005: 7 available + 3 non-available = 10 total
// Station 006: 2 available + 4 non-available = 6 total
export const MOCK_VEHICLES: Vehicle[] = [
    // ── Station 001 — Ga Metro ĐHQG ──────────────────────────────────────────
    { id: 'v-101', stationId: 'station-001', type: 'scooter', model: 'Yadea G5',       batteryPercent: 87, estimatedRangeKm: 52, status: 'available',    slotNumber: 'A1', lastCharged: '06:30 hôm nay' },
    { id: 'v-102', stationId: 'station-001', type: 'scooter', model: 'Yadea G5',       batteryPercent: 64, estimatedRangeKm: 38, status: 'available',    slotNumber: 'A2', lastCharged: '04:15 hôm nay' },
    { id: 'v-103', stationId: 'station-001', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 45, estimatedRangeKm: 27, status: 'available',    slotNumber: 'B1', lastCharged: '22:00 hôm qua' },
    { id: 'v-104', stationId: 'station-001', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent:  8, estimatedRangeKm:  4, status: 'available',    slotNumber: 'B2', lastCharged: '2 ngày trước'  }, // very low battery
    { id: 'v-105', stationId: 'station-001', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 92, estimatedRangeKm: 55, status: 'available',    slotNumber: 'C1', lastCharged: '07:00 hôm nay' },
    { id: 'v-106', stationId: 'station-001', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 76, estimatedRangeKm: 46, status: 'available',    slotNumber: 'C2', lastCharged: '05:45 hôm nay' },
    { id: 'v-107', stationId: 'station-001', type: 'scooter', model: 'Yadea G5',       batteryPercent: 32, estimatedRangeKm: 19, status: 'charging',     slotNumber: 'D1', lastCharged: 'Đang sạc'      },
    { id: 'v-108', stationId: 'station-001', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 15, estimatedRangeKm:  9, status: 'charging',     slotNumber: 'D2', lastCharged: 'Đang sạc'      },
    { id: 'v-109', stationId: 'station-001', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent:  0, estimatedRangeKm:  0, status: 'maintenance',  slotNumber: 'D3', lastCharged: 'Bảo trì'       },
    { id: 'v-110', stationId: 'station-001', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 55, estimatedRangeKm: 33, status: 'busy',         slotNumber: 'D4', lastCharged: 'Đang dùng'     },

    // ── Station 002 — ĐH Khoa học Tự nhiên ──────────────────────────────────
    { id: 'v-201', stationId: 'station-002', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 72, estimatedRangeKm: 43, status: 'available',    slotNumber: 'A1', lastCharged: '05:00 hôm nay' },
    { id: 'v-202', stationId: 'station-002', type: 'scooter', model: 'Yadea G5',       batteryPercent: 55, estimatedRangeKm: 33, status: 'available',    slotNumber: 'A2', lastCharged: '03:00 hôm nay' },
    { id: 'v-203', stationId: 'station-002', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 88, estimatedRangeKm: 53, status: 'available',    slotNumber: 'B1', lastCharged: '07:30 hôm nay' },
    { id: 'v-204', stationId: 'station-002', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 41, estimatedRangeKm: 25, status: 'available',    slotNumber: 'B2', lastCharged: '00:30 hôm nay' },
    { id: 'v-205', stationId: 'station-002', type: 'scooter', model: 'Yadea G5',       batteryPercent: 20, estimatedRangeKm: 12, status: 'charging',     slotNumber: 'C1', lastCharged: 'Đang sạc'      },
    { id: 'v-206', stationId: 'station-002', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 60, estimatedRangeKm: 36, status: 'busy',         slotNumber: 'C2', lastCharged: 'Đang dùng'     },
    { id: 'v-207', stationId: 'station-002', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 45, estimatedRangeKm: 27, status: 'busy',         slotNumber: 'D1', lastCharged: 'Đang dùng'     },
    { id: 'v-208', stationId: 'station-002', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent:  5, estimatedRangeKm:  3, status: 'maintenance',  slotNumber: 'D2', lastCharged: 'Bảo trì'       },

    // ── Station 003 — ĐH Quốc Tế ─────────────────────────────────────────────
    { id: 'v-301', stationId: 'station-003', type: 'scooter', model: 'Yadea G5',       batteryPercent: 91, estimatedRangeKm: 55, status: 'available',    slotNumber: 'A1', lastCharged: '07:00 hôm nay' },
    { id: 'v-302', stationId: 'station-003', type: 'scooter', model: 'Yadea G5',       batteryPercent: 67, estimatedRangeKm: 40, status: 'available',    slotNumber: 'A2', lastCharged: '05:15 hôm nay' },
    { id: 'v-303', stationId: 'station-003', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 54, estimatedRangeKm: 32, status: 'available',    slotNumber: 'B1', lastCharged: '02:00 hôm nay' },
    { id: 'v-304', stationId: 'station-003', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 79, estimatedRangeKm: 47, status: 'available',    slotNumber: 'B2', lastCharged: '06:00 hôm nay' },
    { id: 'v-305', stationId: 'station-003', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 35, estimatedRangeKm: 21, status: 'available',    slotNumber: 'C1', lastCharged: '23:00 hôm qua' },
    { id: 'v-306', stationId: 'station-003', type: 'scooter', model: 'Yadea G5',       batteryPercent: 10, estimatedRangeKm:  6, status: 'charging',     slotNumber: 'C2', lastCharged: 'Đang sạc'      },
    { id: 'v-307', stationId: 'station-003', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 72, estimatedRangeKm: 43, status: 'busy',         slotNumber: 'D1', lastCharged: 'Đang dùng'     },
    { id: 'v-308', stationId: 'station-003', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 48, estimatedRangeKm: 29, status: 'busy',         slotNumber: 'D2', lastCharged: 'Đang dùng'     },

    // ── Station 004 — ĐH Bách Khoa CS2 (all occupied/charging) ───────────────
    { id: 'v-401', stationId: 'station-004', type: 'scooter', model: 'Yadea G5',       batteryPercent: 30, estimatedRangeKm: 18, status: 'charging',     slotNumber: 'A1', lastCharged: 'Đang sạc'      },
    { id: 'v-402', stationId: 'station-004', type: 'scooter', model: 'Yadea G5',       batteryPercent: 80, estimatedRangeKm: 48, status: 'busy',         slotNumber: 'A2', lastCharged: 'Đang dùng'     },
    { id: 'v-403', stationId: 'station-004', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 55, estimatedRangeKm: 33, status: 'busy',         slotNumber: 'B1', lastCharged: 'Đang dùng'     },
    { id: 'v-404', stationId: 'station-004', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 90, estimatedRangeKm: 54, status: 'busy',         slotNumber: 'B2', lastCharged: 'Đang dùng'     },
    { id: 'v-405', stationId: 'station-004', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent:  0, estimatedRangeKm:  0, status: 'maintenance',  slotNumber: 'C1', lastCharged: 'Bảo trì'       },
    { id: 'v-406', stationId: 'station-004', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 12, estimatedRangeKm:  7, status: 'charging',     slotNumber: 'C2', lastCharged: 'Đang sạc'      },

    // ── Station 005 — KTX Khu A ───────────────────────────────────────────────
    { id: 'v-501', stationId: 'station-005', type: 'scooter', model: 'Yadea G5',       batteryPercent: 95, estimatedRangeKm: 57, status: 'available',    slotNumber: 'A1', lastCharged: '07:45 hôm nay' },
    { id: 'v-502', stationId: 'station-005', type: 'scooter', model: 'Yadea G5',       batteryPercent: 82, estimatedRangeKm: 49, status: 'available',    slotNumber: 'A2', lastCharged: '06:00 hôm nay' },
    { id: 'v-503', stationId: 'station-005', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 71, estimatedRangeKm: 43, status: 'available',    slotNumber: 'A3', lastCharged: '04:30 hôm nay' },
    { id: 'v-504', stationId: 'station-005', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 58, estimatedRangeKm: 35, status: 'available',    slotNumber: 'B1', lastCharged: '03:15 hôm nay' },
    { id: 'v-505', stationId: 'station-005', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 43, estimatedRangeKm: 26, status: 'available',    slotNumber: 'B2', lastCharged: '01:00 hôm nay' },
    { id: 'v-506', stationId: 'station-005', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 88, estimatedRangeKm: 53, status: 'available',    slotNumber: 'B3', lastCharged: '07:00 hôm nay' },
    { id: 'v-507', stationId: 'station-005', type: 'scooter', model: 'Yadea G5',       batteryPercent: 66, estimatedRangeKm: 40, status: 'available',    slotNumber: 'C1', lastCharged: '05:30 hôm nay' },
    { id: 'v-508', stationId: 'station-005', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 25, estimatedRangeKm: 15, status: 'charging',     slotNumber: 'C2', lastCharged: 'Đang sạc'      },
    { id: 'v-509', stationId: 'station-005', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 18, estimatedRangeKm: 11, status: 'charging',     slotNumber: 'C3', lastCharged: 'Đang sạc'      },
    { id: 'v-510', stationId: 'station-005', type: 'scooter', model: 'Yadea G5',       batteryPercent: 90, estimatedRangeKm: 54, status: 'busy',         slotNumber: 'D1', lastCharged: 'Đang dùng'     },

    // ── Station 006 — Cổng Chính ĐHQG ────────────────────────────────────────
    { id: 'v-601', stationId: 'station-006', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 74, estimatedRangeKm: 44, status: 'available',    slotNumber: 'A1', lastCharged: '06:15 hôm nay' },
    { id: 'v-602', stationId: 'station-006', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 49, estimatedRangeKm: 29, status: 'available',    slotNumber: 'A2', lastCharged: '02:45 hôm nay' },
    { id: 'v-603', stationId: 'station-006', type: 'scooter', model: 'Yadea G5',       batteryPercent: 35, estimatedRangeKm: 21, status: 'charging',     slotNumber: 'B1', lastCharged: 'Đang sạc'      },
    { id: 'v-604', stationId: 'station-006', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 60, estimatedRangeKm: 36, status: 'busy',         slotNumber: 'B2', lastCharged: 'Đang dùng'     },
    { id: 'v-605', stationId: 'station-006', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 80, estimatedRangeKm: 48, status: 'busy',         slotNumber: 'B3', lastCharged: 'Đang dùng'     },
    { id: 'v-606', stationId: 'station-006', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 55, estimatedRangeKm: 33, status: 'busy',         slotNumber: 'C1', lastCharged: 'Đang dùng'     },

    // ── Station 007 — Khu CNC TP.HCM (5 available / 8 total) ─────────────────
    { id: 'v-701', stationId: 'station-007', type: 'scooter', model: 'Yadea G5',       batteryPercent: 93, estimatedRangeKm: 56, status: 'available',    slotNumber: 'A1', lastCharged: '07:20 hôm nay' },
    { id: 'v-702', stationId: 'station-007', type: 'scooter', model: 'Yadea G5',       batteryPercent: 78, estimatedRangeKm: 47, status: 'available',    slotNumber: 'A2', lastCharged: '05:50 hôm nay' },
    { id: 'v-703', stationId: 'station-007', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 61, estimatedRangeKm: 37, status: 'available',    slotNumber: 'B1', lastCharged: '03:30 hôm nay' },
    { id: 'v-704', stationId: 'station-007', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 44, estimatedRangeKm: 26, status: 'available',    slotNumber: 'B2', lastCharged: '01:00 hôm nay' },
    { id: 'v-705', stationId: 'station-007', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 85, estimatedRangeKm: 51, status: 'available',    slotNumber: 'C1', lastCharged: '06:45 hôm nay' },
    { id: 'v-706', stationId: 'station-007', type: 'scooter', model: 'Yadea G5',       batteryPercent: 22, estimatedRangeKm: 13, status: 'charging',     slotNumber: 'C2', lastCharged: 'Đang sạc'      },
    { id: 'v-707', stationId: 'station-007', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 68, estimatedRangeKm: 41, status: 'busy',         slotNumber: 'D1', lastCharged: 'Đang dùng'     },
    { id: 'v-708', stationId: 'station-007', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 50, estimatedRangeKm: 30, status: 'busy',         slotNumber: 'D2', lastCharged: 'Đang dùng'     },

    // ── Station 008 — Bến Xe Suối Tiên (4 available / 7 total) ───────────────
    { id: 'v-801', stationId: 'station-008', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 89, estimatedRangeKm: 53, status: 'available',    slotNumber: 'A1', lastCharged: '07:00 hôm nay' },
    { id: 'v-802', stationId: 'station-008', type: 'scooter', model: 'Yadea G5',       batteryPercent: 70, estimatedRangeKm: 42, status: 'available',    slotNumber: 'A2', lastCharged: '05:15 hôm nay' },
    { id: 'v-803', stationId: 'station-008', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 52, estimatedRangeKm: 31, status: 'available',    slotNumber: 'B1', lastCharged: '02:20 hôm nay' },
    { id: 'v-804', stationId: 'station-008', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 36, estimatedRangeKm: 22, status: 'available',    slotNumber: 'B2', lastCharged: '23:40 hôm qua' },
    { id: 'v-805', stationId: 'station-008', type: 'scooter', model: 'Yadea G5',       batteryPercent: 14, estimatedRangeKm:  8, status: 'charging',     slotNumber: 'C1', lastCharged: 'Đang sạc'      },
    { id: 'v-806', stationId: 'station-008', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 80, estimatedRangeKm: 48, status: 'busy',         slotNumber: 'C2', lastCharged: 'Đang dùng'     },
    { id: 'v-807', stationId: 'station-008', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 63, estimatedRangeKm: 38, status: 'busy',         slotNumber: 'D1', lastCharged: 'Đang dùng'     },

    // ── Station 009 — Tam Bình Thủ Đức (6 available / 9 total) ───────────────
    { id: 'v-901', stationId: 'station-009', type: 'scooter', model: 'Yadea G5',       batteryPercent: 96, estimatedRangeKm: 58, status: 'available',    slotNumber: 'A1', lastCharged: '07:55 hôm nay' },
    { id: 'v-902', stationId: 'station-009', type: 'scooter', model: 'Yadea G5',       batteryPercent: 83, estimatedRangeKm: 50, status: 'available',    slotNumber: 'A2', lastCharged: '06:10 hôm nay' },
    { id: 'v-903', stationId: 'station-009', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 65, estimatedRangeKm: 39, status: 'available',    slotNumber: 'A3', lastCharged: '04:00 hôm nay' },
    { id: 'v-904', stationId: 'station-009', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 48, estimatedRangeKm: 29, status: 'available',    slotNumber: 'B1', lastCharged: '01:30 hôm nay' },
    { id: 'v-905', stationId: 'station-009', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 77, estimatedRangeKm: 46, status: 'available',    slotNumber: 'B2', lastCharged: '06:30 hôm nay' },
    { id: 'v-906', stationId: 'station-009', type: 'scooter', model: 'Yadea G5',       batteryPercent: 58, estimatedRangeKm: 35, status: 'available',    slotNumber: 'B3', lastCharged: '03:15 hôm nay' },
    { id: 'v-907', stationId: 'station-009', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 28, estimatedRangeKm: 17, status: 'charging',     slotNumber: 'C1', lastCharged: 'Đang sạc'      },
    { id: 'v-908', stationId: 'station-009', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 72, estimatedRangeKm: 43, status: 'busy',         slotNumber: 'C2', lastCharged: 'Đang dùng'     },
    { id: 'v-909', stationId: 'station-009', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 40, estimatedRangeKm: 24, status: 'busy',         slotNumber: 'D1', lastCharged: 'Đang dùng'     },

    // ── Station 010 — Bến Xe Miền Đông mới (3 available / 6 total) ───────────
    { id: 'v-1001', stationId: 'station-010', type: 'scooter', model: 'Yadea G5',       batteryPercent: 88, estimatedRangeKm: 53, status: 'available',    slotNumber: 'A1', lastCharged: '07:10 hôm nay' },
    { id: 'v-1002', stationId: 'station-010', type: 'scooter', model: 'Yadea T9 Pro',   batteryPercent: 73, estimatedRangeKm: 44, status: 'available',    slotNumber: 'A2', lastCharged: '05:40 hôm nay' },
    { id: 'v-1003', stationId: 'station-010', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 59, estimatedRangeKm: 35, status: 'available',    slotNumber: 'B1', lastCharged: '03:00 hôm nay' },
    { id: 'v-1004', stationId: 'station-010', type: 'scooter', model: 'Yadea EM10 Pro', batteryPercent: 17, estimatedRangeKm: 10, status: 'charging',     slotNumber: 'B2', lastCharged: 'Đang sạc'      },
    { id: 'v-1005', stationId: 'station-010', type: 'scooter', model: 'Yadea G5',       batteryPercent: 91, estimatedRangeKm: 55, status: 'busy',         slotNumber: 'C1', lastCharged: 'Đang dùng'     },
    { id: 'v-1006', stationId: 'station-010', type: 'scooter', model: 'Yadea C1S',      batteryPercent: 64, estimatedRangeKm: 38, status: 'busy',         slotNumber: 'C2', lastCharged: 'Đang dùng'     },
];

export function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDistance(meters: number): string {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
}

export function getVehicleTypeLabel(type: Vehicle['type']): string {
    return { scooter: 'Xe tay ga điện', bike: 'Xe đạp điện', moped: 'Xe máy điện' }[type];
}
