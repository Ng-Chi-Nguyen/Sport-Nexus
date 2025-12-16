import prisma from "../../db/prisma.js";
import { checkExistKey } from "../../utils/checkExistKey.utils.js";

const userAddressService = {
    createUserAddress: async (userAddressData) => {
        let { recipient_name, recipient_phone, location_data, detail_address, is_default, type, user_id } = userAddressData;

        await checkExistKey('id', user_id, 'users');

        if (is_default === true) {
            try {
                let newUserAddress = await prisma.$transaction([
                    prisma.userAddresses.updateMany({
                        where: {
                            user: { connect: { id: user_id } },
                            is_default: true,
                        },
                        data: {
                            is_default: false,
                        },
                    }),

                    prisma.userAddresses.create({
                        data: {
                            recipient_name: recipient_name,
                            recipient_phone: recipient_phone,
                            location_data: location_data,
                            detail_address: detail_address,
                            is_default: true,
                            type: type,
                            user_id: user_id
                        },
                    })
                ]);

                return newUserAddress;

            } catch (error) {
                console.error("Lỗi khi tạo địa chỉ và quản lý mặc định:", error);
                throw new Error("Không thể tạo địa chỉ và quản lý trạng thái mặc định.");
            }
        } else {
            let newUserAddress = await prisma.userAddresses.create({
                data: {
                    recipient_name: recipient_name,
                    recipient_phone: recipient_phone,
                    location_data: location_data,
                    detail_address: detail_address,
                    is_default: is_default || false,
                    type: type,
                    user_id: user_id
                },
            });
            return newUserAddress;
        }
    },

    getUserAddressId: async (addressId) => {
        let userAddress = await prisma.userAddresses.findUnique({
            where: { id: addressId }
        })
        return userAddress;
    },

    getUserAddressByUserId: async (userId) => {
        let userAddresses = await prisma.userAddresses.findMany({
            where: { user_id: userId }
        })
        return userAddresses;
    },

    updateUserAddress: async (addressId, dataUpdate) => {
        let currentAddress = await prisma.userAddresses.findUnique({
            where: { id: addressId },
            select: { location_data: true }
        });

        if (!currentAddress) {
            throw new Error("Không tìm thấy địa chỉ.");
        }

        let dataToUpdate = { ...dataUpdate };

        if (dataUpdate.location_data) {
            let oldLocationData = currentAddress.location_data || {};

            let mergedLocationData = {
                province: { ...oldLocationData.province, ...dataUpdate.location_data.province },
                district: { ...oldLocationData.district, ...dataUpdate.location_data.district },
                ward: { ...oldLocationData.ward, ...dataUpdate.location_data.ward },
            };

            dataToUpdate.location_data = mergedLocationData;
        }

        let updatedAddress = await prisma.userAddresses.update({
            where: { id: addressId },
            data: dataToUpdate,
        });

        return updatedAddress;
    },

    deleteUserAddress: async (addressId) => {
        await checkExistKey("id", addressId, "userAddresses")
        await prisma.userAddresses.delete({ where: { id: addressId } })
    }
};

export default userAddressService;