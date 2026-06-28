export interface Station {
    id: string;
    name: string;
    address: string;
    distance: number; // meters from mock user position
    walkMinutes: number; // computed from distance / 80m per min
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

// ── Pricing model ─────────────────────────────────────────────────────────────
// 7.000đ flat for the first 5 minutes, then 1.000đ per additional minute.
export const TRIP_BASE_FEE = 7000;       // VND
export const TRIP_BASE_MINUTES = 5;
export const TRIP_EXTRA_RATE = 1000;     // VND / minute after base period

/**
 * elapsedMinutes may be fractional (e.g. real-time seconds / 60).
 * Returns total VND cost at that point in the trip.
 */
export function calculateTripCost(elapsedMinutes: number): number {
    if (elapsedMinutes <= TRIP_BASE_MINUTES) return TRIP_BASE_FEE;
    return Math.round(TRIP_BASE_FEE + (elapsedMinutes - TRIP_BASE_MINUTES) * TRIP_EXTRA_RATE);
}

// ── Mock user location (near Cổng Chính ĐHQG, used as fallback when GPS unavailable) ──
export const MOCK_USER_POSITION: [number, number] = [10.8683, 106.8021];

// ── Stations — real GPS coords around ĐHQG-HCM campus (Linh Trung, Thủ Đức) ──
//
// Distances & walkMinutes are calculated from MOCK_USER_POSITION at 80 m/min walking speed.
// Layout reference:
//   - Xa Lộ Hà Nội runs North–South along the EAST side (lng ≈ 106.806)
//   - Campus interior is WEST of Xa Lộ Hà Nội
//   - BK CS2 is the northernmost school; IU is the southernmost
export const MOCK_STATIONS: Station[] = [
    {
        id: 'station-001',
        name: 'Ga Metro Đại Học Quốc Gia',
        address: 'Xa Lộ Hà Nội, Linh Trung, Thủ Đức, TP.HCM',
        distance: 380,
        walkMinutes: 5,
        // Elevated metro station on Xa Lộ Hà Nội, near ĐHQG eastern entrance
        lat: 10.8712,
        lng: 106.8054,
        availableVehicles: 6,
        totalVehicles: 10,
        status: 'open',
    },
    {
        id: 'station-002',
        name: 'Trạm ĐH Khoa học Tự nhiên',
        address: 'Cổng chính HCMUS, Linh Trung, Thủ Đức, TP.HCM',
        distance: 210,
        walkMinutes: 3,
        // HCMUS campus, central ĐHQG area
        lat: 10.8696,
        lng: 106.8030,
        availableVehicles: 4,
        totalVehicles: 8,
        status: 'open',
    },
    {
        id: 'station-003',
        name: 'Trạm ĐH Quốc Tế',
        address: 'Khu phố 6, Linh Trung, Thủ Đức, TP.HCM',
        distance: 440,
        walkMinutes: 6,
        // IU campus — southern section of ĐHQG
        lat: 10.8674,
        lng: 106.8012,
        availableVehicles: 5,
        totalVehicles: 8,
        status: 'open',
    },
    {
        id: 'station-004',
        name: 'Trạm ĐH Bách Khoa (CS2)',
        address: 'Tô Vĩnh Diện, Linh Chiểu, Thủ Đức, TP.HCM',
        distance: 1120,
        walkMinutes: 14,
        // HCMUT CS2 — northernmost school in the ĐHQG cluster
        lat: 10.8803,
        lng: 106.8000,
        availableVehicles: 0,
        totalVehicles: 6,
        status: 'full',
    },
    {
        id: 'station-005',
        name: 'Trạm KTX Khu A, ĐHQG',
        address: 'Khu A Ký Túc Xá ĐHQG-HCM, Linh Trung, Thủ Đức',
        distance: 560,
        walkMinutes: 7,
        // Dormitory Zone A — western part of campus
        lat: 10.8718,
        lng: 106.7992,
        availableVehicles: 7,
        totalVehicles: 10,
        status: 'open',
    },
    {
        id: 'station-006',
        name: 'Trạm Cổng Chính ĐHQG',
        address: 'Cổng chính ĐHQG-HCM, Linh Trung, Thủ Đức, TP.HCM',
        distance: 50,
        walkMinutes: 1,
        // Main southern gate — closest to mock user position
        lat: 10.8681,
        lng: 106.8021,
        availableVehicles: 2,
        totalVehicles: 6,
        status: 'open',
    },
];

export const MOCK_VEHICLES: Vehicle[] = [
    {
        id: 'vehicle-001',
        stationId: 'station-001',
        type: 'scooter',
        model: 'VinFast Feliz S',
        batteryPercent: 87,
        estimatedRangeKm: 52,
        status: 'available',
        slotNumber: 'A1',
        lastCharged: '06:30 hôm nay',
    },
    {
        id: 'vehicle-002',
        stationId: 'station-001',
        type: 'scooter',
        model: 'VinFast Feliz S',
        batteryPercent: 64,
        estimatedRangeKm: 38,
        status: 'available',
        slotNumber: 'A2',
        lastCharged: '04:15 hôm nay',
    },
    {
        id: 'vehicle-003',
        stationId: 'station-001',
        type: 'scooter',
        model: 'Selex Camel',
        batteryPercent: 45,
        estimatedRangeKm: 27,
        status: 'available',
        slotNumber: 'B1',
        lastCharged: '22:00 hôm qua',
    },
    {
        id: 'vehicle-004',
        stationId: 'station-002',
        type: 'scooter',
        model: 'Pega NewTech Pro',
        batteryPercent: 72,
        estimatedRangeKm: 43,
        status: 'available',
        slotNumber: 'C1',
        lastCharged: '05:00 hôm nay',
    },
    {
        id: 'vehicle-005',
        stationId: 'station-002',
        type: 'scooter',
        model: 'VinFast Theon',
        batteryPercent: 55,
        estimatedRangeKm: 33,
        status: 'available',
        slotNumber: 'A3',
        lastCharged: '03:00 hôm nay',
    },
    {
        id: 'vehicle-006',
        stationId: 'station-003',
        type: 'scooter',
        model: 'VinFast Feliz S',
        batteryPercent: 91,
        estimatedRangeKm: 55,
        status: 'available',
        slotNumber: 'A1',
        lastCharged: '07:00 hôm nay',
    },
];

export function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDistance(meters: number): string {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
}

export function getVehicleTypeLabel(type: Vehicle['type']): string {
    const labels = {
        scooter: 'Xe tay ga điện',
        bike: 'Xe đạp điện',
        moped: 'Xe máy điện',
    };
    return labels[type];
}
