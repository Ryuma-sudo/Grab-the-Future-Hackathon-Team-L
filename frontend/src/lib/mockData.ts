export interface Station {
    id: string;
    name: string;
    address: string;
    distance: number; // meters
    walkMinutes: number; // default walk time from nearby area
    lat: number;  // real GPS latitude
    lng: number;  // real GPS longitude
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
    pricePerMinute: number; // VND
    status: 'available' | 'busy' | 'charging' | 'maintenance';
    slotNumber: string;
    lastCharged: string;
}

// Stations around ĐHQG-HCM campus area (Linh Trung, Thu Duc City, HCMC)
export const MOCK_STATIONS: Station[] = [
    {
        id: 'station-001',
        name: 'Ga Metro Đại Học Quốc Gia',
        address: 'Xa Lộ Hà Nội, Linh Trung, Thủ Đức, TP.HCM',
        distance: 120,
        walkMinutes: 2,
        lat: 10.8726,
        lng: 106.8016,
        availableVehicles: 6,
        totalVehicles: 10,
        status: 'open',
    },
    {
        id: 'station-002',
        name: 'Trạm ĐH Khoa học Tự nhiên',
        address: 'Cổng chính HCMUS, Linh Trung, Thủ Đức, TP.HCM',
        distance: 350,
        walkMinutes: 5,
        lat: 10.8703,
        lng: 106.8028,
        availableVehicles: 4,
        totalVehicles: 8,
        status: 'open',
    },
    {
        id: 'station-003',
        name: 'Trạm ĐH Quốc Tế',
        address: 'Khu phố 6, Linh Trung, Thủ Đức, TP.HCM',
        distance: 480,
        walkMinutes: 7,
        lat: 10.8691,
        lng: 106.8010,
        availableVehicles: 5,
        totalVehicles: 8,
        status: 'open',
    },
    {
        id: 'station-004',
        name: 'Trạm ĐH Bách Khoa (CS2)',
        address: 'Tô Vĩnh Diện, Linh Chiểu, Thủ Đức, TP.HCM',
        distance: 1100,
        walkMinutes: 14,
        lat: 10.8793,
        lng: 106.8011,
        availableVehicles: 0,
        totalVehicles: 6,
        status: 'full',
    },
    {
        id: 'station-005',
        name: 'Trạm KTX Khu A, ĐHQG',
        address: 'Khu A Ký Túc Xá ĐHQG-HCM, Linh Trung, Thủ Đức',
        distance: 600,
        walkMinutes: 8,
        lat: 10.8714,
        lng: 106.7997,
        availableVehicles: 7,
        totalVehicles: 10,
        status: 'open',
    },
    {
        id: 'station-006',
        name: 'Trạm Cổng Chính ĐHQG',
        address: 'Cổng chính ĐHQG-HCM, Linh Trung, Thủ Đức, TP.HCM',
        distance: 800,
        walkMinutes: 10,
        lat: 10.8680,
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
        pricePerMinute: 1500,
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
        pricePerMinute: 1500,
        status: 'available',
        slotNumber: 'A2',
        lastCharged: '04:15 hôm nay',
    },
    {
        id: 'vehicle-003',
        stationId: 'station-001',
        type: 'bike',
        model: 'Selex Camel',
        batteryPercent: 45,
        estimatedRangeKm: 27,
        pricePerMinute: 1000,
        status: 'available',
        slotNumber: 'B1',
        lastCharged: '22:00 hôm qua',
    },
    {
        id: 'vehicle-004',
        stationId: 'station-002',
        type: 'moped',
        model: 'Pega NewTech Pro',
        batteryPercent: 72,
        estimatedRangeKm: 43,
        pricePerMinute: 1800,
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
        pricePerMinute: 1500,
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
        pricePerMinute: 1500,
        status: 'available',
        slotNumber: 'A1',
        lastCharged: '07:00 hôm nay',
    },
];

export const MOCK_ROUTE_POINTS = [
    { x: 50, y: 58 },
    { x: 46, y: 54 },
    { x: 43, y: 50 },
    { x: 40, y: 46 },
    { x: 38, y: 42 },
    { x: 35, y: 38 },
    { x: 32, y: 32 },
    { x: 30, y: 28 },
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
