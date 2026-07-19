import prisma from "../../db/prisma.js";

const logService = {
  create: async ({ userId, actionType, entityType, entityId, status, details, ipAddress }) => {
    return prisma.SystemLogs.create({
      data: {
        user_id: userId,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        status,
        details: details || [],
        ip_address: ipAddress || null,
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar: true },
        },
      },
    });
  },

  getAll: async ({ page = 1, limit = 20, userId, actionType, entityType, status, from, to, ipAddress, search } = {}) => {
    const where = {};
    if (userId) where.user_id = parseInt(userId);
    if (actionType) where.action_type = actionType;
    if (entityType) where.entity_type = entityType;
    if (status) where.status = status;
    if (ipAddress) where.ip_address = { contains: ipAddress };
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.SystemLogs.findMany({
        where,
        include: {
          user: {
            select: { id: true, full_name: true, email: true, avatar: true },
          },
        },
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.SystemLogs.count({ where }),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  },

  getById: async (id) => {
    return prisma.SystemLogs.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar: true },
        },
      },
    });
  },
};

export default logService;
