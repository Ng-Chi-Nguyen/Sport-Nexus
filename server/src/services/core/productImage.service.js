import prisma from "../../db/prisma.js";

const productImageService = {
    createProductImage: async (uploadedUrls, product_id) => {
        // let { product_id } = dataProductImg;
        const dbPromises = [];
        uploadedUrls.forEach((url) => {
            const promise = prisma.productImages.create({
                data: {
                    product: { connect: { id: product_id } },
                    url: url,
                }
            });

            dbPromises.push(promise);
        });

        // Chờ tất cả các bản ghi DB được tạo thành công
        const createdImages = await Promise.all(dbPromises);

        return createdImages;
    }
}

export default productImageService;