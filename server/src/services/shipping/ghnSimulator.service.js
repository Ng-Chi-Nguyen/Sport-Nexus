import prisma from "../../db/prisma.js";
import {
    SHOP_PROVINCE,
    REGION_BASE_FEE,
    REGION_ESTIMATE_DAYS,
    WEIGHT_TIERS,
    EXTRA_KG_FEE,
    ECONOMY_DISCOUNT,
    COD_FEE_RATE,
    COD_FEE_MIN,
    INSURANCE_FEE_RATE,
    resolveZone,
} from "./shippingZone.data.js";

export const SHIPMENT_STATUS = {
    RECEIVED: "RECEIVED",
    PICKED_UP: "PICKED_UP",
    IN_TRANSIT: "IN_TRANSIT",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
};

export const STATUS_LABELS = {
    RECEIVED: "Đã tiếp nhận đơn",
    PICKED_UP: "Đã lấy hàng",
    IN_TRANSIT: "Đang vận chuyển",
    OUT_FOR_DELIVERY: "Đang giao",
    DELIVERED: "Đã giao thành công",
    CANCELLED: "Đã huỷ",
};

// Số giờ trôi qua để đạt từng mốc theo vùng (FAST). ECONOMY nhân hệ số 1.6.
const ZONE_HOURS = {
    same: { pickup: 1, transit: 3, out_for_delivery: 6, delivered: 10 },
    north: { pickup: 1, transit: 4, out_for_delivery: 8, delivered: 14 },
    central: { pickup: 2, transit: 8, out_for_delivery: 16, delivered: 26 },
    south: { pickup: 2, transit: 12, out_for_delivery: 24, delivered: 40 },
};

const ECONOMY_TIME_FACTOR = 1.6;

// Lấy cước theo nấc khối lượng
const weightFee = (grams) => {
    const g = Math.max(1, Number(grams) || 0);
    const tier = WEIGHT_TIERS.find((t) => g <= t.max);
    if (tier) return tier.fee;
    const base = WEIGHT_TIERS[WEIGHT_TIERS.length - 1];
    const extraKg = Math.ceil((g - base.max) / 1000);
    return base.fee + extraKg * EXTRA_KG_FEE;
};

// Tính phí vận chuyển giả lập. Trả về bảng phân tích phí.
export const calculateFee = ({
    provinceName = SHOP_PROVINCE,
    weightGrams = 500,
    serviceType = "FAST",
    codAmount = 0,
    itemValue = 0,
} = {}) => {
    const zone = resolveZone(provinceName);
    const type = serviceType === "ECONOMY" ? "ECONOMY" : "FAST";

    const baseRegionFee = REGION_BASE_FEE[zone] || REGION_BASE_FEE.south;
    const tierWeightFee = weightFee(weightGrams);

    let shippingFee = baseRegionFee + tierWeightFee;
    if (type === "ECONOMY") shippingFee = Math.round(shippingFee * ECONOMY_DISCOUNT);

    const cod = Math.max(0, Number(codAmount) || 0);
    const codFee = cod > 0 ? Math.max(COD_FEE_MIN, Math.round(cod * COD_FEE_RATE)) : 0;
    const insuranceFee = Math.round((Math.max(0, Number(itemValue) || 0)) * INSURANCE_FEE_RATE);

    const totalFee = shippingFee + codFee + insuranceFee;

    return {
        zone,
        shippingFee,
        codFee,
        insuranceFee,
        totalFee,
        estimateDays: REGION_ESTIMATE_DAYS[zone][type],
        weightGrams,
        serviceType: type,
    };
};

// Sinh mã vận đơn kiểu GHN: SN + 10 chữ số
export const generateTrackingCode = () => {
    const rand = Math.floor(Math.random() * 1e10).toString().padStart(10, "0");
    return `SN${rand}`;
};

// Dựng timeline các mốc từ thời điểm tạo đơn
export const buildTimeline = (zone, serviceType, fromTime = new Date()) => {
    const type = serviceType === "ECONOMY" ? "ECONOMY" : "FAST";
    const hours = ZONE_HOURS[zone] || ZONE_HOURS.south;
    const factor = type === "ECONOMY" ? ECONOMY_TIME_FACTOR : 1;
    const at = (h) => new Date(fromTime.getTime() + Math.round(h * factor) * 3600 * 1000);

    return [
        { time: fromTime, status: SHIPMENT_STATUS.RECEIVED, note: "Đơn hàng đã được tiếp nhận" },
        { time: at(hours.pickup), status: SHIPMENT_STATUS.PICKED_UP, note: "Nhân viên đã lấy hàng" },
        { time: at(hours.transit), status: SHIPMENT_STATUS.IN_TRANSIT, note: "Hàng đang được vận chuyển" },
        { time: at(hours.out_for_delivery), status: SHIPMENT_STATUS.OUT_FOR_DELIVERY, note: "Hàng đang được giao tới người nhận" },
        { time: at(hours.delivered), status: SHIPMENT_STATUS.DELIVERED, note: "Giao hàng thành công" },
    ];
};

// Tính trạng thái hiện tại + timeline theo thời gian thực (giả lập từng giờ trôi qua)
export const computeShipmentState = (shipment) => {
    const now = new Date();
    const created = new Date(shipment.created_at);
    const timeline = buildTimeline(resolveZone(shipment.province_name), shipment.service_type, created);

    if (shipment.status === SHIPMENT_STATUS.CANCELLED) {
        return { status: SHIPMENT_STATUS.CANCELLED, timeline, deliveredAt: shipment.delivered_at };
    }

    let current = SHIPMENT_STATUS.RECEIVED;
    let deliveredAt = null;

    for (const step of timeline) {
        if (now >= step.time) {
            current = step.status;
            if (step.status === SHIPMENT_STATUS.DELIVERED) deliveredAt = step.time;
        }
    }

    return { status: current, timeline, deliveredAt };
};

// Đồng bộ trạng thái theo thời gian thực xuống DB (nếu đã thay đổi)
export const syncShipmentState = async (id) => {
    const shipment = await prisma.shipments.findUnique({ where: { id: Number(id) } });
    if (!shipment) return null;

    const { status, timeline, deliveredAt } = computeShipmentState(shipment);

    if (shipment.status === status && shipment.delivered_at === deliveredAt) {
        return shipment;
    }

    return prisma.shipments.update({
        where: { id: shipment.id },
        data: {
            status,
            timeline,
            delivered_at: deliveredAt || null,
        },
    });
};

// Tạo vận đơn giả lập gắn với 1 đơn hàng đã có
export const createShipmentForOrder = async ({ order, data, client = prisma }) => {
    const {
        recipient_name,
        recipient_phone,
        province_name,
        ward_name,
        detail_address,
        weight_grams = 500,
        service_type = "FAST",
    } = data;

    const zone = resolveZone(province_name);
    const codAmount =
        order.payment_method === "COD" ? Number(order.final_amount) || 0 : 0;

    const fee = calculateFee({
        provinceName: province_name,
        weightGrams: weight_grams,
        serviceType: service_type,
        codAmount,
        itemValue: Number(order.final_amount) || 0,
    });

    const estimatedDelivery = new Date(
        Date.now() + fee.estimateDays * 24 * 3600 * 1000,
    );

    const timeline = buildTimeline(zone, service_type, new Date());

    return client.shipments.create({
        data: {
            order_id: order.id,
            tracking_code: generateTrackingCode(),
            service_type: fee.serviceType,
            status: SHIPMENT_STATUS.RECEIVED,
            weight_grams: fee.weightGrams,
            cod_amount: codAmount,
            shipping_fee: fee.shippingFee,
            cod_fee: fee.codFee,
            insurance_fee: fee.insuranceFee,
            total_fee: fee.totalFee,
            estimated_delivery: estimatedDelivery,
            recipient_name,
            recipient_phone,
            province_name,
            ward_name,
            detail_address,
            timeline,
        },
    });
};

export default {
    calculateFee,
    generateTrackingCode,
    buildTimeline,
    computeShipmentState,
    syncShipmentState,
    createShipmentForOrder,
};