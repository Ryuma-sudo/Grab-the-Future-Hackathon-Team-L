export interface Station {
    id: string;
    name: string;
    address: string;
    distance: number; // meters
    walkMinutes: number;
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

export const MOCK_STATIONS: Station[] = [
    {
        id: 'station-001',
        name: 'Trạm Hồ Hoàn Kiếm',
        address: '12 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
        distance: 180,
        walkMinutes: 3,
        lat: 21.0286,
        lng: 105.8524,
        availableVehicles: 4,
        totalVehicles: 8,
        status: 'open',
    },
    {
        id: 'station-002',
        name: 'Trạm Văn Miếu',
        address: '58 Quốc Tử Giám, Đống Đa, Hà Nội',
        distance: 650,
        walkMinutes: 9,
        lat: 21.0277,
        lng: 105.8359,
        availableVehicles: 7,
        totalVehicles: 10,
        status: 'open',
    },
    {
        id: 'station-003',
        name: 'Trạm Lăng Bác',
        address: '1 Hùng Vương, Ba Đình, Hà Nội',
        distance: 1200,
        walkMinutes: 16,
        lat: 21.0369,
        lng: 105.8341,
        availableVehicles: 2,
        totalVehicles: 6,
        status: 'open',
    },
    {
        id: 'station-004',
        name: 'Trạm Cầu Giấy',
        address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
        distance: 2400,
        walkMinutes: 30,
        lat: 21.0294,
        lng: 105.7887,
        availableVehicles: 0,
        totalVehicles: 8,
        status: 'full',
    },
    {
        id: 'station-005',
        name: 'Trạm Thủ Lệ',
        address: '36 Kim Mã, Ba Đình, Hà Nội',
        distance: 900,
        walkMinutes: 12,
        lat: 21.0291,
        lng: 105.8167,
        availableVehicles: 5,
        totalVehicles: 8,
        status: 'open',
    },
    {
        id: 'station-006',
        name: 'Trạm Bờ Hồ Nam',
        address: '3 Lê Thái Tổ, Hoàn Kiếm, Hà Nội',
        distance: 320,
        walkMinutes: 5,
        lat: 21.0276,
        lng: 105.8527,
        availableVehicles: 3,
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
        stationId: 'station-001',
        type: 'moped',
        model: 'Pega NewTech Pro',
        batteryPercent: 22,
        estimatedRangeKm: 13,
        pricePerMinute: 1800,
        status: 'available',
        slotNumber: 'C1',
        lastCharged: '20:00 hôm qua',
    },
    {
        id: 'vehicle-005',
        stationId: 'station-001',
        type: 'scooter',
        model: 'VinFast Theon',
        batteryPercent: 3,
        estimatedRangeKm: 2,
        pricePerMinute: 1500,
        status: 'available',
        slotNumber: 'A3',
        lastCharged: '18:00 hôm qua',
    },
    {
        id: 'vehicle-006',
        stationId: 'station-002',
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